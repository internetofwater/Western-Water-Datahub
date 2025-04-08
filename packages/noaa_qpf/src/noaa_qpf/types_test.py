from com.cache import RedisCache
import pytest
from noaa_qpf.types import ForecastResponse


@pytest.mark.asyncio
async def test_parse_forecasts():
    url = "https://mapservices.weather.noaa.gov/vector/rest/services/precip/wpc_qpf/MapServer/13/query?where=1=1&outFields=*&f=json"
    cache = RedisCache()
    res = await cache.get_or_fetch_json(url)

    assert res
    ForecastResponse.model_validate(res)
