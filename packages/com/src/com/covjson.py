# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal, NotRequired, TypedDict


class ObservedPropertyDict(TypedDict):
    id: str
    label: dict[Literal["en"], str]


class UnitDict(TypedDict):
    label: dict[Literal["en"], str]
    symbol: dict


class ParameterDict(TypedDict):
    type: str
    description: dict[str, str]
    unit: dict
    observedProperty: dict


class CoverageRangeDict(TypedDict):
    type: Literal["NdArray"]
    dataType: Literal["float"]
    axisNames: list[str]
    shape: list[int]
    values: list[float | None]


class CoverageDict(TypedDict):
    type: Literal["Coverage"]
    domain: dict
    ranges: dict[str, CoverageRangeDict]
    domainType: NotRequired[Literal["PolygonSeries", "PointSeries"]]
    parameters: NotRequired[dict[str, ParameterDict]]


class CoverageCollectionDict(TypedDict):
    type: str
    parameters: dict[str, ParameterDict]
    referencing: list
    coverages: list[CoverageDict]
