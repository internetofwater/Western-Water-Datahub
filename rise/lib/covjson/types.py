# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal, TypedDict


class Parameter(TypedDict):
    type: str
    description: dict[str, dict]
    unit: dict
    observedProperty: dict


class CoverageRange(TypedDict):
    type: Literal["NdArray"]
    dataType: Literal["float"]
    axisNames: list[str]
    shape: list[int]
    values: list[float | None]


class Coverage(TypedDict):
    type: Literal["Coverage"]
    domain: dict
    ranges: dict[str, CoverageRange]
    domainType: Literal["PolygonSeries", "PointSeries"]


class CoverageCollection(TypedDict):
    type: str
    parameters: dict[str, Parameter]
    referencing: list
    coverages: list[Coverage]
