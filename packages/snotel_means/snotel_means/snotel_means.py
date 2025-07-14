# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import json
import logging
from pathlib import Path
from typing import Literal, Optional

from com.helpers import get_oaf_fields_from_pydantic_model
from com.otel import otel_trace
from com.protocols.providers import OAFProviderProtocol
import geojson_pydantic
from pygeoapi.provider.base import BaseProvider
from pygeoapi.util import crs_transform
from com.geojson.helpers import (
    GeojsonFeatureDict,
    GeojsonFeatureCollectionDict,
    SortDict,
)
from com.cache import RedisCache
from awdb_com.types import StationDTO

from snotel_means.lib.locations import (
    WaterTemperatureCollectionWithMetadata,
)

LOGGER = logging.getLogger(__name__)

# Load this one time up front to speed things up
with open(Path(__file__).parent.parent / "huc06.json") as f:
    huc06_json = json.load(f)
    HUC06_TO_FEATURE = {}
    for feature in huc06_json["features"]:
        HUC06_TO_FEATURE[feature["id"]] = feature


class SnotelMeansProvider(BaseProvider, OAFProviderProtocol):
    """Rise Provider for OGC API Features"""

    def __init__(self, provider_def):
        """
        Initialize object
        :param provider_def: provider definition
        """
        super().__init__(provider_def)
        self.cache = RedisCache()
        self.get_fields()

    @otel_trace()
    def items(
        self,
        bbox: list = [],
        datetime_: Optional[str] = None,
        resulttype: Optional[Literal["hits", "results"]] = "results",
        # select only features that contains all the `select_properties` values
        select_properties: Optional[
            list[str]
        ] = None,  # query this with ?properties in the actual url
        # select only features that contains all the `properties` with their corresponding values
        properties: list[tuple[str, str]] = [],
        sortby: Optional[list[SortDict]] = None,
        limit: Optional[int] = None,
        itemId: Optional[
            str
        ] = None,  # unlike edr, this is a string; we need to case to an int before filtering
        offset: Optional[int] = 0,
        skip_geometry: Optional[bool] = False,
        **kwargs,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        collection = WaterTemperatureCollectionWithMetadata()

        hucToAverage = collection.get_averages_by_huc6()
        relevant_features: list[geojson_pydantic.Feature] = []

        for huc6 in hucToAverage:
            if offset:
                offset -= 1
                continue
            huc6_feature = HUC06_TO_FEATURE[huc6]
            if itemId and huc6 != itemId:
                continue
            featureProperties: dict = huc6_feature["properties"] or {}
            # we have to copy here since we're modifying the dict
            # and we need our API to be threadsafe
            mergedDict: dict = featureProperties.copy()
            mergedDict.update(
                {
                    "snowppack_water_temp_avg_relative_to_thirty_year_avg": hucToAverage[
                        huc6
                    ]
                }
            )
            relevant_features.append(
                geojson_pydantic.Feature(
                    type="Feature",
                    id=huc6,
                    geometry=huc6_feature["geometry"] if not skip_geometry else None,
                    properties=mergedDict,
                )
            )
            if limit and len(relevant_features) >= limit:
                break
            if itemId:
                return relevant_features[0].model_dump(by_alias=True)

        return geojson_pydantic.FeatureCollection(
            type="FeatureCollection", features=relevant_features
        ).model_dump(by_alias=True)

    @crs_transform
    def query(self, **kwargs):
        return self.items(**kwargs)

    def get(self, identifier, **kwargs):
        """
        query CSV id

        :param identifier: feature id

        :returns: dict of single GeoJSON feature
        """

        return self.items(itemId=identifier, bbox=[], **kwargs)

    def get_fields(self, **kwargs):
        """
        Get provider field information (names, types)

        Example response: {'field1': 'string', 'field2': 'number'}

        :returns: dict of field names and their associated JSON Schema types
        """
        if not self._fields:
            self._fields = get_oaf_fields_from_pydantic_model(StationDTO)
        return self._fields
