# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from datetime import datetime
import logging
from typing import Literal, Optional, assert_never, cast
from com.helpers import (
    EDRFieldsMapping,
    OAFFieldsMapping,
    parse_bbox,
    parse_date,
    parse_z,
)
from com.protocols.locations import LocationCollectionProtocol
import geojson_pydantic
from pydantic import BaseModel, field_validator
import shapely
from com.env import TRACER
from com.geojson.helpers import (
    GeojsonFeatureDict,
    GeojsonFeatureCollectionDict,
    SortDict,
    all_properties_found_in_feature,
    filter_out_properties_not_selected,
    sort_by_properties_in_place,
)
from rise.lib.helpers import (
    merge_pages,
    no_duplicates_in_pages,
)
from rise.lib.types.helpers import ZType
from rise.lib.types.includes import LocationIncluded
from rise.lib.types.location import LocationData, PageLinks
from geojson_pydantic import Feature, FeatureCollection
from pygeoapi.provider.base import ProviderItemNotFoundError

LOGGER = logging.getLogger()


class LocationResponse(BaseModel):
    """
    This class represents the top level location/ response that is returned from the API
    It is validated with pydantic on initialization and multiple methods are added to it to make it easier to manipulate data

    Once the data is validated, it is converted to a LocationCollection or LocationCollectionWithIncluded
    which contain the methods to manipulate the data. This is since pydantic limits protocol usage and other
    metaclass features
    """

    # links and pagination may not be present if there is only one location
    links: Optional[PageLinks] = None
    meta: Optional[
        dict[
            Literal["totalItems", "itemsPerPage", "currentPage"],
            int,
        ]
    ] = None
    # data represents the list of locations returned
    data: list[LocationData] = []
    included: Optional[list[LocationIncluded]] = None

    @classmethod
    @TRACER.start_as_current_span("loading_data_from_api_pages")
    def from_api_pages_with_included_catalog_items(
        cls, pages: dict[str, dict]
    ) -> "LocationCollectionWithIncluded":
        """Create a location response from multiple paged API responses by first merging them together"""
        no_duplicates_in_pages(pages)
        merged = merge_pages(pages)
        with TRACER.start_span("pydantic_validation"):
            model = cls.model_validate(merged)
            assert model.included
            return LocationCollectionWithIncluded(
                data=model.data, included=model.included
            )

    @classmethod
    @TRACER.start_as_current_span("loading_data_from_api_pages")
    def from_api_pages(cls, pages: dict[str, dict]) -> "LocationCollection":
        """Create a location response from multiple paged API responses by first merging them together"""
        no_duplicates_in_pages(pages)
        merged = merge_pages(pages)
        with TRACER.start_span("pydantic_validation"):
            model = cls.model_validate(merged)
            assert model.included
            return LocationCollection(data=model.data)

    def to_collection_with_included(self):
        assert self.included
        return LocationCollectionWithIncluded(data=self.data, included=self.included)

    def to_collection(self):
        return LocationCollection(data=self.data)

    @field_validator("data", check_fields=True, mode="before")
    @classmethod
    def ensure_list(cls, data: LocationData | list[LocationData]) -> list[LocationData]:
        """
        Data can be a list of dicts or just a dict if there is only one location;
        make sure it is always a list for consistency
        """
        if not isinstance(data, list):
            return [data]
        return data


class LocationCollection(LocationCollectionProtocol):
    """
    A collection of locations from rise with methods to filter them
    Does not include catalog item or catalog record data
    """

    locations: list[LocationData]

    def __init__(self, data: list[LocationData]):
        self.locations = data

    @TRACER.start_as_current_span("date_filter")
    def drop_outside_of_date_range(self, datetime_: str):
        """
        Filter a list of locations by date
        """
        if not self.locations[0].attributes:
            raise RuntimeError("Can't filter by date")

        location_indices_to_remove = set()

        parsed_date = parse_date(datetime_)
        if isinstance(parsed_date, tuple) and len(parsed_date) == 2:
            start, end = parsed_date

            for i, location in enumerate(self.locations):
                updateDate = datetime.fromisoformat(location.attributes.updateDate)
                if updateDate < start or updateDate > end:
                    location_indices_to_remove.add(i)

        elif isinstance(parsed_date, datetime) == 1:
            parsed_date_str = str(parsed_date)
            self.locations = [
                location
                for location in self.locations
                if location.attributes.updateDate.startswith(parsed_date_str)
            ]
            for i, location in enumerate(self.locations):
                if not location.attributes.updateDate.startswith(parsed_date_str):
                    location_indices_to_remove.add(i)

        else:
            raise RuntimeError(
                "datetime_ must be a date or date range with two dates separated by '/' but got {}".format(
                    datetime_
                )
            )

        # delete them backwards so we don't have to make a copy of the list or mess up indices while iterating
        for index in sorted(location_indices_to_remove, reverse=True):
            del self.locations[index]

        return self

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
            elevation = v.attributes.elevation

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
                result_geo = shapely.geometry.shape(
                    # need to convert the pydantic model to a simple
                    # dict to use shapely with it
                    v.attributes.locationCoordinates.model_dump()
                )

                if not geometry.contains(result_geo):
                    indices_to_pop.add(i)

        # by reversing the list we pop from the end so the
        # indices will be in the correct even after removing items
        for i in sorted(indices_to_pop, reverse=True):
            self.locations.pop(i)

    def drop_specific_location(self, location_id: int):
        """Given a location id, drop all all data that is associated with that location"""

        self.locations = [
            loc for loc in self.locations if loc.attributes.id != location_id
        ]

    def drop_all_locations_but_id(self, location_id: str):
        """Given a location id, drop all all data that is not associated with that location"""

        self.locations = [
            loc for loc in self.locations if loc.attributes.id == int(location_id)
        ]

    def drop_outside_of_bbox(
        self,
        bbox: Optional[list] = None,
        z: Optional[str] = None,
    ):
        """
        Given a bounding box filter out location data for locations that are not in the box.
        If the bbox is 4 items long it will just filter by x,y coords; if it is
        6 items long it will filter by x,y,z; If they supply a z value it will filter by z
        even if the bbox does not contain z
        """
        if bbox:
            parse_result = parse_bbox(bbox)
            shapely_box = parse_result[0] if parse_result else None
            z = parse_result[1] if parse_result else z

        shapely_box = parse_bbox(bbox)[0] if bbox else None
        # TODO what happens if they specify both a bbox with z and a z value?
        z = parse_bbox(bbox)[1] if bbox else z

        return self._filter_by_geometry(shapely_box, z)

    def to_geojson(
        self,
        itemsIDSingleFeature: bool = False,
        skip_geometry: Optional[bool] = False,
        select_properties: Optional[list[str]] = None,
        properties: Optional[list[tuple[str, str]]] = None,
        fields_mapping: OAFFieldsMapping | EDRFieldsMapping = {},
        sortby: Optional[list[SortDict]] = None,  # now treat as list[SortDict]
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        """
        Convert a list of locations to geojson
        """
        geojson_features: list[geojson_pydantic.Feature] = []

        for location_feature in self.locations:
            feature_as_geojson = {
                "type": "Feature",
                "id": location_feature.attributes.id,
                "properties": location_feature.attributes.model_dump(
                    by_alias=True, exclude={"locationCoordinates", "locationGeometry"}
                ),
                "geometry": (
                    location_feature.attributes.locationCoordinates.model_dump()
                    if not skip_geometry
                    else None
                ),
            }

            feature_as_geojson["properties"]["name"] = (
                location_feature.attributes.locationName
            )

            z = location_feature.attributes.elevation
            if z is not None:
                feature_as_geojson["properties"]["elevation"] = z

            serialized_feature = Feature.model_validate(feature_as_geojson)
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

            geojson_features.append(serialized_feature)

        if sortby:
            sort_by_properties_in_place(geojson_features, sortby)

        if itemsIDSingleFeature and len(geojson_features) == 1:
            return GeojsonFeatureDict(
                **geojson_features[0].model_dump(by_alias=True, exclude_unset=True)
            )
        elif itemsIDSingleFeature and len(geojson_features) == 0:
            raise ProviderItemNotFoundError
        else:
            validated_geojson = FeatureCollection(
                type="FeatureCollection", features=geojson_features
            )

            return GeojsonFeatureCollectionDict(
                **validated_geojson.model_dump(by_alias=True, exclude_unset=True)
            )


class LocationCollectionWithIncluded(LocationCollection):
    """
    A collection of location data from RISE with the additional data specifically returned
    with the query param, "include" This will make it so we have access to an extra "included:" key
    with links to catalogitems/catalogrecords
    """

    # included represents the additional data that is explicitly requested in the fetch request
    included: list[LocationIncluded]

    def __init__(self, data: list[LocationData], included: list[LocationIncluded]):
        super().__init__(data)
        self.included = included

    def get_catalogItemURLs(self) -> dict[str, list[str]]:
        """Get all catalog items associated with a particular location"""
        locationIdToCatalogRecords: dict[str, list[str]] = {}

        # it is possible for the `included` section of the response to have both a catalogitem, as well as
        # a catalogrecord which has the same associated catalogitem. However, it is also possible to only
        # have the catalog item. In this case, we need to keep a set so we don't add the catalogItem twice
        # for the same location
        foundCatalogItems = set()

        catalogRecordToCatalogItems: dict[str, list[str]] = {}

        # iterate through the `included` section and associate the catalogrecords with the catalogitem
        for included_item in self.included:
            # if the included item is a catalog record
            # iterate through all its associated catalogitems
            if included_item.type == "CatalogRecord":
                catalogRecord = included_item.id
                locationRelationship = included_item.relationships.location
                assert locationRelationship is not None
                locationId = locationRelationship.data[0].id
                if not locationIdToCatalogRecords.get(locationId):
                    locationIdToCatalogRecords[locationId] = []
                locationIdToCatalogRecords[locationId].append(catalogRecord)

                # if the catalogrecord doesn't have associated catalogitems, skip it
                if not included_item.relationships.catalogItems:
                    continue

                for catalogItem in included_item.relationships.catalogItems.data:
                    if catalogItem.id in foundCatalogItems:
                        continue

                    if catalogRecord not in catalogRecordToCatalogItems:
                        catalogRecordToCatalogItems[catalogRecord] = []
                    catalogRecordToCatalogItems[catalogRecord].append(catalogItem.id)
                    foundCatalogItems.add(catalogItem.id)

            # if it is a catalogitem, just get the catalogitem url directly
            elif included_item.type == "CatalogItem":
                catalogItem = included_item.id
                if catalogItem in foundCatalogItems:
                    continue

                catalogRecord = included_item.relationships.catalogRecord
                assert catalogRecord is not None, (
                    "A catalogitem should be associated with a catalogrecord in the include section"
                )
                # we use the first index since there should only be one catalog record for each catalog item
                catalogRecord = catalogRecord.data[0].id
                if catalogRecord not in catalogRecordToCatalogItems:
                    catalogRecordToCatalogItems[catalogRecord] = []
                catalogRecordToCatalogItems[catalogRecord].append(catalogItem)
                foundCatalogItems.add(catalogItem)

        # once we have the mapping of catalogrecords to catalogitems, we then need
        # to iterate over locations and join the locationId -> catalogrecord and catalogrecord -> catalogitems
        # we have to do this second iteration since locations and catalogitems are in different sections of the json
        # and we do not have guarantees that they will follow a particular order

        relevantLocations = set()
        for location in self.locations:
            relevantLocations.add(location.id)

        locationIDToCatalogItemsUrls: dict[str, list[str]] = {}
        for locationId in locationIdToCatalogRecords.keys():
            if locationId not in relevantLocations:
                continue

            for catalogRecord in locationIdToCatalogRecords[locationId]:
                if catalogRecord in catalogRecordToCatalogItems:
                    for catalogItem in catalogRecordToCatalogItems[catalogRecord]:
                        catalogItemURL = f"https://data.usbr.gov{catalogItem}"
                        if locationId not in locationIDToCatalogItemsUrls:
                            locationIDToCatalogItemsUrls[str(locationId)] = [
                                catalogItemURL
                            ]
                        else:
                            locationIDToCatalogItemsUrls[locationId].append(
                                catalogItemURL
                            )

        return locationIDToCatalogItemsUrls

    def drop_locations_without_catalogitems(self):
        """
        Filter out any locations which do not have catalogitems and thus do not have data
        """
        locationIdToCatalogItems = self.get_catalogItemURLs()
        location_indices_to_remove = set()
        for i, location in enumerate(self.locations):
            if location.id not in locationIdToCatalogItems:
                location_indices_to_remove.add(i)

        for i in sorted(location_indices_to_remove, reverse=True):
            self.locations.pop(i)

        return self

    def has_duplicate_locations(self) -> bool:
        seenLocations = set()
        for location in self.locations:
            if location.attributes.locationName in seenLocations:
                return True
            seenLocations.add(location.attributes.locationName)

        return False
