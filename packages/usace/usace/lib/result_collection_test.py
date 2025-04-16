# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from com.helpers import await_
from usace.lib.locations_collection import LocationCollection


def test_fetch_associated_data():
    locations = LocationCollection()

    firstLocation = locations.locations[0]

    assert firstLocation.properties.timeseries
    firstTimeseries = firstLocation.properties.timeseries[0]

    start = "1903-05-14T15:32:25.520Z"
    end = "2023-05-15T15:32:25.520Z"
    results = await_(
        firstTimeseries._get_results(
            firstLocation.properties.provider, start_date=start, end_date=end
        )
    )
    assert results
    assert results.values
