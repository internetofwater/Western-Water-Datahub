# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import List, Literal, Optional
from pydantic import BaseModel


class TimeseriesParameter(BaseModel):
    tsid: str
    label: str
    base_parameter: str
    parameter: str
    unit: str
    unit_long_name: str
    latest_time: str
    latest_value: float
    delta24h: Optional[float] = None
    sort_order: int


class GeojsonProperties(BaseModel):
    provider: str
    code: str
    slug: str
    elevation: Optional[float] = None
    horizontal_datum: str
    vertical_datum: str
    state: str
    kind: Literal["PROJECT"]
    nearest_city: str
    public_name: str
    location_code: int
    nsid: Optional[str] = None
    aliases: dict
    timeseries: Optional[list[TimeseriesParameter]] = None
    name: Optional[str] = None


class Feature(BaseModel):
    type: Literal["Feature"]
    properties: GeojsonProperties
    geometry: dict
    id: Optional[str] = None


class FeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[Feature]
