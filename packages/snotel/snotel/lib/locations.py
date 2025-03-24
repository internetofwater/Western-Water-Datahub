# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from com.cache import RedisCache
from com.env import TRACER
from com.geojson.types import GeojsonFeature, GeojsonFeatureCollectionDict
from com.helpers import await_, parse_bbox, parse_z
import geojson_pydantic
import geojson_pydantic.types
from rise.lib.types.helpers import ZType
from snotel.lib.types import StationDTO
import shapely
from typing import Optional, assert_never


class LocationCollection:
    """A wrapper class containing locations and methods to filter them"""

    locations: list[StationDTO]

    def __init__(self):
        self.cache = RedisCache()
        # snotel also proxies usgs so we just want to get SNOTEL stations
        JUST_SNOTEL_STATIONS = "*:*:SNTL"
        result = await_(
            self.cache.get_or_fetch(
                f"https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?activeOnly=true&stationTriplets={JUST_SNOTEL_STATIONS}"
            )
        )
        self.locations = [StationDTO.model_validate(res) for res in result]

    def drop_all_locations_but_id(self, location_id: str):
        data = [v for v in self.locations if v.stationId == str(location_id)]
        self.locations = data
        return self

    def drop_after_limit(self, limit: int):
        """
        Return only the location data for the locations in the list up to the limit
        """
        self.locations = self.locations[:limit]
        return self

    def drop_before_offset(self, offset: int):
        """
        Return only the location data for the locations in the list after the offset
        """
        self.locations = self.locations[offset:]
        return self

    def drop_all_locations_outside_bounding_box(self, bbox):
        geometry, z = parse_bbox(bbox)
        return self._filter_by_geometry(geometry, z)

    def to_geojson(
        self, skip_geometry: Optional[bool] = False, itemsIDSingleFeature=False
    ) -> GeojsonFeatureCollectionDict | GeojsonFeature:
        """
        Return a geojson feature if the client queried for items/{itemId} or a feature collection if they queried for items/ even if the result is only one item
        """
        features: list[GeojsonFeature] = []

        for loc in self.locations:
            feature: GeojsonFeature = {
                "type": "Feature",
                "properties": loc.model_dump(exclude={"latitude", "longitude"}),
                "geometry": {
                    "type": "Point",
                    "coordinates": [loc.longitude, loc.latitude],
                }
                if not skip_geometry
                else None,
                "id": loc.stationId,
            }
            features.append(feature)

        geojson_pydantic.FeatureCollection(
            type="FeatureCollection",
            features=[geojson_pydantic.Feature.model_validate(f) for f in features],
        )
        if itemsIDSingleFeature:
            assert len(features) == 1, (
                "The user queried a single item but we have more than one present. This is a sign that filtering by locationid wasn't done properly"
            )
            return features[0]
        return {
            "type": "FeatureCollection",
            "features": features,
        }

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
            elevation = v.elevation

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
                if v.latitude is None or v.longitude is None:
                    indices_to_pop.add(i)
                    continue

                locationPoint = shapely.geometry.point.Point(
                    # need to convert the pydantic model to a simple
                    # dict to use shapely with it
                    [v.longitude, v.latitude]
                )

                if not geometry.contains(locationPoint):
                    indices_to_pop.add(i)

        # by reversing the list we pop from the end so the
        # indices will be in the correct even after removing items
        for i in sorted(indices_to_pop, reverse=True):
            self.locations.pop(i)

        return self
