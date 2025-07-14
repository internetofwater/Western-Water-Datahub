# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from dataclasses import dataclass
from datetime import datetime, timedelta
from awdb_com.types import StationDTO
import requests


def get_all_snotel_station_metadata() -> dict[str, StationDTO]:
    """Get all station metadata such as huc and longitude/latitude"""
    url = "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?activeOnly=true&stationTriplets=*:*:SNTL"
    resp = requests.get(url)
    resp.raise_for_status()
    asJson = resp.json()
    return {
        station["stationTriplet"]: StationDTO.model_validate(station)
        for station in asJson
    }


@dataclass(frozen=True, kw_only=True, slots=True)
class TemperatureData:
    water_temp_yesterday: float
    water_temp_30_year_average: float


type StationTripleToTemp = dict[str, float]


@dataclass(frozen=True, kw_only=True, slots=True)
class StationData:
    tempData: TemperatureData
    metadata: StationDTO


@dataclass(kw_only=True, slots=True)
class WaterTemperatureCollectionWithMetadata:
    stations: dict[
        str,
        StationData,
    ]

    def __init__(self):
        yesterday = get_yesterdays_month_and_day()
        averages = get_30_year_water_temp_average(yesterday)
        assert len(averages) > 0

        daily = get_water_temp(yesterday)
        assert len(daily) > 0

        self.stations = self._make_station_dict(averages, daily)

    def get_averages_by_huc6(self) -> dict[str, float]:
        """
        Get the average water temperate for each huc6
        by getting the average for each station (Relative to 30 year average) in the huc6
        and then averaging those together. This essentially gives you a weighted average
        against the 30 year average
        """
        huc6ToAvgList: dict[str, list[float]] = {}

        for station in self.stations.values():
            huc = station.metadata.huc
            if not huc:
                continue
            huc6 = huc[:6]
            if huc6 not in huc6ToAvgList:
                huc6ToAvgList[huc6] = []

            if station.tempData.water_temp_30_year_average == 0:
                huc6ToAvgList[huc6].append(0)
            else:
                tempRelativeTo30Year = (
                    station.tempData.water_temp_yesterday
                    / station.tempData.water_temp_30_year_average
                    * 100
                )
                huc6ToAvgList[huc6].append(tempRelativeTo30Year)

        averagedAverages: dict[str, float] = {}
        for huc6 in huc6ToAvgList:
            averagedAverages[huc6] = sum(huc6ToAvgList[huc6]) / len(huc6ToAvgList[huc6])

        return averagedAverages

    @classmethod
    def _make_station_dict(
        cls,
        idTo30YearTemp: StationTripleToTemp,
        idToYesterdayTemp: StationTripleToTemp,
    ):
        """
        Merge the data from yesterday and 30 year average
        into one data dict
        """
        allmetadata = get_all_snotel_station_metadata()
        stations: dict[str, StationData] = {}
        for id, valueToday in idToYesterdayTemp.items():
            if valueToday is None:
                continue

            thirtyYearAvg = idTo30YearTemp.get(id)
            # some stations don't have 30 year data
            # if this is the case, skip them
            if thirtyYearAvg is None:
                continue

            if id not in allmetadata:
                continue

            stations[id] = StationData(
                tempData=TemperatureData(
                    water_temp_yesterday=valueToday,
                    water_temp_30_year_average=thirtyYearAvg,
                ),
                metadata=allmetadata[id],
            )

        return stations


def get_yesterdays_month_and_day():
    """Return the month and day of yesterday in a format that awdb expects"""
    return (datetime.now() - timedelta(days=1)).strftime("%m-%d")


def get_30_year_water_temp_average(month_and_date: str) -> dict[str, float]:
    """
    Fetch the json file from the awdb api; this file represents the 30 year average
    for each snotel station; the first item for each station is the year of the start
    of the data and each subsequent item is the average for that year; i.e. if
    index 0: 2015 and index 1: 5 then that makes the average of 2016 was 5
    """
    url = f"https://nwcc-apps.sc.egov.usda.gov/awdb/data/WTEQ/DAILY/AVG/WTEQ_DAILY_AVG_{month_and_date}.json"
    resp = requests.get(url)
    resp.raise_for_status()
    asJson = resp.json()
    snotelStationTripleToWaterTemp: dict[str, float] = {}
    for station in asJson:
        dataArray = asJson[station]
        assert len(dataArray) == 1
        thirtyYearAvgForToday = dataArray[0]
        snotelStationTripleToWaterTemp[station] = thirtyYearAvgForToday

    return snotelStationTripleToWaterTemp


def get_water_temp(month_and_date: str) -> dict[str, float]:
    """
    Returns the water temperature for each snotel station; data may be missing
    if you fetch for the current day and the day is not yet complete
    """
    url = f"https://nwcc-apps.sc.egov.usda.gov/awdb/data/WTEQ/DAILY/OBS/WTEQ_DAILY_OBS_{month_and_date}.json"
    resp = requests.get(url)
    resp.raise_for_status()
    asJson = resp.json()
    snotelStationTripleToWaterTemp: dict[str, float] = {}
    for station in asJson:
        dataArray = asJson[station]
        latestTemp = dataArray[-1]
        snotelStationTripleToWaterTemp[station] = latestTemp

    return snotelStationTripleToWaterTemp
