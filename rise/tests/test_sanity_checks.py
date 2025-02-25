# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import redis
import requests
import shapely.wkt
import shapely.geometry

"""This file is solely for sanity checks on the upstream repo or underlying libs to make sure that queries are performing as our understanding expects"""


def test_rise_filter_by_param_list():
    """Make sure that rise is actually filtering by parameters correctly"""
    out812 = requests.get(
        "https://data.usbr.gov/rise/api/location?page=1&itemsPerPage=25&parameterId%5B%5D=812",
        headers={"accept": "application/vnd.api+json"},
    ).json()
    assert out812["meta"]["totalItems"] == 10
    assert len(out812["data"]) == out812["meta"]["totalItems"]

    out6 = requests.get(
        "https://data.usbr.gov/rise/api/location?page=1&itemsPerPage=25&parameterId%5B%5D=6",
        headers={"accept": "application/vnd.api+json"},
    ).json()
    assert out6["meta"]["totalItems"] == 13

    out_812_and_6 = requests.get(
        "https://data.usbr.gov/rise/api/location?page=1&itemsPerPage=25&parameterId%5B%5D=812&parameterId%5B%5D=6",
        headers={"accept": "application/vnd.api+json"},
    ).json()

    assert (
        out_812_and_6["meta"]["totalItems"]
        == out812["meta"]["totalItems"] + out6["meta"]["totalItems"]
    )


def test_rise_filter_result_by_date():
    url = "https://data.usbr.gov/rise/api/result?page=1&itemsPerPage=25&dateTime%5Bbefore%5D=2018-01-01&dateTime%5Bafter%5D=2017-01-01"

    response = requests.get(url, headers={"accept": "application/vnd.api+json"})
    date: str = response.json()["data"][0]["attributes"]["dateTime"]
    assert date.startswith("2017-01-01")


def test_rise_filter_invalid_returns_nothing():
    invalid = "https://data.usbr.gov/rise/api/result?page=1&itemsPerPage=25&dateTime%5Bbefore%5D=2016-01-01&dateTime%5Bafter%5D=2017-01-01"

    response = requests.get(invalid, headers={"accept": "application/vnd.api+json"})
    assert response.json()["meta"]["totalItems"] == 0
    assert len(response.json()["data"]) == 0


def test_rise_filter_by_same_start_and_end():
    """Make sure that if we set the same start and end, we get all the dates matching the start of the iso timestamp"""
    url = "https://data.usbr.gov/rise/api/result?page=1&itemsPerPage=25&dateTime%5Bbefore%5D=2017-01-01&dateTime%5Bafter%5D=2017-01-01"

    response = requests.get(url, headers={"accept": "application/vnd.api+json"})
    assert response.json()["meta"]["totalItems"] != 0
    assert len(response.json()["data"]) != 0


def test_shapely_sanity_check():
    geo: dict = {
        "type": "Point",
        "coordinates": [-104.855255, 39.651378],
    }

    result = shapely.geometry.shape(geo)

    wkt = "POLYGON((-79 40,-79 38,-75 38,-75 41,-79 40))"

    wkt_parsed = shapely.wkt.loads(wkt)
    assert not wkt_parsed.contains(result)

    assert int(float("4530.000000")) == 4530
    location_6902_geom = {
        "type": "Polygon",
        "coordinates": [
            [
                [-111.49544, 36.94029],
                [-111.49544, 36.99597],
                [-111.47861, 36.99597],
                [-111.47861, 36.94029],
                [-111.49544, 36.94029],
            ]
        ],
    }

    point_inside = "POINT(-111.48 36.95)"
    point_inside = shapely.wkt.loads(point_inside)

    assert shapely.geometry.shape(location_6902_geom).contains(point_inside)

    point_outside = "POINT(-111.5 46.95)"
    point_outside = shapely.wkt.loads(point_outside)

    assert not shapely.geometry.shape(location_6902_geom).contains(point_outside)


def test_redis():
    r = redis.Redis(host="redis", port=6379, db=0)
    assert r
    r.set("test", "test")
    val = r.get("test")
    assert val == b"test"
