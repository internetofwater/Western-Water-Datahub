from awdb_forecasts.awdb_forecasts import AwdbForecastsProvider
from com.protocol import OAFProviderProtocol
from noaa_rfc.noaa_rfc import NOAARFCProvider
from rise.rise import RiseProvider
from snotel.snotel import SnotelProvider
from usace.usace import USACEProvider
import pytest

provider_def = {
    "name": "test",
    "type": "feature",
    "data": "remote",
}


@pytest.mark.parametrize(
    "provider_class",
    [
        USACEProvider,
        RiseProvider,
        AwdbForecastsProvider,
        SnotelProvider,
        NOAARFCProvider,
    ],
)
def test_oaf_provider(provider_class):
    provider: OAFProviderProtocol = provider_class(provider_def=provider_def)

    allItems = provider.items()
    assert len(allItems) > 0

    def test_single_item():
        assert "features" in allItems
        firstItem = allItems["features"][0]
        singleItem = provider.items(itemId=str(firstItem["id"]), skip_geometry=True)
        assert "features" not in singleItem
        assert not singleItem["geometry"]

    test_single_item()

    def test_offset_and_limit():
        offsetAndLimit = provider.items(offset=1, limit=1)
        assert "features" in offsetAndLimit
        assert len(offsetAndLimit["features"]) == 1
        assert "features" in allItems
        assert offsetAndLimit["features"][0] == allItems["features"][1]

    test_offset_and_limit()

    def test_hit_count():
        hitCount = provider.items(resulttype="hits")
        assert "numberMatched" in hitCount
        assert "features" in allItems
        assert hitCount["numberMatched"] == len(allItems["features"])

    test_hit_count()

    def test_filter_out_features_by_properties():
        fields = provider.get_fields()
        assert len(fields) > 0
        # with pytest.raises(ProviderQueryError):
        #     provider.items(properties=[("DUMMY", "DUMMY")])

        firstProperty = list(fields.keys())[0]
        dummyVal: str | int | float
        # generate a dummy value that is the same type as the first property
        # so we can filter without getting a type error
        match type := fields[firstProperty]["type"]:
            case "string":
                dummyVal = "____DUMMY"
            case "number":
                dummyVal = -99999.9999
            case "integer":
                dummyVal = -99999
            case _:
                raise AssertionError(f"Unknown field type {type}")

        out = provider.items(properties=[(firstProperty, str(dummyVal))])
        assert "features" in out
        # if we filter by a dummy value, we expect no features to be returned
        assert len(out["features"]) == 0

    test_filter_out_features_by_properties()

    def test_sort_by_properties():
        fields = provider.get_fields()
        assert len(fields) > 0
        firstProperty = list(fields.keys())[0]
        out = provider.items(sortby=[{"property": firstProperty, "order": "+"}])
        assert "features" in out
        assert len(out["features"]) >= 3, (
            "There were less than 3 features returned so we can't test sorting"
        )
        assert (
            out["features"][0]["properties"][firstProperty]
            <= out["features"][1]["properties"][firstProperty]
            <= out["features"][2]["properties"][firstProperty]
        )
        out = provider.items(sortby=[{"property": firstProperty, "order": "-"}])
        assert "features" in out
        assert len(out["features"]) >= 3, (
            "There were less than 3 features returned so we can't test sorting"
        )
        assert (
            out["features"][0]["properties"][firstProperty]
            >= out["features"][1]["properties"][firstProperty]
            >= out["features"][2]["properties"][firstProperty]
        )

    test_sort_by_properties()

    def test_filter_by_bounding_box():
        # We can test it works but we can't test it returns the right features
        # without a lot of extra work in the test since some features can have no geometry
        out = provider.items(bbox=[-180, -90, 180, 90])
        assert "features" in out

    test_filter_by_bounding_box()

    def test_filter_out_extra_parameters():
        out = provider.items(
            select_properties=["DUMMY"],
        )
        assert "features" in out
        assert out["features"][0]["properties"] == {}

    test_filter_out_extra_parameters()
