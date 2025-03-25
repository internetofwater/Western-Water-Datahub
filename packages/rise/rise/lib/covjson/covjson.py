# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import Any, Tuple

from com.helpers import EDRFieldsMapping, await_
from rise.lib.covjson.template import COVJSON_TEMPLATE
from rise.lib.covjson.types import (
    CoverageCollection,
    Coverage,
    CoverageRange,
    Parameter,
)
from rise.lib.cache import RISECache
from rise.lib.add_results import DataNeededForCovjson

LOGGER = logging.getLogger(__name__)


def _generate_coverage_item(
    location_type: str,
    coords: list[Any] | Tuple[float, float],
    times: list[str | None],
    paramToCoverage: dict[str, CoverageRange],
) -> Coverage:
    # if it is a point it will have different geometry

    if location_type == "Point":
        # z = location_feature["attributes"]["elevation"]
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
                        "dataType": location_type,
                        "coordinates": ["x", "y"],
                        "values": [coords],
                    },
                    "t": {"values": times},
                },
            },
            "ranges": paramToCoverage,
        }

    return coverage_item


class CovJSONBuilder:
    """A helper class for building CovJSON from a Rise JSON Response"""

    def __init__(self, cache: RISECache):
        self._cache = cache

    def _insert_parameter_metadata(
        self,
        paramsToGeoJsonOutput: EDRFieldsMapping,
        location_response: list[DataNeededForCovjson],
    ):
        relevant_parameters = []
        for location in location_response:
            for p in location.parameters:
                relevant_parameters.append(p.parameterId)

        paramNameToMetadata: dict[str, Parameter] = {}

        for param_id in relevant_parameters:
            if param_id not in paramsToGeoJsonOutput:
                LOGGER.error(
                    f"Could not find metadata for {param_id} in {sorted(paramsToGeoJsonOutput.keys())}"
                )
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
            natural_language_name = associatedData["title"]
            paramNameToMetadata[natural_language_name] = _param

        return paramNameToMetadata

    def _get_coverages(
        self,
        locationsWithResults: list[DataNeededForCovjson],
        paramsToGeoJsonOutput,
    ) -> list[Coverage]:
        """Return the data needed for the 'coverage' key in the covjson response"""

        coverages = []
        for location_feature in locationsWithResults:
            # CoverageJSON needs a us to associated every parameter with data
            # This data is grouped independently for each location
            paramToCoverage: dict[str, CoverageRange] = {}

            longestParam = 0

            for param in location_feature.parameters:
                assert len(param.timeseriesResults) == len(param.timeseriesDates)
                if len(param.timeseriesResults) > longestParam:
                    longestParam = len(param.timeseriesResults)

            for param in location_feature.parameters:
                if not (  # ensure param contains data so it can be used for covjson
                    param.timeseriesResults
                ):
                    # Since coveragejson does not allow a parameter without results,
                    # we can skip adding the parameter/location combination all together
                    continue

                naturalLanguageName = paramsToGeoJsonOutput[str(param.parameterId)][
                    "title"
                ]

                paramToCoverage[naturalLanguageName] = {
                    "axisNames": ["t"],
                    "dataType": "float",
                    "shape": [longestParam],
                    "values": param.timeseriesResults
                    + ([None] * (longestParam - len(param.timeseriesResults))),
                    "type": "NdArray",
                }

                coverage_item = _generate_coverage_item(
                    location_feature.locationType,
                    location_feature.geometry,
                    param.timeseriesDates
                    + ([None] * (longestParam - len(param.timeseriesDates))),
                    paramToCoverage,
                )

                coverages.append(coverage_item)

        return coverages

    def fill_template(
        self, location_response: list[DataNeededForCovjson]
    ) -> CoverageCollection:
        templated_covjson: CoverageCollection = COVJSON_TEMPLATE
        paramIdToMetadata: EDRFieldsMapping = await_(
            self._cache.get_or_fetch_parameters()
        )
        templated_covjson["coverages"] = self._get_coverages(
            location_response, paramIdToMetadata
        )
        templated_covjson["parameters"] = self._insert_parameter_metadata(
            paramIdToMetadata, location_response=location_response
        )

        # don't actually care about the pydantic model, we just want to use it to validate
        # PydanticCoverageCollection.model_validate(templated_covjson)
        return templated_covjson
