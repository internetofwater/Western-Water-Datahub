from noaa_rfc.lib.forecast import ForecastCollection


def test_fetch_locations():
    res = ForecastCollection()
    assert res
