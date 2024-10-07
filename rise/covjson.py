from copy import deepcopy
import logging
from typing import Optional
from rise.custom_types import (
    CoverageCollection,
    Coverage,
    CoverageRange,
    LocationData,
    LocationResponse,
    Parameter,
)
from rise.cache import RISECache
from rise.edr_helpers import LocationHelper
from rise.lib import flatten_values, getResultUrlFromCatalogUrl, safe_run_async

LOGGER = logging.getLogger(__name__)

# The template that we will fill in with data and return to the user
COVJSON_TEMPLATE: CoverageCollection = {
    "type": "CoverageCollection",
    ## CoverageJSON makes us specify a list of parameters that are relevant for the entire coverage collection
    "parameters": {},
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
                            "name": {"en": "time"},
                            "direction": "down",
                            "unit": {"symbol": "time"},
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
    "coverages": {},  # type: ignore this w/ static type checks since it is a template and intended to be empty
}


def _generate_coverage_item(
    paramToCoverage: dict[str, CoverageRange],
    location_feature: LocationData,
    times: list[str],
) -> Coverage:
    # if it is a point it will have different geometry
    isPoint = location_feature["attributes"]["locationCoordinates"]["type"] == "Point"

    if isPoint:
        # z = location_feature["attributes"]["elevation"]
        coords = location_feature["attributes"]["locationCoordinates"]["coordinates"]
        x, y = coords[0], coords[1]

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
                            location_feature["attributes"]["locationCoordinates"][
                                "coordinates"
                            ]
                        ],
                    },
                    "t": {"values": times},
                },
            },
            "ranges": paramToCoverage,
        }

    return coverage_item


class CovJSONBuilder:
    """A helper class for building CovJSON from a Rise JSON Response"""

    _cache: RISECache  # The RISE Cache to use for storing and fetching data

    def __init__(self, cache: RISECache):
        self._cache = cache

    def _get_relevant_parameters(self, location_response: LocationResponse) -> set[str]:
        relevant_parameters = set()
        for location_feature in location_response["data"]:
            for param in location_feature["relationships"]["catalogItems"]["data"]:
                id = str(param["attributes"]["parameterId"])
                relevant_parameters.add(id)
        return relevant_parameters

    def _get_parameter_metadata(self, location_response: LocationResponse):
        relevant_parameters = self._get_relevant_parameters(location_response)

        paramNameToMetadata: dict[str, Parameter] = {}

        paramsToGeoJsonOutput = self._cache.get_or_fetch_parameters()
        for param_id in paramsToGeoJsonOutput:
            if relevant_parameters and param_id not in relevant_parameters:
                continue

            associatedData = paramsToGeoJsonOutput[param_id]

            _param: Parameter = {
                "type": "Parameter",
                "description": {"en": associatedData["description"]},
                "unit": {"symbol": associatedData["x-ogc-unit"]},
                "observedProperty": {
                    "id": param_id,
                    "label": {"en": associatedData["title"]},
                },
            }
            # TODO check default if _id isn't present

            natural_language_name = associatedData["title"]
            paramNameToMetadata[natural_language_name] = _param

        return paramNameToMetadata

    def get_location_response_with_results(
        self,
        base_location_response: LocationResponse,
        time_filter: Optional[str] = None,
    ) -> LocationResponse:
        """Given a location that contains just catalog item ids, fill in the catalog items with the full
        endpoint response for the given catalog item so it can be more easily used for complex joins
        """

        new = deepcopy(base_location_response)

        # Make a dictionary from an existing response, no fetch needed
        locationToCatalogItemUrls: dict[str, list[str]] = (
            LocationHelper.get_catalogItemURLs(new)
        )
        catalogItemUrls = flatten_values(locationToCatalogItemUrls)

        catalogItemUrlToResponse = safe_run_async(
            self._cache.get_or_fetch_group(catalogItemUrls)
        )

        # Fetch all results in parallel before looping through each location to add them in the json
        resultUrls = [
            getResultUrlFromCatalogUrl(url, time_filter) for url in catalogItemUrls
        ]
        assert len(resultUrls) == len(set(resultUrls)), LOGGER.error(
            "Duplicate result urls when adding results to the catalog items"
        )
        LOGGER.debug(f"Fetching {resultUrls}; {len(resultUrls)} in total")
        results = safe_run_async(self._cache.get_or_fetch_group(resultUrls))

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

                base_catalog_item_j = new["data"][i]["relationships"]["catalogItems"][
                    "data"
                ][j]
                associated_res_url = getResultUrlFromCatalogUrl(url, time_filter)
                if not associated_res_url:
                    results_for_catalog_item_j = None
                else:
                    results_for_catalog_item_j = results[associated_res_url].get(
                        "data", None
                    )
                    base_catalog_item_j["results"] = results_for_catalog_item_j

        return new

    def _get_coverages(self, location_response: LocationResponse) -> list[Coverage]:
        """Return the data needed for the 'coverage' key in the covjson response"""
        coverages: list[Coverage] = []

        for location_feature in location_response["data"]:
            # CoverageJSON needs a us to associated every parameter with data
            # This data is grouped independently for each location
            paramToCoverage: dict[str, CoverageRange] = {}

            for param in location_feature["relationships"]["catalogItems"]["data"]:
                if not (  # ensure param contains data so it can be used for covjson
                    param["results"] is not None
                    and len(param["results"]) > 0
                    and param["results"][0]["attributes"] is not None
                ):
                    # Since coveragejson does not allow a parameter without results,
                    # we can skip adding the parameter/location combination all together
                    continue

                results: list[float] = [
                    result["attributes"]["result"] for result in param["results"]
                ]
                times: list[str] = [
                    result["attributes"]["dateTime"] for result in param["results"]
                ]

                # id = str(param["attributes"]["parameterId"])
                id = param["attributes"]["parameterName"]

                paramToCoverage[id] = {
                    "axisNames": ["t"],
                    "dataType": "float",
                    "shape": [len(results)],
                    "values": results,
                    "type": "NdArray",
                }

                coverage_item = _generate_coverage_item(
                    paramToCoverage, location_feature, times
                )

                coverages.append(coverage_item)
        return coverages

    def render(
        self, location_response: LocationResponse, time_filter: Optional[str] = None
    ) -> CoverageCollection:
        response_with_data = self.get_location_response_with_results(
            location_response, time_filter
        )
        templated_covjson: CoverageCollection = COVJSON_TEMPLATE
        templated_covjson["coverages"] = self._get_coverages(response_with_data)
        templated_covjson["parameters"] = self._get_parameter_metadata(
            location_response=response_with_data
        )

        return templated_covjson
