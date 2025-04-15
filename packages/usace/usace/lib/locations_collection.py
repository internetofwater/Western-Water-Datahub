# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

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
    parse_bbox,
    parse_z,
)
import geojson_pydantic
import orjson
from rise.lib.covjson.types import CoverageCollectionDict
from rise.lib.types.helpers import ZType
import shapely
from usace.lib.types.geojson_response import FeatureCollection
import shapely.wkt
from geojson_pydantic.types import Position2D


class LocationCollection:
    def __init__(self):
        self.cache = RedisCache()
        url = "https://water.sec.usace.army.mil/cda/reporting/providers/projects?fmt=geojson"

        res = await_(self.cache.get_or_fetch_response_text(url))
        self.fc = FeatureCollection.model_validate(
            {
                "type": "FeatureCollection",
                "features": orjson.loads(res),
            }
        )
        for loc in self.fc.features:
            loc.id = str(loc.properties.location_code)
            loc.properties.name = loc.properties.public_name

    def to_geojson(
        self,
        itemsIDSingleFeature,
        skip_geometry: Optional[bool] = False,
        select_properties: Optional[list[str]] = None,
        properties: list[tuple[str, str]] = [],
        fields_mapping: EDRFieldsMapping | OAFFieldsMapping = {},
        sortby: Optional[list[SortDict]] = None,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        features_to_keep: list[geojson_pydantic.Feature] = []

        for feature in self.fc.features:
            serialized_feature = geojson_pydantic.Feature(
                type="Feature",
                id=feature.id,
                properties=feature.properties,
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
            assert len(self.fc.features) == 1
            return cast(GeojsonFeatureDict, self.fc.features[0].model_dump())
        return cast(GeojsonFeatureCollectionDict, self.fc.model_dump())

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

        for i, v in enumerate(self.fc.features):
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
            self.fc.features.pop(i)

        return self

    def drop_outside_of_wkt(
        self,
        wkt: Optional[str] = None,
        z: Optional[str] = None,
    ):
        """Filter a location by the well-known-text geometry representation"""
        parsed_geo = shapely.wkt.loads(str(wkt)) if wkt else None
        return self._filter_by_geometry(parsed_geo, z)

    def drop_outside_of_bbox(self, bbox, z=None):
        if bbox:
            parse_result = parse_bbox(bbox)
            shapely_box = parse_result[0] if parse_result else None
            z = parse_result[1] if parse_result else z

        shapely_box = parse_bbox(bbox)[0] if bbox else None
        # TODO what happens if they specify both a bbox with z and a z value?
        z = parse_bbox(bbox)[1] if bbox else z

        return self._filter_by_geometry(shapely_box, z)

    def drop_outside_of_geometry(self, geometry):
        return self._filter_by_geometry(geometry)

    def to_covjson(self) -> CoverageCollectionDict:
        raise NotImplementedError

    def drop_after_limit(self, limit: int):
        """
        Return only the location data for the locations in the list up to the limit
        """
        self.fc.features = self.fc.features[:limit]
        return self

    def drop_before_offset(self, offset: int):
        """
        Return only the location data for the locations in the list after the offset
        """
        self.fc.features = self.fc.features[offset:]
        return self

    def drop_all_locations_but_id(self, location_id: str):
        self.fc.features = [loc for loc in self.fc.features if loc.id == location_id]
        assert len(self.fc.features) == 1

    def get_fields(self) -> EDRFieldsMapping:
        fields: EDRFieldsMapping = {}
        for location in self.fc.features:
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
