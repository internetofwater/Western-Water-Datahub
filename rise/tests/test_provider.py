from pytest import FixtureRequest
import requests
import pytest

from pygeoapi.provider.base import ProviderQueryError
from rise.rise import RiseProvider
from rise.rise_edr import RiseEDRProvider
import datetime


@pytest.fixture(params=["redis", "shelve"])
def edr_config(request: type[FixtureRequest]):
    cache_type = request.param  # type: ignore
    config = {
        "name": "RISE_EDR_Provider",
        "type": "edr",
        "cache": cache_type,
        "url": "https://data.usbr.gov/rise/api/",
    }
    return config


def test_location_locationId(edr_config: dict):
    p = RiseEDRProvider(edr_config)
    out = p.locations(location_id=1, format_="covjson")
    # Returns 3 since we have 3 parameters in the location
    assert len(out["coverages"]) == 3
    # invalid location should return nothing
    out = p.locations(location_id=1111111111111111)
    assert len(out["coverages"]) == 0

    geojson_out: dict = p.locations(location_id=1, format_="geojson")  # type: ignore For some reason mypy complains
    assert geojson_out["type"] == "Feature"
    assert geojson_out["id"] == 1


def test_get_fields(edr_config: dict):
    p = RiseEDRProvider(edr_config)
    fields = p.get_fields()

    # test to make sure a particular field is there
    assert fields["2"]["title"] == "Lake/Reservoir Elevation"

    assert requests.get(
        "https://data.usbr.gov/rise/api/parameter?page=1&itemsPerPage=25",
        headers={"accept": "application/vnd.api+json"},
    ).json()["meta"]["totalItems"] == len(fields)


def test_get_or_fetch_all_param_filtered_pages(edr_config: dict):
    p = RiseEDRProvider(edr_config)
    params = ["812", "6"]
    bothparams = p.get_or_fetch_all_param_filtered_pages(params)
    assert len(bothparams["data"]) == 10 + 13

    params = ["6"]
    oneparam = p.get_or_fetch_all_param_filtered_pages(params)
    assert len(oneparam["data"]) == 13

    assert len(bothparams["data"]) > len(oneparam["data"])


def test_location_select_properties(edr_config: dict):
    # Currently in pygeoapi we use the word "select_properties" as the
    # keyword argument. This is hold over from OAF it seems.

    p = RiseEDRProvider(edr_config)

    # out = p.locations(select_properties=["DUMMY-PARAM"], format_="geojson")
    # assert len(out["features"]) == 0  # type: ignore ; issues with pyright union types

    # out = p.locations(select_properties=["18"], format_="geojson")
    # assert len(out["features"]) > 0  # type: ignore

    out_prop_2 = p.locations(select_properties=["2"], format_="geojson")
    for f in out_prop_2["features"]:  # type: ignore
        if f["id"] == 1:  # location 1 is associated with property 2
            break
    else:
        # if location 1 isn't in the responses, then something is wrong
        assert False

    out_812 = p.locations(
        select_properties=["812"], format_="geojson"
    )  # has 10 features
    out_6 = p.locations(select_properties=["6"], format_="geojson")  # has 13 features

    assert len(out_812["features"]) < len(out_6["features"])  # type: ignore

    out_812_6 = p.locations(select_properties=["812", "6"], format_="geojson")

    assert len(out_812_6["features"]) == len(out_812["features"]) + len(  # type: ignore
        out_6["features"]  # type: ignore
    )


def test_location_datetime(edr_config: dict):
    p = RiseEDRProvider(edr_config)

    out = p.locations(location_id=1536, datetime_="2017-01-01/2018-01-01")

    start = datetime.datetime.fromisoformat("2017-01-01T00:00:00+00:00")
    end = datetime.datetime.fromisoformat("2018-01-01T00:00:00+00:00")

    for param in out["coverages"]:
        for time_val in param["domain"]["axes"]["t"]["values"]:
            assert start <= datetime.datetime.fromisoformat(time_val) <= end


def test_area(edr_config: dict):
    p = RiseEDRProvider(edr_config)

    # TODO: test this more thoroughly
    p.area(
        # location 291
        wkt="GEOMETRYCOLLECTION(POLYGON ((-5.976563 55.677584, 11.425781 47.517201, 16.699219 53.225768, -5.976563 55.677584)), POLYGON ((-99.717407 28.637568, -97.124634 28.608637, -97.020264 27.210671, -100.184326 26.980829, -101.392822 28.139816, -99.717407 28.637568)))",
        format_="geojson",
    )


@pytest.fixture(params=["redis", "shelve"])
def oaf_config(request: type[FixtureRequest]):
    cache_type = request.param  # type: ignore
    config = {
        "name": "RISE_EDR_Provider",
        "type": "feature",
        "title_field": "name",
        "cache": cache_type,
        "data": "https://data.usbr.gov/rise/api/",
    }
    return config


def test_item(oaf_config: dict):
    p = RiseProvider(oaf_config)
    out = p.items(itemId="1")
    out = out
    assert out["id"] == 1
    assert out["type"] == "Feature"

    with pytest.raises(ProviderQueryError):
        out = p.items(itemId="__INVALID")

    out = p.items(limit=10)
    assert len(out["features"]) == 10


def test_cube(edr_config: dict):
    p = RiseEDRProvider(edr_config)

    # random location near corpus christi should return only one feature
    # TODO: test this more thoroughly
    p.area(
        wkt="POLYGON ((-98.96918309080456 28.682352643651612, -98.96918309080456 26.934669197978764, -94.3740448509505 26.934669197978764, -94.3740448509505 28.682352643651612, -98.96918309080456 28.682352643651612))"
    )

    # Test the bermuda triangle. Spooky...
    # TODO: test this more thoroughly
    p.area(wkt="POLYGON ((-64.8 32.3, -65.5 18.3, -80.3 25.2, -64.8 32.3))")


def test_polygon_output(edr_config: dict):
    """make sure that a location which has a polygon in it doesn't throw an error"""
    # location id 3526 is a polygon
    p = RiseEDRProvider(edr_config)

    out = p.locations(location_id=3526, format_="covjson")

    assert out["type"] == "CoverageCollection"
