# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Optional
from awdb_com.locations import MAGIC_UPSTREAM_DATE_SIGNIFYING_STILL_IN_SERVICE
from com.cache import RedisCache
from com.helpers import await_
from awdb_com.types import ForecastDataDTO


class ForecastResultCollection:
    """
    A helper class for fetching results and processing them

    In snotel results are called `data`
    """

    def __init__(
        self,
    ):
        self.cache = RedisCache()

    def fetch_all_data(
        self,
        station_triplets: list[str],
        element_code: str = "*",
        force_fetch: bool = False,
        datetime_filter: Optional[str] = None,
    ) -> dict[str, list[ForecastDataDTO]]:
        """
        Given a list of station triples, fetch all associated data for them
        """
        if not station_triplets:
            return {}

        station_triplets_comma_separated = ",".join(station_triplets)
        assert element_code
        url = f"https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/forecasts?elements={element_code}&stationTriplets={station_triplets_comma_separated}"
        if not datetime_filter:
            datetime_filter = (
                f"1960-01-01/{MAGIC_UPSTREAM_DATE_SIGNIFYING_STILL_IN_SERVICE}"
            )

        parsedDate = datetime_filter.split("/")
        if isinstance(parsedDate, str):
            url += f"&beginPublicationDate={parsedDate}"
        elif isinstance(parsedDate, list):
            assert len(parsedDate) == 2
            if ".." in parsedDate:
                raise ValueError(
                    "Cannot filter AWDB by an undefined temporal range with .."
                )
            url += f"&beginPublicationDate={parsedDate[0]}&endPublicationDate={parsedDate[1]}"
        else:
            raise ValueError(f"Got unexpected datetime filter {datetime_filter}")
        result = await_(self.cache.get_or_fetch_json(url, force_fetch=force_fetch))
        assert "error" not in result, result

        assert result, f"Got no data for {url}"
        tripletToForecast: dict[str, list[ForecastDataDTO]] = {}
        for res in result:
            tripletToForecast[res.get("stationTriplet")] = [
                ForecastDataDTO.model_validate(item) for item in res["data"]
            ]
        return tripletToForecast
