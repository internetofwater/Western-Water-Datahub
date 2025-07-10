# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from dataclasses import dataclass
from awdb_com.locations import LocationCollection
from awdb_com.types import StationDTO
from com.cache import RedisCache
from com.helpers import (
    await_,
)
from typing import Optional


@dataclass(slots=True, frozen=True, kw_only=True)
class Station:
    stationTriplet: str


class SnotelMeansLocationCollection(LocationCollection):
    def __init__(self, select_properties: Optional[list[str]] = None):
        self.cache = RedisCache()
        # snotel also proxies usgs so we just want to get SNOTEL stations
        JUST_SNOTEL_STATIONS = "*:*:SNTL"
        url = f"https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?activeOnly=true&stationTriplets={JUST_SNOTEL_STATIONS}"
        if select_properties:
            url += f"&elements={','.join(select_properties)}"
        result = await_(self.cache.get_or_fetch_json(url))
        self.locations = [StationDTO.model_validate(res) for res in result]
