# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import asyncio
from datetime import datetime, timezone
import json
import logging
import pathlib
from typing import Optional, Set, Tuple, cast, assert_never
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
from com.otel import otel_trace
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
from covjson_pydantic.parameter import Parameter, Parameters
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

LOGGER = logging.getLogger(__name__)

metadata_path = pathlib.Path(__file__).parent.parent / "usace_metadata.json"
with metadata_path.open() as f:
    LOGGER.info(f"Loading static USACE metadata from {metadata_path}")
    USACE_STATIC_METADATA: dict = json.load(f)


class LocationCollection(LocationCollectionProtocolWithEDR):
    locations: list[Feature]

    @otel_trace()
    def __init__(self, itemId: Optional[str] = None):
        self.cache = RedisCache()
        url = "https://water.sec.usace.army.mil/cda/reporting/providers/projects?fmt=geojson"

        res = await_(self.cache.get_or_fetch_response_text(url))

        with TRACER.start_span("pydantic_validation"):
            fc = FeatureCollection.model_validate(
                {
                    "type": "FeatureCollection",
                    "features": orjson.loads(res),
                }
            )
        features_to_keep = []

        for feature in fc.features:
            assert feature.properties
            feature.id = str(feature.properties.location_code)
            if itemId and feature.id != itemId:
                continue
            feature.properties.name = feature.properties.public_name

            nidid = feature.properties.aliases.get("NIDID")
            if not nidid:
                continue

            static_properties = USACE_STATIC_METADATA.get(nidid)
            if not static_properties:
                continue

            for prop in static_properties:
                # two properties that we know are in both
                # thus we only use the one from AccessToWater and skip the info on the
                # NID metadata
                if prop in {"name", "state"}:
                    continue
                # if there is some other type of duplicate we want to explicitly fail
                if (
                    hasattr(feature.properties, prop)
                    and getattr(feature.properties, prop) is not None
                ):
                    raise RuntimeError(f"Duplicate USACE property: {prop}")
                if prop == "averages":
                    # we explicitly set this to 2020- since the resopsus dataset
                    # aggregates in the 30 year window ending on 2020 so it
                    # needs to we effectively just compare the month and day
                    today = datetime.now(timezone.utc).strftime("2020-%m-%d")
                    for avg_date in static_properties[prop]:
                        if avg_date == today:
                            averages_data: dict = static_properties["averages"][
                                avg_date
                            ]
                            for average_type, average_value in averages_data.items():
                                assert average_type not in feature.properties, (
                                    f"Duplicate property {average_type} when trying to add averages to USACE feature"
                                )
                                setattr(feature.properties, average_type, average_value)
                            setattr(feature.properties, "hasResopsAverages", "true")
                            break
                else:
                    setattr(feature.properties, prop, static_properties[prop])

            features_to_keep.append(feature)

        self.locations = features_to_keep

    @otel_trace()
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
            assert feature.id, f"Feature {feature} is missing id"
            serialized_feature = geojson_pydantic.Feature(
                type="Feature",
                id=int(feature.id),
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

            if elevation is None and parsed_z:
                indices_to_pop.add(i)
                continue

            if parsed_z and elevation:
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

    @otel_trace()
    def to_covjson(
        self,
        fieldMapper: EDRFieldsMapping,
        datetime_: Optional[str],
        select_properties: Optional[list[str]],
    ) -> CoverageCollectionDict:
        return CovjsonBuilder(self, datetime_, select_properties).render()

    def drop_all_locations_but_id(self, location_id: str):
        self.locations = [loc for loc in self.locations if loc.id == location_id]
        assert len(self.locations) == 1

    def drop_all_locations_without_parameters(self, parameters: list[str]):
        locations_to_keep: list[Feature] = []
        for loc in self.locations:
            if not loc.properties.timeseries:
                continue
            for param in loc.properties.timeseries:
                if param.tsid in parameters:
                    locations_to_keep.append(loc)
                    break
        self.locations = locations_to_keep

    def get_fields(self) -> EDRFieldsMapping:
        """
        Return all fields used for EDR queries
        """
        # Set for running assertions against
        # We want to make sure we don't have params that are
        # the same location with
        # multiple parameters of the same category
        locationWithCategory: Set[Tuple[str, str]] = set()

        fields: EDRFieldsMapping = {}
        for location in self.locations:
            params = location.properties.timeseries
            if not params:
                continue

            assert location.id
            for param in params:
                assert (location.id, param.label) not in locationWithCategory, (
                    "There was a location with multiple parameters of the same label; this makes it ambiguous which one to use after decoding"
                )
                locationWithCategory.add((location.id, param.label))
                if param.label in fields:
                    # If the param already exists but has a different unit,
                    # that is a failure and would make the results ambiguous
                    unit = fields[param.label]["x-ogc-unit"]
                    assert unit == param.unit, (
                        f"There are two parameters with the same label {param.label} but different units thus making it ambiguous"
                    )
                else:
                    fields[param.label] = {
                        "title": param.label,
                        "description": f"{param.label}",
                        "x-ogc-unit": param.unit,
                        "type": "string",
                    }
        return fields

    async def fill_all_results(self, start: str, end: str) -> None:
        """
        For every location, go through every parameter and fill in the associated results
        """
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
        # Run all the tasks in parallel
        await asyncio.gather(*tasks)

    def select_properties(self, properties: list[str] | None) -> None:
        if not properties:
            return

        locations_to_pop: Set[int] = set()
        for i, location in enumerate(self.locations):
            if not location.properties.timeseries:
                locations_to_pop.add(i)
                continue
            params_to_pop: Set[int] = set()
            for j, param in enumerate(location.properties.timeseries):
                if param.tsid not in properties:
                    params_to_pop.add(j)

            for j in sorted(params_to_pop, reverse=True):
                location.properties.timeseries.pop(j)

            if not location.properties.timeseries:
                locations_to_pop.add(i)

        for i in sorted(locations_to_pop, reverse=True):
            self.locations.pop(i)


class CovjsonBuilder(CovjsonBuilderProtocol):
    def __init__(
        self,
        locationCollection: LocationCollection,
        datetime_: Optional[str],
        select_properties: Optional[list[str]],
    ):
        self.locationCollection = locationCollection

        locationCollection.select_properties(select_properties)

        if datetime_:
            parsed = parse_date(datetime_)
            if isinstance(parsed, tuple) and len(parsed) == 2:
                start, end = parsed
            else:
                start, end = parsed, parsed

            # Make sure the start and end are a reasonable time; if we put it too far in the future
            # the api will return nothing or error
            end = min(end, datetime.now().replace(tzinfo=timezone.utc))
            start = max(
                datetime.fromisoformat("1900-01-01").replace(tzinfo=timezone.utc), start
            )
            # Ensure both are timezone-aware and in UTC
            # We have to add the Z since the isoformat function doesn't add it
            # and otherwise causes an issue in the upstream api
            start = (
                start.astimezone(timezone.utc)
                .isoformat(timespec="milliseconds")
                .replace("+00:00", "Z")
            )
            end = (
                end.astimezone(timezone.utc)
                .isoformat(timespec="milliseconds")
                .replace("+00:00", "Z")
            )
        else:
            start = "1900-01-01T00:00:00.000Z"
            end = "2100-01-01T00:00:00.000Z"

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
            id=datastream.label,
            observedProperty=ObservedProperty(
                label={"en": datastream.parameter},
                id=datastream.label,
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
                            id="http://www.opengis.net/def/uom/ISO-8601/0/Gregorian",
                            calendar="Gregorian",
                        ),
                    ),
                ],
            ),
            ranges={
                datastream.label: NdArrayFloat(
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
                parameters[param.label] = self._generate_parameter(param)

        covCol = CoverageCollection(
            coverages=coverages,
            domainType=DomainType.point_series,
            parameters=Parameters(root=parameters),
        )
        return cast(
            CoverageCollectionDict, covCol.model_dump(by_alias=True, exclude_none=True)
        )  # pydantic covjson must dump with exclude none
