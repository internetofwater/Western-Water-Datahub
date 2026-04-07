# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Annotated, Optional
from com.cache import RedisCache
from com.helpers import await_


@dataclass
class BasinIndexResult:
    total_stations_used: int
    basin_index: float


class Huc6WithStationMetadata:
    id: str
    name: str
    x: float
    y: float
    area: float
    states: Annotated[str, "comma separated list of state abbreviations"]
    btype: str

    station_list: list[str]

    geometry: Optional[dict]
    latest_swe_values: dict[str, float]
    median_swe_values: dict[str, float]

    def __init__(
        self,
        json_response: dict,
        huc_to_geometry: dict,
        station_to_latest_swe: dict,
        station_to_median_swe: dict,
    ) -> None:
        self.id = json_response["id"]
        self.name = json_response["name"]
        self.x = json_response["x"]
        self.y = json_response["y"]
        self.area = json_response["area"]
        self.states = json_response["states"]
        self.btype = json_response["btype"]
        self.station_list = json_response["station_list"]

        self.latest_swe_values = {}
        self.median_swe_values = {}

        if self.id in huc_to_geometry:
            self.geometry = huc_to_geometry[self.id].get("geometry")
        else:
            self.geometry = None

        for station in self.station_list:
            latest_swe = station_to_latest_swe.get(station)
            median_swe = station_to_median_swe.get(station)
            if latest_swe is None or median_swe is None:
                continue
            self.latest_swe_values[station] = latest_swe
            self.median_swe_values[station] = median_swe

    def get_basin_index_percentage(self) -> Optional[BasinIndexResult]:
        sum_of_observed_value_for_all_associated_stations = 0
        sum_of_median_swe_for_all_associated_stations = 0

        stations_used_for_basin_index_calc = 0
        for station in self.station_list:
            if "SNTL" not in station:
                continue

            latest_swe = self.latest_swe_values.get(station)
            median_swe = self.median_swe_values.get(station)
            if latest_swe is None or median_swe is None:
                continue
            sum_of_observed_value_for_all_associated_stations += latest_swe
            sum_of_median_swe_for_all_associated_stations += median_swe
            stations_used_for_basin_index_calc += 1

        if sum_of_median_swe_for_all_associated_stations == 0:
            return None

        basin_index = (
            sum_of_observed_value_for_all_associated_stations
            / sum_of_median_swe_for_all_associated_stations
        ) * 100

        return BasinIndexResult(
            total_stations_used=stations_used_for_basin_index_calc,
            basin_index=basin_index,
        )


class AllHuc6WithStationMetadata:
    huc6List: list[Huc6WithStationMetadata]

    def get_daily_snow_water_equivalent(self, month_and_date: str) -> dict[str, float]:
        """
        Returns the snow water equivalent for each snotel station; data may be missing
        if you fetch for the current day and the day is not yet complete

        Definition: WTEQ is the depth of water that would result if the entire snowpack were to melt instantaneously.
        """
        url = f"https://nwcc-apps.sc.egov.usda.gov/awdb/data/WTEQ/DAILY/OBS/WTEQ_DAILY_OBS_{month_and_date}.json"
        asJson = await_(self.cache.get_or_fetch_json(url))
        snotelStationTripleToWaterEquivalent: dict[str, float] = {}
        for station in asJson:
            dataArray = asJson[station]
            # the latest item is the latest value. there should only be one value anyways however
            latestSnowWaterEquivalent = dataArray[-1]
            snotelStationTripleToWaterEquivalent[station] = latestSnowWaterEquivalent

        return snotelStationTripleToWaterEquivalent

    def median_snow_water_equivalent(self, month_and_date) -> dict[str, float]:
        url = f"https://nwcc-apps.sc.egov.usda.gov/awdb/data/WTEQ/DAILY/MED/WTEQ_DAILY_MED_{month_and_date}.json"
        asJson = await_(self.cache.get_or_fetch_json(url))
        stationToMedianSWE: dict[str, float] = {}
        for station in asJson:
            dataArray = asJson[station]
            # the latest item is the latest value. there should only be one value anyways however
            medianSnowWaterEquivalent = dataArray[-1]
            stationToMedianSWE[station] = medianSnowWaterEquivalent

        return stationToMedianSWE

    def __init__(self, cache: RedisCache, huc06_geometry_reference: dict):
        """Get all station metadata such as huc and longitude/latitude"""
        self.cache = cache
        url = "https://nwcc-apps.sc.egov.usda.gov/awdb/basin-defs/site-lists/HUC6_WTEQ.json"
        all_stations_as_json = await_(cache.get_or_fetch_json(url))

        yesterday = get_yesterdays_month_and_day()
        station_to_latest_swe_value = self.get_daily_snow_water_equivalent(yesterday)

        station_to_30_year_median_swe_value = self.median_snow_water_equivalent(
            yesterday
        )

        self.huc6List = [
            Huc6WithStationMetadata(
                json_response=station_json,
                huc_to_geometry=huc06_geometry_reference,
                station_to_latest_swe=station_to_latest_swe_value,
                station_to_median_swe=station_to_30_year_median_swe_value,
            )
            for station_json in all_stations_as_json
        ]


def get_yesterdays_month_and_day():
    """Return the month and day of yesterday in a format that awdb expects"""
    return (datetime.now() - timedelta(days=1)).strftime("%m-%d")
