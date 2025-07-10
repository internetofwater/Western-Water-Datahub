# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT


from packages.snotel_means.snotel_means.lib.locations import (
    SnotelMeansLocationCollection,
)


def test_filter_by_id():
    collection = SnotelMeansLocationCollection()
    assert len(collection.locations) > 0
