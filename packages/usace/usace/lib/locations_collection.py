# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import asyncio
from typing import Optional, cast, assert_never
from com.cache import RedisCache
from com.env import TRACER
from com.geojson.helpers import (
    GeojsonFeatureCollectionDict,
    GeojsonFeatureDict,
    SortDict,
    all_properties_found_in_feature,
    filter_out_properties_not_selected,
    sort_by_properties_in_place,
)
from com.helpers import (
    EDRFieldsMapping,
    OAFFieldsMapping,
    await_,
    parse_z,
)
from com.protocols.locations import LocationCollectionProtocolWithEDR
import geojson_pydantic
import orjson
from com.covjson import CoverageCollectionDict
from rise.lib.types.helpers import ZType
import shapely
from geojson_pydantic.types import Position2D
from usace.lib.types.geojson_response import Feature, FeatureCollection
from com.helpers import parse_date
from com.protocols.covjson import CovjsonBuilderProtocol
from covjson_pydantic.parameter import Parameter
from covjson_pydantic.unit import Unit
from covjson_pydantic.observed_property import ObservedProperty
from usace.lib.types.geojson_response import TimeseriesParameter
from covjson_pydantic.domain import Domain, Axes, ValuesAxis, DomainType
from covjson_pydantic.ndarray import NdArrayFloat
from covjson_pydantic.reference_system import (
    ReferenceSystemConnectionObject,
    ReferenceSystem,
)
from covjson_pydantic.coverage import Coverage, CoverageCollection


class LocationCollection(LocationCollectionProtocolWithEDR):
    locations: list[Feature]

    def __init__(self):
        self.cache = RedisCache()
        url = "https://water.sec.usace.army.mil/cda/reporting/providers/projects?fmt=geojson"

        res = await_(self.cache.get_or_fetch_response_text(url))
        fc = FeatureCollection.model_validate(
            {
                "type": "FeatureCollection",
                "features": orjson.loads(res),
            }
        )
        for feature in fc.features:
            assert feature.properties
            feature.id = str(feature.properties.location_code)
            feature.properties.name = feature.properties.public_name
        self.locations = fc.features

    def to_geojson(
        self,
        itemsIDSingleFeature: bool = False,
        skip_geometry: Optional[bool] = False,
        select_properties: Optional[list[str]] = None,
        properties: Optional[list[tuple[str, str]]] = [],
        fields_mapping: EDRFieldsMapping | OAFFieldsMapping = {},
        sortby: Optional[list[SortDict]] = None,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        features_to_keep: list[geojson_pydantic.Feature] = []

        for feature in self.locations:
            serialized_feature = geojson_pydantic.Feature(
                type="Feature",
                id=feature.id,
                properties=feature.properties.model_dump(),
                geometry=geojson_pydantic.Point(
                    type="Point",
                    coordinates=Position2D(
                        feature.geometry.coordinates[0], feature.geometry.coordinates[1]
                    ),
                )
                if not skip_geometry
                else None,
            )

            if properties:
                # narrow the FieldsMapping type here manually since properties is a query arg for oaf and thus we know that OAFFieldsMapping must be used
                fields_mapping = cast(OAFFieldsMapping, fields_mapping)
                if not all_properties_found_in_feature(
                    serialized_feature, properties, fields_mapping
                ):
                    continue
            if select_properties:
                filter_out_properties_not_selected(
                    serialized_feature, select_properties
                )

            features_to_keep.append(serialized_feature)

        if sortby:
            sort_by_properties_in_place(features_to_keep, sortby)

        if itemsIDSingleFeature:
            assert len(self.locations) == 1
            return cast(GeojsonFeatureDict, features_to_keep[0].model_dump())
        return cast(
            GeojsonFeatureCollectionDict,
            geojson_pydantic.FeatureCollection(
                type="FeatureCollection", features=features_to_keep
            ).model_dump(exclude_unset=True),
        )

    @TRACER.start_as_current_span("geometry_filter")
    def _filter_by_geometry(
        self,
        geometry: Optional[shapely.geometry.base.BaseGeometry],
        # Vertical level
        z: Optional[str] = None,
    ):
        """
        Filter a list of locations by any arbitrary geometry; if they are not inside of it, drop their data
        """
        indices_to_pop = set()
        parsed_z = parse_z(str(z)) if z else None

        for i, v in enumerate(self.locations):
            elevation = v.properties.elevation

            if elevation is None:
                indices_to_pop.add(i)
                continue

            if parsed_z:
                match parsed_z:
                    case [ZType.RANGE, x]:
                        if elevation < x[0] or elevation > x[1]:
                            indices_to_pop.add(i)
                    case [ZType.SINGLE, x]:
                        if elevation != x[0]:
                            indices_to_pop.add(i)
                    case [ZType.ENUMERATED_LIST, x]:
                        if elevation not in x:
                            indices_to_pop.add(i)
                    case _:
                        assert_never(parsed_z)

            if geometry:
                assert v.geometry

                if all([coord is None for coord in v.geometry.coordinates]):
                    indices_to_pop.add(i)
                    continue

                locationPoint = shapely.geometry.point.Point(
                    # need to convert the pydantic model to a simple
                    # dict to use shapely with it
                    v.geometry.coordinates
                )

                if not geometry.contains(locationPoint):
                    indices_to_pop.add(i)

        # by reversing the list we pop from the end so the
        # indices will be in the correct even after removing items
        for i in sorted(indices_to_pop, reverse=True):
            self.locations.pop(i)

    def drop_outside_of_geometry(self, geometry):
        return self._filter_by_geometry(geometry)

    def to_covjson(
        self,
        fieldMapper: EDRFieldsMapping,
        datetime_: Optional[str],
        select_properties: Optional[list[str]],
    ) -> CoverageCollectionDict:
        return CovjsonBuilder(self, datetime_).render()

    def drop_all_locations_but_id(self, location_id: str):
        self.locations = [loc for loc in self.locations if loc.id == location_id]
        assert len(self.locations) == 1

    def get_fields(self) -> EDRFieldsMapping:
        fields: EDRFieldsMapping = {}
        for location in self.locations:
            params = location.properties.timeseries
            if not params:
                continue
            for param in params:
                fields[param.tsid] = {
                    "title": param.label,
                    "type": "string",
                    "description": f"{param.label} ({param.unit_long_name}) with id {param.tsid}",
                    "x-ogc-unit": param.unit,
                }
        return fields

    async def fill_all_results(self, start: str, end: str) -> None:
        tasks = []
        for location in self.locations:
            if not location.properties.timeseries:
                continue
            for param in location.properties.timeseries:
                tasks.append(
                    param.fill_results(
                        office=location.properties.provider,
                        start_date=start,
                        end_date=end,
                    )
                )

        await asyncio.gather(*tasks)


class CovjsonBuilder(CovjsonBuilderProtocol):
    def __init__(
        self, locationCollection: LocationCollection, datetime_: Optional[str]
    ):
        self.locationCollection = locationCollection
        if datetime_:
            parsed = parse_date(datetime_)
            if isinstance(parsed, tuple) and len(parsed) == 2:
                start, end = parsed
            else:
                start, end = parsed, parsed
            start, end = start.isoformat(), end.isoformat()
        else:
            start, end = "1900-01-01T00:00:00.000Z", "2100-01-01T00:00:00.000Z"

        def assert_results_not_yet_filled():
            for loc in self.locationCollection.locations:
                if not loc.properties.timeseries:
                    continue
                for param in loc.properties.timeseries:
                    if param.results is not None:
                        raise Exception("results already filled")

        assert_results_not_yet_filled()

        await_(self.locationCollection.fill_all_results(start, end))

    def _generate_parameter(self, datastream: TimeseriesParameter):
        """Given a triple and an associated datastream, generate a covjson parameter that describes its properties and unit"""

        param = Parameter(
            type="Parameter",
            unit=Unit(symbol=datastream.unit),
            id=datastream.tsid,
            observedProperty=ObservedProperty(
                label={"en": datastream.parameter},
                id=datastream.tsid,
                description={"en": datastream.unit_long_name},
            ),
        )
        return param

    def _generate_coverage(self, datastream: TimeseriesParameter, longitude, latitude):
        assert datastream.results
        times, values = datastream.results.get_values_as_separate_lists()

        return Coverage(
            type="Coverage",
            domain=Domain(
                type="Domain",
                domainType=DomainType.point_series,
                axes=Axes(
                    t=ValuesAxis(values=times),
                    x=ValuesAxis(values=[longitude]),
                    y=ValuesAxis(values=[latitude]),
                ),
                referencing=[
                    ReferenceSystemConnectionObject(
                        coordinates=["x", "y"],
                        system=ReferenceSystem(
                            type="GeographicCRS",
                            id="http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                        ),
                    ),
                    ReferenceSystemConnectionObject(
                        coordinates=["t"],
                        system=ReferenceSystem(
                            type="TemporalRS",
                            id="http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                        ),
                    ),
                ],
            ),
            ranges={
                datastream.tsid: NdArrayFloat(
                    shape=[len(datastream.results.values)],
                    values=list[float | None](values),
                    axisNames=["t"],
                ),
            },
        )

    def render(self) -> CoverageCollectionDict:
        """
        Return a covjson response
        """
        coverages: list[Coverage] = []
        parameters: dict[str, Parameter] = {}

        for loc in self.locationCollection.locations:
            if not loc.properties.timeseries:
                continue
            for param in loc.properties.timeseries:
                longitude, latitude = loc.geometry.coordinates
                cov = self._generate_coverage(param, longitude, latitude)
                coverages.append(cov)
                parameters[param.tsid] = self._generate_parameter(param)

        covCol = CoverageCollection(
            coverages=coverages,
            domainType=DomainType.point_series,
            parameters=parameters,
        )
        return cast(
            CoverageCollectionDict, covCol.model_dump(by_alias=True, exclude_none=True)
        )  # pydantic covjson must dump with exclude none
