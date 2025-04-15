# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from noaa_rfc.lib.forecast import ForecastCollection


def test_fetch_locations():
    collection = ForecastCollection()
    assert collection

    collection.drop_all_locations_but_id("AFPU1")

    assert len(collection.locations) == 3
