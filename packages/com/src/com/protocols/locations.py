# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Protocol

import shapely
import shapely.wkt

from com.covjson import CoverageCollectionDict
from com.geojson.helpers import (
    GeojsonFeatureCollectionDict,
    GeojsonFeatureDict,
    SortDict,
)
from com.helpers import EDRFieldsMapping, OAFFieldsMapping, parse_bbox

"""
All classes in this file provide interfaces which providers must implement;
We have this since pygeoapi does not provide typing for the providers by default
"""


class LocationCollectionProtocol(Protocol):
    """
    Represents a protocol that a group of locations must implement
    in order to be used as a location collection for filtering and
    generating OAF items responses
    """

    locations: list

    def drop_all_locations_but_id(self, location_id: str) -> None: ...
    def _filter_by_geometry(
        self,
        geometry: shapely.geometry.base.BaseGeometry | None,
        # Vertical level
        z: str | None = None,
    ) -> None: ...

    def to_geojson(
        self,
        itemsIDSingleFeature=False,
        skip_geometry: bool | None = False,
        select_properties: list[str] | None = None,
        properties: list[tuple[str, str]] | None = None,
        fields_mapping: EDRFieldsMapping | OAFFieldsMapping = {},
        sortby: list[SortDict] | None = None,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def drop_after_limit(self, limit: int) -> None:
        """
        Return only the location data for the locations in the list up to the limit
        """
        self.locations = self.locations[:limit]

    def drop_before_offset(self, offset: int) -> None:
        """
        Return only the location data for the locations in the list after the offset
        """
        self.locations = self.locations[offset:]

    def drop_outside_of_wkt(self, wkt: str | None = None, z: str | None = None) -> None:
        parsed_geo = shapely.wkt.loads(str(wkt)) if wkt else None
        return self._filter_by_geometry(parsed_geo, z)

    def drop_all_locations_outside_bounding_box(self, bbox, z=None) -> None:
        if bbox:
            parse_result = parse_bbox(bbox)
            shapely_box = parse_result[0] if parse_result else None
            z = parse_result[1] if parse_result else z

        shapely_box = parse_bbox(bbox)[0] if bbox else None
        # TODO what happens if they specify both a bbox with z and a z value?
        z = parse_bbox(bbox)[1] if bbox else z
        self._filter_by_geometry(shapely_box, z)


class LocationCollectionProtocolWithEDR(LocationCollectionProtocol):
    """
    A location collection that supports EDR and covjson transformations
    """

    def select_properties(self, properties: list[str] | None) -> None:
        """
        The EDR select properties filter
        """

    def to_covjson(
        self,
        fieldMapper: EDRFieldsMapping,
        datetime_: str | None,
        select_properties: list[str] | None,
    ) -> CoverageCollectionDict: ...
