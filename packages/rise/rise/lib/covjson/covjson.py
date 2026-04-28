# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import Any, Tuple

from com.helpers import EDRFieldsMapping, await_
from rise.lib.covjson.template import COVJSON_TEMPLATE
from com.covjson import (
    CoverageCollectionDict,
    CoverageDict,
    CoverageRangeDict,
    ParameterDict,
)
from rise.lib.cache import RISECache
from rise.lib.add_results import DataNeededForCovjson

LOGGER = logging.getLogger(__name__)


def _generate_coverage_item(
    location_type: str,
    coords: list[Any] | Tuple[float, float],
    times: list[str | None],
    isModeled: bool,
    paramToCoverage: dict[str, CoverageRangeDict],
) -> CoverageDict:
    # if it is a point it will have different geometry

    if location_type == "Point":
        # z = location_feature["attributes"]["elevation"]
        x, y = coords[0], coords[1]

        coverage_item: CoverageDict = {
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
            "isModeled": isModeled,
        }

    else:
        coverage_item: CoverageDict = {
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
            "isModeled": isModeled,
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
        relevant_parameters_and_modeling_status: list[str] = []
        for location in location_response:
            for p in location.parameters:
                relevant_parameters_and_modeling_status.append(p.parameterId)

        paramNameToMetadata: dict[str, ParameterDict] = {}

        for param_id in relevant_parameters_and_modeling_status:
            associatedData = paramsToGeoJsonOutput.get(param_id)
            description = (
                associatedData["description"]
                if associatedData
                else "No parameter description provided in RISE API"
            )
            unit = (
                associatedData["x-ogc-unit"]
                if associatedData
                else "No parameter unit provided in RISE API"
            )
            title = (
                associatedData["title"]
                if associatedData
                else "No parameter title provided in RISE API"
            )

            _param: ParameterDict = {
                "type": "Parameter",
                "description": {"en": description},
                "unit": {"symbol": unit},
                "observedProperty": {
                    "id": param_id,
                    "label": {"en": title},
                },
                "rise_parameter_id": f"https://data.usbr.gov/rise/api/parameter/{param_id}",  # pyright: ignore[reportAssignmentType]
            }
            paramNameToMetadata[param_id] = _param

        return paramNameToMetadata

    def _get_coverages(
        self,
        locationsWithResults: list[DataNeededForCovjson],
    ) -> list[CoverageDict]:
        """Return the data needed for the 'coverage' key in the covjson response"""

        coverages = []
        for location_feature in locationsWithResults:
            for param in location_feature.parameters:
                if not (  # ensure param contains data so it can be used for covjson
                    param.timeseriesResults
                ):
                    # Since coveragejson does not allow a parameter without results,
                    # we can skip adding the parameter/location combination all together
                    continue

                range: dict[str, CoverageRangeDict] = {
                    param.parameterId: {
                        "axisNames": ["t"],
                        "dataType": "float",
                        "shape": [len(param.timeseriesResults)],
                        "values": param.timeseriesResults,
                        "type": "NdArray",
                        "rise_catalog_item_url": param.catalogItemId,
                        "rise_result_url": param.resultUrl,
                    }
                }  # pyright: ignore[reportAssignmentType] ignore the special additional rise urls; these are additive and dont affect the ability to parse the covjson

                coverage_item = _generate_coverage_item(
                    location_feature.locationType,
                    location_feature.geometry,
                    param.timeseriesDates,
                    isModeled=param.isModeled,
                    paramToCoverage=range,
                )

                coverages.append(coverage_item)

        return coverages

    def render(
        self,
        location_response: list[DataNeededForCovjson],
        select_properties: list[str] | None,
    ) -> CoverageCollectionDict:
        templated_covjson: CoverageCollectionDict = COVJSON_TEMPLATE
        paramIdToMetadata: EDRFieldsMapping = await_(
            self._cache.get_or_fetch_parameters()
        )
        if select_properties:
            for loc in location_response:
                loc.parameters = [
                    p for p in loc.parameters if p.parameterId in select_properties
                ]
        templated_covjson["coverages"] = self._get_coverages(location_response)
        templated_covjson["parameters"] = self._insert_parameter_metadata(
            paramIdToMetadata, location_response=location_response
        )

        # don't actually care about the pydantic model, we just want to use it to validate
        # PydanticCoverageCollection.model_validate(templated_covjson)
        return templated_covjson
