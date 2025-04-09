from com.cache import RedisCache
from com.helpers import await_
import msgspec
from usace.lib import types


class LocationColletion:
    def __init__(self):
        self.cache = RedisCache()
        url = "https://water.sec.usace.army.mil/cda/reporting/providers/projects"

        res = await_(self.cache.get_or_fetch_response_text(url))
        self.locations = msgspec.json.decode(res, type=list[types.Project])
