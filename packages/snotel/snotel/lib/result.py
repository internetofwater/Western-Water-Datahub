# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from com.cache import RedisCache
from com.helpers import await_
from snotel.lib.types import StationDataDTO


class ResultCollection:
    results: list[StationDataDTO]

    def __init__(self, station_triplets: str, element_code: str = "*"):
        self.cache = RedisCache()
        assert station_triplets
        url = f"https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?elements={element_code}&stationTriplets={station_triplets}"
        result = await_(self.cache.get_or_fetch(url))
        assert "error" not in result, result
        self.results = [StationDataDTO.model_validate(res) for res in result]
