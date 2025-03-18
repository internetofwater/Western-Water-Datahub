# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Optional
from urllib.parse import urlparse
from pydantic import BaseModel
import pytest
import shapely.wkt
from rise.lib.cache import RISECache
from rise.lib.helpers import merge_pages, parse_bbox, parse_z, await_
from rise.lib.types.helpers import ZType


def test_merge_pages():
    fetched_mock = {
        "https://data.usbr.gov/rise/api/location2": {
            "data": [
                {"id": "https://data.usbr.gov/rise/api/catalog-item/128564"},
                {"id": "https://data.usbr.gov/rise/api/catalog-item/128565"},
            ]
        },
        "https://data.usbr.gov/rise/api/location1": {
            "data": [
                {"id": "https://data.usbr.gov/rise/api/catalog-item/128562"},
                {"id": "https://data.usbr.gov/rise/api/catalog-item/128563"},
            ]
        },
    }

    merged = merge_pages(fetched_mock)
    assert merged["data"] == [
        {"id": "https://data.usbr.gov/rise/api/catalog-item/128564"},
        {"id": "https://data.usbr.gov/rise/api/catalog-item/128565"},
        {"id": "https://data.usbr.gov/rise/api/catalog-item/128562"},
        {"id": "https://data.usbr.gov/rise/api/catalog-item/128563"},
    ]


def test_integration_merge_pages():
    url = "https://data.usbr.gov/rise/api/location?itemStructureId=1"
    cache = RISECache()
    totalitems = await_(cache.get_or_fetch(url))["meta"]["totalItems"]
    pages = await_(cache.get_or_fetch_all_pages(url))
    merged = merge_pages(pages)
    assert merged is not None
    assert "data" in merged
    assert merged["data"], merged
    assert len(merged["data"]) == totalitems, merged["data"]


def test_z_parse():
    assert (ZType.SINGLE, [10]) == parse_z("10")
    assert (ZType.RANGE, [10, 20]) == parse_z("10/20")
    assert (ZType.ENUMERATED_LIST, [10, 20, 30]) == parse_z("10,20,30")

    assert (ZType.ENUMERATED_LIST, [100, 150]) == parse_z("R2/100/50")

    with pytest.raises(Exception):
        parse_z("10/20/30")

    with pytest.raises(Exception):
        parse_z("10//30")

    with pytest.raises(Exception):
        parse_z("10,20,30,")


def test_parse_bbox():
    bbox = ["-6.0", "50.0", "-4.35", "52.0"]
    parse_result = parse_bbox(bbox)
    shapely_bbox = parse_result[0]
    assert shapely_bbox
    zval = parse_result[1]
    assert not zval

    wkt = "POINT(-5.0 51)"
    single_point = shapely.wkt.loads(wkt)

    parse_result = parse_bbox(bbox)
    if parse_result[0]:
        assert parse_result[0].contains(single_point)
    else:
        assert False


def test_parse_query_params():
    url = "https://example.com?param1=value1&param2=value2"
    parsed_url = urlparse(url)
    assert bool(parsed_url.query)
    url2 = "https://example.com"
    parsed_url2 = urlparse(url2)
    assert not bool(parsed_url2.query)

    url3 = "https://example.com?"
    parsed_url3 = urlparse(url3)
    assert not bool(parsed_url3.query)


def test_dump_none():
    class DummyNestedModel(BaseModel):
        a: Optional[int] = None
        b: Optional[str] = None

    class DummyModel(BaseModel):
        a: int
        b: DummyNestedModel

    model = DummyModel(a=1, b=DummyNestedModel(a=1, b=None))
    assert model.model_dump() == {"a": 1, "b": {"a": 1, "b": None}}
    assert model.model_dump(exclude_none=True) == {"a": 1, "b": {"a": 1}}
