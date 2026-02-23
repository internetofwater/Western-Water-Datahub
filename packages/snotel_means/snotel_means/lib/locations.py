# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from dataclasses import dataclass
from datetime import datetime, timedelta
from awdb_com.types import StationDTO
from com.cache import RedisCache
from com.helpers import await_


def get_all_snotel_station_metadata(cache: RedisCache) -> dict[str, StationDTO]:
    """Get all station metadata such as huc and longitude/latitude"""
    url = "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?activeOnly=true&stationTriplets=*:*:SNTL"
    asJson = await_(cache.get_or_fetch_json(url))
    return {
        station["stationTriplet"]: StationDTO.model_validate(station)
        for station in asJson
    }


@dataclass(frozen=True, kw_only=True, slots=True)
class SnowWaterEquivalentData:
    snow_water_equivalent_yesterday: float
    snow_water_equivalent_30_year_average: float


type StationTripleToSnowWaterEquivalent = dict[str, float]


@dataclass(frozen=True, kw_only=True, slots=True)
class StationData:
    snowWaterData: SnowWaterEquivalentData
    metadata: StationDTO


@dataclass(kw_only=True, slots=True)
class SnowWaterEquivalentCollectionWithMetadata:
    stations: dict[
        str,
        StationData,
    ]
    redis_cache: RedisCache

    def __init__(self):
        self.redis_cache = RedisCache()
        yesterday = get_yesterdays_month_and_day()
        averages = get_30_year_snow_water_equivalent_average(
            self.redis_cache, yesterday
        )
        assert len(averages) > 0

        daily = get_daily_snow_water_equivalent(self.redis_cache, yesterday)
        assert len(daily) > 0

        self.stations = self._make_station_dict(averages, daily)

    def get_averages_by_huc6(self) -> dict[str, float | None]:
        """
        Get the average snow water equivalent for each huc6
        by getting the average for each station (Relative to 30 year average) in the huc6
        and then averaging those together. This essentially gives you a weighted average
        against the 30 year average
        """
        huc6ToAvgList: dict[str, list[float | None]] = {}

        for station in self.stations.values():
            huc = station.metadata.huc
            if not huc:
                continue
            huc6 = huc[:6]
            if huc6 not in huc6ToAvgList:
                huc6ToAvgList[huc6] = []

            if station.snowWaterData.snow_water_equivalent_30_year_average == 0:
                # if the average is 0 we can't divide by it and
                # thus must signify it is null; we have to use None instead of
                # NaN since the latter is not JSON serializable
                huc6ToAvgList[huc6].append(None)
            else:
                snowWaterEquivalentRelativeTo30Year = (
                    station.snowWaterData.snow_water_equivalent_yesterday
                    / station.snowWaterData.snow_water_equivalent_30_year_average
                    * 100
                )
                huc6ToAvgList[huc6].append(snowWaterEquivalentRelativeTo30Year)

        # it is possible for the average to be None if the entire huc6 has no data
        averagedAverages: dict[str, float | None] = {}
        for huc6 in huc6ToAvgList:
            # Since some hucs have no average, we want to skip them
            huc06NonNullAvgs = [x for x in huc6ToAvgList[huc6] if x is not None]
            averagedAverages[huc6] = (
                (sum(huc06NonNullAvgs) / len(huc06NonNullAvgs))
                if huc06NonNullAvgs
                else None
            )

        return averagedAverages

    def _make_station_dict(
        self,
        idTo30YearSnowWaterEquivalent: StationTripleToSnowWaterEquivalent,
        idToYesterdaySnowWaterEquivalent: StationTripleToSnowWaterEquivalent,
    ):
        """
        Merge the data from yesterday and 30 year average
        into one data dict
        """
        allmetadata = get_all_snotel_station_metadata(self.redis_cache)
        stations: dict[str, StationData] = {}
        for id, valueToday in idToYesterdaySnowWaterEquivalent.items():
            if valueToday is None:
                continue

            thirtyYearAvg = idTo30YearSnowWaterEquivalent.get(id)
            # some stations don't have 30 year data
            # if this is the case, skip them
            if thirtyYearAvg is None:
                continue

            if id not in allmetadata:
                continue

            stations[id] = StationData(
                snowWaterData=SnowWaterEquivalentData(
                    snow_water_equivalent_yesterday=valueToday,
                    snow_water_equivalent_30_year_average=thirtyYearAvg,
                ),
                metadata=allmetadata[id],
            )

        return stations


def get_yesterdays_month_and_day():
    """Return the month and day of yesterday in a format that awdb expects"""
    return (datetime.now() - timedelta(days=1)).strftime("%m-%d")


def get_30_year_snow_water_equivalent_average(
    cache: RedisCache, month_and_date: str
) -> dict[str, float]:
    """
    Fetch the json file from the awdb api; this file represents the 30 year average
    for each snotel station; the first item for each station is the year of the start
    of the data and each subsequent item is the average for that year; i.e. if
    index 0: 2015 and index 1: 5 then that makes the average of 2016 was 5

    Definition: WTEQ is the depth of water that would result if the entire snowpack were to melt instantaneously.
    """
    url = f"https://nwcc-apps.sc.egov.usda.gov/awdb/data/WTEQ/DAILY/AVG/WTEQ_DAILY_AVG_{month_and_date}.json"
    asJson = await_(cache.get_or_fetch_json(url))
    snotelStationTripleToSnowWaterEquivalent: dict[str, float] = {}
    for station in asJson:
        dataArray = asJson[station]
        assert len(dataArray) == 1
        thirtyYearAvgForToday = dataArray[0]
        snotelStationTripleToSnowWaterEquivalent[station] = thirtyYearAvgForToday

    return snotelStationTripleToSnowWaterEquivalent


def get_daily_snow_water_equivalent(
    cache: RedisCache, month_and_date: str
) -> dict[str, float]:
    """
    Returns the snow water equivalent for each snotel station; data may be missing
    if you fetch for the current day and the day is not yet complete

    Definition: WTEQ is the depth of water that would result if the entire snowpack were to melt instantaneously.
    """
    url = f"https://nwcc-apps.sc.egov.usda.gov/awdb/data/WTEQ/DAILY/OBS/WTEQ_DAILY_OBS_{month_and_date}.json"
    asJson = await_(cache.get_or_fetch_json(url))
    snotelStationTripleToWaterEquivalent: dict[str, float] = {}
    for station in asJson:
        dataArray = asJson[station]
        latestSnowWaterEquivalent = dataArray[-1]
        snotelStationTripleToWaterEquivalent[station] = latestSnowWaterEquivalent

    return snotelStationTripleToWaterEquivalent
