from com.cache import RedisCache
from com.helpers import await_
import usace.lib.types as types
import msgspec


class ParameterCollection:
    parameters: list[types.Parameter]

    def __init__(self) -> None:
        url = "https://cwms-data.usace.army.mil/cwms-data/parameters"
        res = await_(
            RedisCache().get_or_fetch_response_text(
                url, headers={"accept": "application/json;version=2"}
            )
        )
        self.parameters = msgspec.json.decode(res, type=list[types.Parameter])
