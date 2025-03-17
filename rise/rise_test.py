# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from pytest import FixtureRequest
import pytest
from rise.lib.cache import RISECache
from rise.lib.helpers import await_, merge_pages
from rise.lib.location import LocationResponse
from rise.rise import RiseProvider
from rise.rise_edr import RiseEDRProvider


def test_get_all_pages_for_items():
    cache = RISECache()
    all_location_responses = await_(
        cache.get_or_fetch_all_pages(RiseEDRProvider.LOCATION_API)
    )
    merged_response = merge_pages(all_location_responses)
    response = LocationResponse(**merged_response)
    assert response


@pytest.fixture()
def oaf_config(request: type[FixtureRequest]):
    config = {
        "name": "RISE_EDR_Provider",
        "type": "feature",
        "title_field": "name",
        "cache": "redis",
        "data": "https://data.usbr.gov/rise/api/",
    }
    return config


def test_item(oaf_config: dict):
    """Test what happens if we request one item; make sure the geojson is valid"""
    p = RiseProvider(oaf_config)
    out = p.items(itemId="1")
    out = out
    assert out["id"] == 1
    assert out["type"] == "Feature"

    with pytest.raises(Exception):
        out = p.items(itemId="__INVALID")

    out = p.items(limit=10)
    assert len(out["features"]) == 10


def test_resulttype_hits(oaf_config: dict):
    p = RiseProvider(oaf_config)
    out = p.items(resulttype="hits")
    assert len(out["features"]) == 0
    assert out["type"] == "FeatureCollection"
    # make sure numberMatched is greater than 0
    # we can't compare against a constant because it could
    # change but it should always be greater than 0
    assert out["numberMatched"] > 0


def test_skip_geometry(oaf_config: dict):
    p = RiseProvider(oaf_config)
    out = p.items(itemId="1", skip_geometry=True)
    assert out["type"] == "Feature"
    assert out["geometry"] is None
    outWithoutSkip = p.items(itemId="1")
    assert outWithoutSkip["type"] == "Feature"
    assert outWithoutSkip["geometry"]
