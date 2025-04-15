# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from com.helpers import await_
import pytest
from rise.lib.cache import RISECache
from rise.lib.helpers import flatten_values, getResultUrlFromCatalogUrl
from rise.lib.location import LocationResponse
from rise.rise_edr import RiseEDRProvider


@pytest.fixture
def oneItemLocationRespFixture():
    url = "https://data.usbr.gov/rise/api/location/1?include=catalogRecords.catalogItems&page=1&itemsPerPage=5"
    cache = RISECache()
    resp = await_(cache.get_or_fetch_json(url))
    return resp


def test_get_catalogItemURLs(oneItemLocationRespFixture: dict):
    """Test getting the associated catalog items from the location response"""
    model = LocationResponse.model_validate(
        oneItemLocationRespFixture
    ).to_collection_with_included()
    urls = model.get_catalogItemURLs()
    for url in [
        "https://data.usbr.gov/rise/api/catalog-item/4222",
        "https://data.usbr.gov/rise/api/catalog-item/4223",
        "https://data.usbr.gov/rise/api/catalog-item/4225",
    ]:
        assert url in urls["/rise/api/location/1"]


def test_get_catalogItemUrlsForLocationWithNestedRelationships():
    url = "https://data.usbr.gov/rise/api/location/424?include=catalogRecords.catalogItems&itemStructureId=1&page=1&itemsPerPage=100"
    resp = await_(RISECache().get_or_fetch_json(url))
    model = LocationResponse.model_validate(resp).to_collection_with_included()
    urls = model.get_catalogItemURLs()
    assert len(flatten_values(urls)) >= 6


def test_associated_results_have_data(oneItemLocationRespFixture: dict):
    cache = RISECache()
    model = LocationResponse.model_validate(
        oneItemLocationRespFixture
    ).to_collection_with_included()
    urls = model.get_catalogItemURLs()
    for url in urls:
        resultUrl = getResultUrlFromCatalogUrl(url, datetime_=None)
        resp = await_(cache.get_or_fetch_json(resultUrl))
        assert resp["data"], resp["data"]


def test_filter_by_wkt(oneItemLocationRespFixture: dict):
    squareInOcean = "POLYGON ((-70.64209 40.86368, -70.817871 37.840157, -65.236816 38.013476, -65.500488 41.162114, -70.64209 40.86368))"
    emptyModel = LocationResponse.model_validate(oneItemLocationRespFixture)
    emptyModel.to_collection().drop_outside_of_wkt(squareInOcean)
    assert emptyModel.data == []
    entireUS = "POLYGON ((-144.492188 57.891497, -146.25 11.695273, -26.894531 12.382928, -29.179688 59.977005, -144.492188 57.891497))"
    fullModel = LocationResponse.model_validate(
        oneItemLocationRespFixture
    ).to_collection()
    fullModel.drop_outside_of_wkt(entireUS)
    assert len(fullModel.locations) == 1
    areaWhereLocation1IsLocatedInDenver = "GEOMETRYCOLLECTION (POLYGON ((-109.204102 47.010226, -104.655762 47.010226, -104.655762 49.267805, -109.204102 49.267805, -109.204102 47.010226)), POLYGON ((-106.578369 38.513788, -102.722168 38.513788, -102.722168 41.228249, -106.578369 41.228249, -106.578369 38.513788)))"
    denverModel = LocationResponse.model_validate(
        oneItemLocationRespFixture
    ).to_collection()
    denverModel.drop_outside_of_wkt(areaWhereLocation1IsLocatedInDenver)
    assert len(denverModel.locations) == 1
    victoriaTexas = "GEOMETRYCOLLECTION (POLYGON ((-97.789307 29.248063, -97.789307 29.25046, -97.789307 29.25046, -97.789307 29.248063)), POLYGON ((-97.588806 29.307956, -97.58606 29.307956, -97.58606 29.310351, -97.588806 29.310351, -97.588806 29.307956)), POLYGON ((-97.410278 28.347899, -95.314636 28.347899, -95.314636 29.319931, -97.410278 29.319931, -97.410278 28.347899)))"
    victoriaModel = LocationResponse.model_validate(
        oneItemLocationRespFixture
    ).to_collection()
    victoriaModel.drop_outside_of_wkt(victoriaTexas)
    assert len(victoriaModel.locations) == 0


def test_filter_everything_by_wkt():
    p = RiseEDRProvider()
    georgeWestTexasID291 = "POLYGON ((-98.66272 28.062286, -97.756348 28.062286, -97.756348 28.688178, -98.66272 28.688178, -98.66272 28.062286))"
    raw_resp = p.cache.get_or_fetch_all_param_filtered_pages()
    response = LocationResponse.from_api_pages(raw_resp)
    response.drop_outside_of_wkt(wkt=georgeWestTexasID291)
    length = len(response.locations)
    names = [location.attributes.locationName for location in response.locations]
    assert length == 1, names


def test_drop_locationid(oneItemLocationRespFixture: dict):
    model = LocationResponse.model_validate(oneItemLocationRespFixture).to_collection()
    # since the fixture is for location 1, make sure that if we drop location 1 everything is gone
    model.drop_specific_location(location_id=1)
    assert len(model.locations) == 0

    model.drop_specific_location(location_id=2)
    assert len(model.locations) == len(model.locations)


@pytest.fixture
def allItemsOnePageLocationRespFixture():
    url = "https://data.usbr.gov/rise/api/location?&include=catalogRecords.catalogItems?page=1&itemsPerPage=100"
    cache = RISECache()
    resp = await_(cache.get_or_fetch_json(url))
    return resp


def test_get_all_catalogItemURLs(allItemsOnePageLocationRespFixture: dict):
    model = LocationResponse.model_validate(
        allItemsOnePageLocationRespFixture
    ).to_collection_with_included()
    urls = flatten_values(model.get_catalogItemURLs())
    assert len(urls) > 400


def test_drop_by_location_id(allItemsOnePageLocationRespFixture: dict):
    model = LocationResponse.model_validate(
        allItemsOnePageLocationRespFixture
    ).to_collection_with_included()
    model.drop_all_locations_but_id(str(model.locations[0].attributes.id))
    assert len(model.locations) == 1

    model = LocationResponse.model_validate(
        allItemsOnePageLocationRespFixture
    ).to_collection_with_included()
    dataLength = len(model.locations)
    model.drop_specific_location(location_id=model.locations[0].attributes.id)
    assert len(model.locations) == dataLength - 1
