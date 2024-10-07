from copy import deepcopy
import datetime
import json
import logging
from typing import Optional
import shapely.wkt
from typing_extensions import assert_never

import shapely  # type: ignore

from pygeoapi.provider.base import (
    ProviderQueryError,
)
import asyncio

from rise.custom_types import (
    JsonPayload,
    LocationResponse,
    Url,
    ZType,
)
from rise.cache import RISECache
from rise.lib import get_trailing_id, parse_bbox, parse_date, parse_z, safe_run_async


LOGGER = logging.getLogger(__name__)


locationId = str
catalogItemEndpoint = str


class LocationHelper:
    @staticmethod
    def get_catalogItemURLs(
        location_response: LocationResponse,
    ) -> dict[locationId, list[catalogItemEndpoint]]:
        lookup: dict[str, list[str]] = {}
        if not isinstance(location_response["data"], list):
            # make sure it's a list for iteration purposes
            location_response["data"] = [location_response["data"]]

        for loc in location_response["data"]:
            id: str = loc["id"]
            locationNumber = id.removeprefix("/rise/api/location/")
            items = []

            try:
                for catalogItem in loc["relationships"]["catalogItems"]["data"]:
                    items.append("https://data.usbr.gov" + catalogItem["id"])

                lookup[locationNumber] = items
            except KeyError:
                LOGGER.error(f"Missing key for catalog item {id} in {loc}")
                # location 3396 and 3395 always return failure
                # and 5315 and 5316 are locations which don't have catalogItems
                # for some reason
                lookup[locationNumber] = []

        return lookup

    locationId = str
    paramIdList = list[str | None]

    @staticmethod
    def get_parameters(
        allLocations: LocationResponse,
        cache: RISECache,
    ) -> dict[locationId, paramIdList]:
        locationsToCatalogItemURLs = LocationHelper.get_catalogItemURLs(allLocations)

        locationToParams: dict[str, list[str | None]] = {}

        async def get_all_params_for_location(location, catalogItems):
            # Map a location to a list of catalog item responses
            urlItemMapper: dict[str, dict] = await cache.get_or_fetch_group(
                catalogItems
            )

            try:
                allParams = []

                for item in urlItemMapper.values():
                    if item is not None:
                        res = CatalogItem.get_parameter(item)
                        if res is not None:
                            allParams.append(res["id"])

            except KeyError:
                with open("rise/tests/data/debug.json", "w") as f:
                    json.dump(urlItemMapper, f)
                raise ProviderQueryError("Could not get parameters")

            # drop all empty params
            allParams = list(filter(lambda x: x is not None, allParams))
            return location, allParams

        async def gather_parameters():
            """Asynchronously fetch all parameters for all locations"""
            tasks = [
                get_all_params_for_location(location, catalogItemURLs)
                for location, catalogItemURLs in locationsToCatalogItemURLs.items()
            ]
            results = await asyncio.gather(*tasks)
            return {location: params for location, params in results}

        locationToParams = safe_run_async(gather_parameters())

        # should have the same number of locations in each
        assert len(locationToParams) == len(locationsToCatalogItemURLs)
        return locationToParams

    @staticmethod
    def drop_location(response: LocationResponse, location_id: int) -> LocationResponse:
        new = response.copy()

        filtered_locations = [
            loc for loc in response["data"] if loc["attributes"]["_id"] != location_id
        ]

        new.update({"data": filtered_locations})

        return new

    @staticmethod
    def filter_by_properties(
        response: LocationResponse, select_properties: list[str] | str, cache: RISECache
    ) -> LocationResponse:
        """Filter a location by a list of properties. NOTE you can also do this directly in RISE. Make sure you actually need this and can't fetch up front."""
        list_of_properties: list[str] = (
            [select_properties]
            if isinstance(select_properties, str)
            else select_properties
        )

        locationsToParams = LocationHelper.get_parameters(response, cache)
        for param in list_of_properties:
            for location, paramList in locationsToParams.items():
                if param not in paramList:
                    response = LocationHelper.drop_location(response, int(location))

        return response

    @staticmethod
    def filter_by_date(
        location_response: LocationResponse, datetime_: str
    ) -> LocationResponse:
        """
        Filter by date
        """
        if not location_response["data"][0]["attributes"]:
            raise ProviderQueryError("Can't filter by date")

        filteredResp = location_response.copy()

        parsed_date: list[datetime.datetime] = parse_date(datetime_)

        if len(parsed_date) == 2:
            start, end = parsed_date

            for i, location in enumerate(filteredResp["data"]):
                updateDate = datetime.datetime.fromisoformat(
                    location["attributes"]["updateDate"]
                )
                if updateDate < start or updateDate > end:
                    filteredResp["data"].pop(i)

        elif len(parsed_date) == 1:
            parsed_date_str = str(parsed_date[0])
            filteredResp["data"] = [
                location
                for location in filteredResp["data"]
                if str(location["attributes"]["updateDate"]).startswith(parsed_date_str)
            ]

        else:
            raise ProviderQueryError(
                "datetime_ must be a date or date range with two dates separated by '/' but got {}".format(
                    datetime_
                )
            )

        return filteredResp

    @staticmethod
    def filter_by_wkt(
        location_response: LocationResponse,
        wkt: Optional[str] = None,
        z: Optional[str] = None,
    ) -> LocationResponse:
        parsed_geo = shapely.wkt.loads(str(wkt)) if wkt else None
        return LocationHelper._filter_by_geometry(location_response, parsed_geo, z)

    @staticmethod
    def filter_by_bbox(
        location_response: LocationResponse,
        bbox: Optional[list] = None,
        z: Optional[str] = None,
    ) -> LocationResponse:
        if bbox:
            parse_result = parse_bbox(bbox)
            shapely_box = parse_result[0] if parse_result else None
            z = parse_result[1] if parse_result else z

        shapely_box = parse_bbox(bbox)[0] if bbox else None
        # TODO what happens if they specify both a bbox with z and a z value?
        z = parse_bbox(bbox)[1] if bbox else z

        return LocationHelper._filter_by_geometry(location_response, shapely_box, z)

    @staticmethod
    def _filter_by_geometry(
        location_response: LocationResponse,
        geometry: Optional[shapely.geometry.base.BaseGeometry],
        # Vertical level
        z: Optional[str] = None,
    ) -> LocationResponse:
        # need to deep copy so we don't change the dict object
        copy_to_return = deepcopy(location_response)
        indices_to_pop = set()
        parsed_z = parse_z(str(z)) if z else None

        for i, v in enumerate(location_response["data"]):
            try:
                elevation = int(float(v["attributes"]["elevation"]))  # type: ignore
            except (ValueError, TypeError):
                LOGGER.error(f"Invalid elevation {v} for location {i}")
                elevation = None

            if parsed_z:
                if elevation is None:
                    indices_to_pop.add(i)
                else:
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
                            assert_never(parsed_z)  # type: ignore

            if geometry:
                result_geo = shapely.geometry.shape(
                    v["attributes"]["locationCoordinates"]  # type: ignore
                )

                if not geometry.contains(result_geo):
                    indices_to_pop.add(i)

        # by reversing the list we pop from the end so the
        # indices will be in the correct even after removing items
        for i in sorted(indices_to_pop, reverse=True):
            copy_to_return["data"].pop(i)

        return copy_to_return

    @staticmethod
    def filter_by_limit(
        location_response: LocationResponse, limit: int, inplace: bool = False
    ) -> LocationResponse:
        if not inplace:
            location_response = deepcopy(location_response)
        location_response["data"] = location_response["data"][:limit]
        return location_response

    @staticmethod
    def remove_before_offset(
        location_response: LocationResponse, offset: int, inplace: bool = False
    ):
        if not inplace:
            location_response = deepcopy(location_response)
        location_response["data"] = location_response["data"][offset:]
        return location_response

    @staticmethod
    def filter_by_id(
        location_response: LocationResponse,
        identifier: Optional[str] = None,
        inplace: bool = False,
    ) -> LocationResponse:
        if not inplace:
            location_response = deepcopy(location_response)
        location_response["data"] = [
            location
            for location in location_response["data"]
            if str(location["attributes"]["_id"]) == identifier
        ]
        return location_response

    @staticmethod
    def to_geojson(
        location_response: LocationResponse, single_feature: bool = False
    ) -> dict:
        features = []

        for location_feature in location_response["data"]:
            # z = location_feature["attributes"]["elevation"]
            # if z is not None:
            #     location_feature["attributes"]["locationCoordinates"][
            #         "coordinates"
            #     ].append(float(z))
            #     LOGGER.error(
            #         location_feature["attributes"]["locationCoordinates"]["coordinates"]
            #     )

            feature_as_geojson = {
                "type": "Feature",
                "id": location_feature["attributes"]["_id"],
                "properties": {
                    "Locations@iot.count": 1,
                    "name": location_feature["attributes"]["locationName"],
                    "id": location_feature["attributes"]["_id"],
                    "Locations": [
                        {
                            "location": location_feature["attributes"][
                                "locationCoordinates"
                            ]
                        }
                    ],
                },
                "geometry": location_feature["attributes"]["locationCoordinates"],
            }
            features.append(feature_as_geojson)
            if single_feature:
                return feature_as_geojson

        return {"type": "FeatureCollection", "features": features}

    @staticmethod
    def get_results(
        catalogItemEndpoints: list[str], cache: RISECache
    ) -> dict[Url, JsonPayload]:
        result_endpoints = [
            f"https://data.usbr.gov/rise/api/result?page=1&itemsPerPage=25&itemId={get_trailing_id(endpoint)}"
            for endpoint in catalogItemEndpoints
        ]

        fetched_result = safe_run_async(cache.get_or_fetch_group(result_endpoints))

        return fetched_result


class CatalogItem:
    @classmethod
    def get_parameter(cls, data: dict) -> dict[str, str] | None:
        try:
            parameterName = data["data"]["attributes"]["parameterName"]
            if not parameterName:
                return None

            id = data["data"]["attributes"]["parameterId"]
            # NOTE id is returned as an int but needs to be a string in order to query it
            return {"id": str(id), "name": parameterName}
        except KeyError:
            LOGGER.error(f"Could not find a parameter in {data}")
            return None
