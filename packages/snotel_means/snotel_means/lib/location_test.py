# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT


from packages.snotel_means.snotel_means.lib.locations import (
    WaterTemperatureCollectionWithMetadata,
    get_30_year_water_temp_average,
    get_all_snotel_station_metadata,
    get_water_temp,
    get_yesterdays_month_and_day,
)


def test_get_30_year_water_temp_avg():
    yesterday = get_yesterdays_month_and_day()
    mapper = get_30_year_water_temp_average(yesterday)
    assert len(mapper) > 0


def test_get_water_temp():
    yesterday = get_yesterdays_month_and_day()
    mapper = get_30_year_water_temp_average(yesterday)
    assert len(mapper) > 0


def test_get_geometry():
    result = get_all_snotel_station_metadata()
    assert len(result) > 0


def test_construct_collection():
    yesterday = get_yesterdays_month_and_day()
    averages = get_30_year_water_temp_average(yesterday)
    assert len(averages) > 0

    daily = get_water_temp(yesterday)
    assert len(daily) > 0

    collection = WaterTemperatureCollectionWithMetadata._make_station_dict(
        averages, daily
    )
    assert len(collection) > 0
