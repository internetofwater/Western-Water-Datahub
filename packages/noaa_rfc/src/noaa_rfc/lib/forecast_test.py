# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from noaa_rfc.lib.forecast import ForecastCollection
from noaa_rfc.noaa_rfc import NOAARFCProvider


def test_fetch_locations():
    collection = ForecastCollection()
    assert collection

    collection.drop_all_locations_but_id("AFPU1")

    assert len(collection.locations) == 3


def test_no_duplicates():
    provider = NOAARFCProvider(
        provider_def={"name": "test", "type": "feature", "data": "remote"}
    )
    assert provider

    items = provider.items()
    assert "features" in items
    seenIds = set()

    for item in items["features"]:
        assert item["id"] not in seenIds
        seenIds.add(item["id"])
