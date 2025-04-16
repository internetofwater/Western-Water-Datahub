# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Protocol

from typing import Optional
from com.geojson.helpers import (
    GeojsonFeatureCollectionDict,
    GeojsonFeatureDict,
    SortDict,
)
from com.covjson import CoverageCollectionDict
from com.helpers import EDRFieldsMapping, OAFFieldsMapping, parse_bbox
import shapely
import shapely.wkt

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
        geometry: Optional[shapely.geometry.base.BaseGeometry],
        # Vertical level
        z: Optional[str] = None,
    ) -> None: ...

    def to_geojson(
        self,
        itemsIDSingleFeature=False,
        skip_geometry: Optional[bool] = False,
        select_properties: Optional[list[str]] = None,
        properties: Optional[list[tuple[str, str]]] = None,
        fields_mapping: EDRFieldsMapping | OAFFieldsMapping = {},
        sortby: Optional[list[SortDict]] = None,
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

    def drop_outside_of_wkt(
        self, wkt: Optional[str] = None, z: Optional[str] = None
    ) -> None:
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

    def select_properties(self, properties: Optional[list[tuple[str, str]]]) -> None:
        """
        The EDR select properties filter
        """
        ...

    def to_covjson(
        self,
        fieldMapper: EDRFieldsMapping,
        datetime_: Optional[str],
        select_properties: Optional[list[str]],
    ) -> CoverageCollectionDict: ...
