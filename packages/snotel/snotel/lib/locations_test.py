# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT


import pytest
from snotel.lib.locations import LocationCollection


@pytest.fixture
def location_collection():
    return LocationCollection()


def test_filter_by_id(location_collection):
    brightonInSaltLakeCounty = "361"
    newCollection = location_collection.drop_all_locations_but_id(
        brightonInSaltLakeCounty
    )
    assert len(newCollection.locations) == 1
