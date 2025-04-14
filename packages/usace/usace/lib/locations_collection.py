# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import cast
from com.cache import RedisCache
from com.geojson.helpers import GeojsonFeatureCollectionDict, GeojsonFeatureDict
from com.helpers import EDRFieldsMapping, await_
import orjson
from rise.lib.covjson.types import CoverageCollectionDict
from usace.lib.types.geojson_response import FeatureCollection


class LocationCollection:
    def __init__(self):
        self.cache = RedisCache()
        url = "https://water.sec.usace.army.mil/cda/reporting/providers/projects?fmt=geojson"

        res = await_(self.cache.get_or_fetch_response_text(url))
        self.fc = FeatureCollection.model_validate(
            {
                "type": "FeatureCollection",
                "features": orjson.loads(res),
            }
        )
        for loc in self.fc.features:
            loc.id = str(loc.properties.location_code)
            loc.properties.name = loc.properties.public_name

    def to_geojson(self) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        if len(self.fc.features) == 1:
            return cast(GeojsonFeatureDict, self.fc.features[0].model_dump())
        return cast(GeojsonFeatureCollectionDict, self.fc.model_dump())

    def to_covjson(self) -> CoverageCollectionDict:
        raise NotImplementedError

    def drop_all_locations_but_id(self, location_id: str):
        self.fc.features = [loc for loc in self.fc.features if loc.id == location_id]
        assert len(self.fc.features) == 1

    def get_fields(self) -> EDRFieldsMapping:
        fields: EDRFieldsMapping = {}
        for location in self.fc.features:
            params = location.properties.timeseries
            if not params:
                continue
            for param in params:
                fields[param.tsid] = {
                    "title": param.label,
                    "type": "string",
                    "description": f"{param.label} ({param.unit_long_name}) with id {param.tsid}",
                    "x-ogc-unit": param.unit,
                }
        return fields
