import requests
from rise.cache import RISECache
from rise.covjson import CovJSONBuilder
from rise.custom_types import LocationResponse
import json

from rise.edr_helpers import LocationHelper


def test_one_location():
    headers = {"accept": "application/vnd.api+json"}
    r: LocationResponse = requests.get(
        "https://data.usbr.gov/rise/api/location/1?page=1&itemsPerPage=25",
        headers=headers,
    ).json()

    cache = RISECache()

    CovJSONBuilder(cache).render(r)


def test_fill_catalogItems():
    with open("rise/tests/data/location.json") as f:
        data = json.load(f)
        assert len(data["data"]) == 25

        res = LocationHelper.filter_by_id(data, identifier="6902")
        assert res["data"][0]["attributes"]["_id"] == 6902
        assert len(res["data"]) == 1
        assert (
            res["data"][0]["relationships"]["catalogItems"]["data"][0]["id"]
            == "/rise/api/catalog-item/128632"
        ), print(res["data"][0]["relationships"]["catalogItems"])

        # Fill in the catalog items and make sure that the only two
        # remaining catalog items are the catalog items associated with location
        # 6902 since we previously filtered to just that location
        cache = RISECache()

        expanded = CovJSONBuilder(cache).get_location_response_with_results(
            res, time_filter=None
        )

        assert expanded["data"][0]["relationships"]["catalogItems"] is not None

        assert len(expanded["data"][0]["relationships"]["catalogItems"]["data"]) == 2

        # Expanded is flakey and can return in either order, so we just check both
        assert (
            expanded["data"][0]["relationships"]["catalogItems"]["data"][0]["id"]
            == "/rise/api/catalog-item/128632"
            or expanded["data"][0]["relationships"]["catalogItems"]["data"][0]["id"]
            == "/rise/api/catalog-item/128633"
        )
        assert (
            expanded["data"][0]["relationships"]["catalogItems"]["data"][1]["id"]
            == "/rise/api/catalog-item/128633"
            or expanded["data"][0]["relationships"]["catalogItems"]["data"][1]["id"]
            == "/rise/api/catalog-item/128632"
        )


def test_expand_with_results():
    with open("rise/tests/data/location.json") as f:
        data = json.load(f)

        # filter just 268 which contains catalog item 4 which has results
        res = LocationHelper.filter_by_id(data, identifier="268")
        cache = RISECache()

        expanded = CovJSONBuilder(cache).get_location_response_with_results(
            res, time_filter=None
        )

        assert expanded["data"][0]["relationships"]["catalogItems"] is not None

        assert len(expanded["data"][0]["relationships"]["catalogItems"]["data"]) == 5

    ids = [
        item["id"]
        for item in expanded["data"][0]["relationships"]["catalogItems"]["data"]
    ]
    assert "/rise/api/catalog-item/4" in ids
    assert "/rise/api/catalog-item/141" in ids
    assert "/rise/api/catalog-item/142" in ids
    assert "/rise/api/catalog-item/144" in ids
    assert "/rise/api/catalog-item/11279" in ids
