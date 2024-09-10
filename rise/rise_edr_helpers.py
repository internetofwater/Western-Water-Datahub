from copy import deepcopy
import datetime
import json
import logging
from typing import Optional, Tuple
import shapely.wkt
from typing_extensions import assert_never

import shapely  # type: ignore

from pygeoapi.provider.base import (
    ProviderQueryError,
)
import asyncio

from rise.rise_api_types import (
    Coverage,
    CoverageCollection,
    CoverageRange,
    JsonPayload,
    LocationResponse,
    Parameter,
    Url,
    ZType,
)
from rise.rise_cache import RISECache


LOGGER = logging.getLogger(__name__)


def parse_z(z: str) -> Optional[Tuple[ZType, list[int]]]:
    if not z:
        return None
    if z.startswith("R") and len(z.split("/")) == 3:
        z = z.replace("R", "")
        interval = z.split("/")
        if len(interval) != 3:
            raise ProviderQueryError(f"Invalid z interval: {z}")
        steps = int(interval[0])
        start = int(interval[1])
        step_len = int(interval[2])
        return (
            ZType.ENUMERATED_LIST,
            list(range(start, start + (steps * step_len), step_len)),
        )
    elif "/" in z and len(z.split("/")) == 2:
        start = int(z.split("/")[0])
        stop = int(z.split("/")[1])

        return (ZType.RANGE, [start, stop])
    elif "," in z:
        try:
            return (ZType.ENUMERATED_LIST, list(map(int, z.split(","))))
        # if we can't convert to int, it's invalid
        except ValueError:
            raise ProviderQueryError(f"Invalid z value: {z}")
    else:
        try:
            return (ZType.SINGLE, [int(z)])
        except ValueError:
            raise ProviderQueryError(f"Invalid z value: {z}")


def parse_bbox(
    bbox: Optional[list],
) -> Tuple[Optional[shapely.geometry.base.BaseGeometry], Optional[str]]:
    minz, maxz = None, None

    if not bbox:
        return None, None
    else:
        bbox = list(map(float, bbox))

    if len(bbox) == 4:
        minx, miny, maxx, maxy = bbox
        return shapely.geometry.box(minx, miny, maxx, maxy), None
    elif len(bbox) == 6:
        minx, miny, minz, maxx, maxy, maxz = bbox
        return shapely.geometry.box(minx, miny, maxx, maxy), (f"{minz}/{maxz}")
    else:
        raise ProviderQueryError(
            f"Invalid bbox; Expected 4 or 6 points but {len(bbox)} values"
        )


def get_only_key(mapper: dict):
    value = list(mapper.values())[0]
    return value


def get_trailing_id(url: str) -> str:
    return url.split("/")[-1]


def getResultUrlFromCatalogUrl(url: str) -> str:
    return f"https://data.usbr.gov/rise/api/result?itemId={get_trailing_id(url)}"


def flatten_values(input: dict[str, list[str]]) -> list[str]:
    output = []
    for _, v in input.items():
        for i in v:
            output.append(i)

    return output


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

        locationToParams = asyncio.run(gather_parameters())

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

        dateRange = datetime_.split("/")

        if len(dateRange) == 2:  # noqa F841
            start, end = dateRange

            # python does not accept Z at the end of the datetime even though that is a valid ISO 8601 datetime
            if start.endswith("Z"):
                start = start.replace("Z", "+00:00")

            if end.endswith("Z"):
                end = end.replace("Z", "+00:00")

            start = (
                datetime.datetime.min
                if start == ".."
                else datetime.datetime.fromisoformat(start)
            )
            end = (
                datetime.datetime.max
                if end == ".."
                else datetime.datetime.fromisoformat(end)
            )
            start, end = (
                start.replace(tzinfo=datetime.timezone.utc),
                end.replace(tzinfo=datetime.timezone.utc),
            )

            if start > end:
                raise ProviderQueryError(
                    "Start date must be before end date but got {} and {}".format(
                        start, end
                    )
                )

            for i, location in enumerate(filteredResp["data"]):
                updateDate = datetime.datetime.fromisoformat(
                    location["attributes"]["updateDate"]
                )
                if updateDate < start or updateDate > end:
                    filteredResp["data"].pop(i)

        elif len(dateRange) == 1:
            # By casting to a string we can use .str.contains to coarsely check.
            # We want 2019-10 to match 2019-10-01, 2019-10-02, etc.

            for i, location in enumerate(filteredResp["data"]):
                if not str(location["attributes"]["updateDate"]).startswith(
                    dateRange[0]
                ):
                    filteredResp["data"].pop(i)

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

        fetched_result = asyncio.run(cache.get_or_fetch_group(result_endpoints))

        return fetched_result

    @staticmethod
    def fill_catalogItems(
        response: LocationResponse, cache: RISECache, add_results: bool = False
    ):
        """Given a location that contains just catalog item ids, fill in the catalog items with the full
        endpoint response for the given catalog item so it can be more easily used for complex joins
        """

        new = deepcopy(response)

        # Make a dictionary from an existing response, no fetch needed
        locationToCatalogItemUrls: dict[str, list[str]] = (
            LocationHelper.get_catalogItemURLs(new)
        )
        catalogItemUrls = flatten_values(locationToCatalogItemUrls)

        catalogItemUrlToResponse = asyncio.run(
            cache.get_or_fetch_group(catalogItemUrls)
        )

        if add_results:
            resultUrls = [getResultUrlFromCatalogUrl(url) for url in catalogItemUrls]
            assert len(resultUrls) == len(set(resultUrls)), LOGGER.error(
                "Duplicate result urls when adding results to the catalog items"
            )
            LOGGER.debug(f"Fetching {resultUrls}; {len(resultUrls)} in total")
            results = asyncio.run(cache.get_or_fetch_group(resultUrls))

        for i, location in enumerate(new["data"]):
            for j, catalogitem in enumerate(
                location["relationships"]["catalogItems"]["data"]
            ):
                # url = https://data.usbr.gov/rise/api/catalog-record/8025   if id": "/rise/api/catalog-record/8025"
                url: str = "https://data.usbr.gov" + catalogitem["id"]
                try:
                    fetchedData = catalogItemUrlToResponse[url]["data"]
                    new["data"][i]["relationships"]["catalogItems"]["data"][j] = (
                        fetchedData
                    )

                except KeyError:
                    # a few locations have invalid catalog items so we can't do anything with them
                    LOGGER.error(f"Missing key for catalog item {url} in {location}")
                    continue

                if add_results:
                    base_catalog_item_j = new["data"][i]["relationships"][
                        "catalogItems"
                    ]["data"][j]
                    associated_res_url = getResultUrlFromCatalogUrl(url)
                    if not associated_res_url:
                        results_for_catalog_item_j = None
                    else:
                        results_for_catalog_item_j = results[associated_res_url].get(
                            "data", None
                        )
                        base_catalog_item_j["results"] = results_for_catalog_item_j

        return new

    @staticmethod
    def _fields_to_covjson(
        cache: RISECache, only_include_ids: Optional[list[str]] = None
    ) -> dict:
        paramIdsToMetadata: dict[str, Parameter] = {}

        fieldsToGeoJsonOutput = cache.get_or_fetch_parameters()
        for f in fieldsToGeoJsonOutput:
            if only_include_ids and f not in only_include_ids:
                continue

            associatedData = fieldsToGeoJsonOutput[f]

            _param: Parameter = {
                "type": "Parameter",
                "description": {"en": associatedData["description"]},
                "unit": {"symbol": associatedData["x-ogc-unit"]},
                "observedProperty": {
                    "id": f,
                    "label": {"en": associatedData["title"]},
                },
            }
            # TODO check default if _id isn't present
            paramIdsToMetadata[f] = _param

        return paramIdsToMetadata

    @staticmethod
    def to_covjson(
        location_response: LocationResponse, cache: RISECache
    ) -> CoverageCollection:
        # Fill in the catalog items so we can more easily join across them
        expanded_response = LocationHelper.fill_catalogItems(
            location_response, cache, add_results=True
        )

        allCoverages: list[Coverage] = []
        relevant_fields: list[str] = []

        for location_feature in expanded_response["data"]:
            paramToCoverage: dict[str, CoverageRange] = {}

            # We need to have a separate param and location combination for
            # each combination of the two since we cannot combine axes
            # if the axes are different between parameters
            for param in location_feature["relationships"]["catalogItems"]["data"]:
                assert param is not None

                id = str(param["attributes"]["parameterId"])

                relevant_fields.append(id)

                # Check if the parameter has results
                if (
                    param["results"] is not None
                    and len(param["results"]) > 0
                    and param["results"][0]["attributes"] is not None
                ):
                    results: list[float] = [
                        result["attributes"]["result"] for result in param["results"]
                    ]
                    times: list[str] = [
                        result["attributes"]["dateTime"] for result in param["results"]
                    ]

                else:
                    # results, times = [], []
                    # Since coveragejson does not allow a parameter without results,
                    # we can skip adding the parameter/location combination all together
                    continue

                paramToCoverage[id] = {
                    "axisNames": ["t"],
                    "dataType": "float",
                    "shape": [len(results)],
                    "values": results,
                    "type": "NdArray",
                }

                # if it is a point we can't have a polygonseries
                isPoint = (
                    location_feature["attributes"]["locationCoordinates"]["type"]
                    == "Point"
                )

                if isPoint:
                    # z = location_feature["attributes"]["elevation"]
                    x = location_feature["attributes"]["locationCoordinates"][
                        "coordinates"
                    ][0]
                    y = location_feature["attributes"]["locationCoordinates"][
                        "coordinates"
                    ][1]

                    coverage_item: Coverage = {
                        "type": "Coverage",
                        "domainType": "PointSeries",
                        "domain": {
                            "type": "Domain",
                            "axes": {
                                "x": {"values": [x]},
                                "y": {"values": [y]},
                                "t": {"values": times},
                            },
                        },
                        "ranges": paramToCoverage,
                    }

                else:
                    coverage_item: Coverage = {
                        "type": "Coverage",
                        "domainType": "PolygonSeries",
                        "domain": {
                            "type": "Domain",
                            "axes": {
                                "composite": {
                                    "dataType": location_feature["attributes"][
                                        "locationCoordinates"
                                    ]["type"],
                                    "coordinates": ["x", "y"],
                                    "values": [
                                        location_feature["attributes"][
                                            "locationCoordinates"
                                        ]["coordinates"]
                                    ],
                                },
                                "t": {"values": times},
                            },
                        },
                        "ranges": paramToCoverage,
                    }

                allCoverages.append(coverage_item)

        filtered_params = LocationHelper._fields_to_covjson(
            cache, only_include_ids=relevant_fields
        )

        templated_response: CoverageCollection = {
            "type": "CoverageCollection",
            "parameters": filtered_params,
            "referencing": [
                {
                    "coordinates": ["x", "y"],
                    "system": {
                        "type": "GeographicCRS",
                        "id": "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                    },
                },
                {
                    "coordinates": ["z"],
                    "system": {
                        "type": "VerticalCRS",
                        "cs": {
                            "csAxes": [
                                {
                                    "name": {"en": "Pressure"},
                                    "direction": "down",
                                    "unit": {"symbol": "Pa"},
                                }
                            ]
                        },
                    },
                },
                {
                    "coordinates": ["t"],
                    "system": {"type": "TemporalRS", "calendar": "Gregorian"},
                },
            ],
            "coverages": allCoverages,
        }

        return templated_response


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
