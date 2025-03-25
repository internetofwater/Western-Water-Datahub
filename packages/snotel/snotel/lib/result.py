# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import datetime
from com.cache import RedisCache
from com.helpers import await_
from snotel.lib.types import StationDataDTO


class ResultCollection:
    results: list[StationDataDTO]

    def __init__(
        self,
    ):
        self.cache = RedisCache()

    def _fetch_metadata_for_elements(
        self, station_triplets: list[str], element_code: str
    ):
        assert station_triplets
        station_triplets_comma_separated = ",".join(station_triplets)
        assert element_code
        url = f"https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?elements={element_code}&stationTriplets={station_triplets_comma_separated}"
        result = await_(self.cache.get_or_fetch(url))
        assert "error" not in result, result
        return [StationDataDTO.model_validate(res) for res in result]

    def fetch_all_data(
        self,
        station_triplets: list[str],
        element_code: str = "*",
        force_fetch: bool = False,
    ) -> list[StationDataDTO]:
        """
        Given a list of station triples, fetch all associated data for them
        """
        metadata = self._fetch_metadata_for_elements(station_triplets, element_code)

        urls_for_full_data = []
        for station in metadata:
            if not station.data:
                continue
            earliestDate, latestDate = datetime.datetime.max, datetime.datetime.min
            elements: list[str] = []
            for datastream in station.data:
                if not datastream.stationElement:
                    continue
                start, end = (
                    datastream.stationElement.beginDate,
                    datastream.stationElement.endDate,
                )
                assert start
                assert end
                startDate = datetime.datetime.fromisoformat(start)
                endDate = datetime.datetime.fromisoformat(end)
                if startDate < earliestDate:
                    earliestDate = startDate
                if endDate > latestDate:
                    latestDate = endDate

                assert datastream.stationElement.elementCode
                elements.append(datastream.stationElement.elementCode)

            full_results_url = f"https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?beginDate={earliestDate}&endDate={latestDate}&elements={','.join(elements)}&stationTriplets={station.stationTriplet}"
            urls_for_full_data.append(full_results_url)
        result: dict[str, dict] = await_(
            self.cache.get_or_fetch_group(urls_for_full_data, force_fetch)
        )

        data_array: list[StationDataDTO] = []
        for url, datastreams in result.items():
            for item in datastreams:
                data = StationDataDTO.model_validate(item)
                data_array.append(data)

        return data_array


# StationDataDTO.model_validate(result[list(result.keys())[0]][0])
