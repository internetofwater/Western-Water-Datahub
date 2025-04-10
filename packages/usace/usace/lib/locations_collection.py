import json
from com.cache import RedisCache
from com.geojson.helpers import GeojsonFeatureCollectionDict, GeojsonFeatureDict
from com.helpers import await_
import msgspec
from usace.lib import types


class LocationColletion:
    def __init__(self):
        self.cache = RedisCache()
        url = "https://water.sec.usace.army.mil/cda/reporting/providers/projects?fmt=geojson"

        res = await_(self.cache.get_or_fetch_response_text(url))
        assert msgspec.json.decode(res, type=list[types.Project]), (
            f"{res} did not match expected schema"
        )
        self.locations: list[GeojsonFeatureDict] = json.loads(res)
        for loc in self.locations:
            loc["id"] = loc["properties"]["location_code"]
            loc["properties"]["name"] = loc["properties"]["public_name"]

    def to_geojson(self) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        if len(self.locations) == 1:
            return self.locations[0]
        return {"type": "FeatureCollection", "features": self.locations}

    def drop_all_locations_but_id(self, location_id: str):
        self.locations = [
            loc for loc in self.locations if loc["id"] == int(location_id)
        ]
        assert len(self.locations) == 1
