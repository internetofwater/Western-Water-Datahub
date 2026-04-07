# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import json
import logging
from pathlib import Path
from typing import Literal, Optional

from com.helpers import get_oaf_fields_from_pydantic_model
from com.otel import otel_trace
from com.protocols.providers import OAFProviderProtocol
from pygeoapi.provider.base import BaseProvider, ProviderNoDataError, ProviderQueryError
from pygeoapi.crs import crs_transform
from com.geojson.helpers import (
    GeojsonFeatureDict,
    GeojsonFeatureCollectionDict,
    SortDict,
)
from com.cache import RedisCache
from awdb_com.types import StationDTO

from snotel_means.lib.locations import (
    AllHuc6WithStationMetadata,
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
        # I can add these, they are just not implemented at the moment
        # since I don't believe they are needed anywhere and it simplifies the code
        if properties or sortby or datetime_ or bbox or select_properties:
            raise ProviderQueryError(
                "`properties` and `sortby` and `datetime` and `bbox` and `select_properties` are not supported"
            )

        collection = AllHuc6WithStationMetadata(self.cache, HUC06_TO_FEATURE)

        relevant_features: list[GeojsonFeatureDict] = []

        for huc6 in collection.huc6List:
            if offset:
                offset -= 1
                continue
            if itemId and huc6.id != itemId:
                continue
            if huc6.station_list == []:
                continue
            calculation_result = huc6.get_basin_index_percentage()
            if not calculation_result:
                continue
            relevant_features.append(
                {
                    "type": "Feature",
                    "id": huc6.id,
                    "geometry": huc6.geometry if not skip_geometry else None,
                    "properties": {
                        "id": huc6.id,
                        "name": huc6.name,
                        "station_list": huc6.station_list,
                        "current_snow_water_equivalent_relative_to_thirty_year_avg": calculation_result.basin_index,
                        "basin_index": calculation_result.basin_index,
                        "median_values": huc6.median_swe_values,
                        "latest_values": huc6.latest_swe_values,
                        "number_of_stations_used_for_basin_index_calculation": calculation_result.total_stations_used,
                        "geoconnex_url": f"https://geoconnex.us/ref/hu06/{huc6.id}",
                    },
                }
            )
            if limit and len(relevant_features) >= limit:
                break
            if itemId:
                return relevant_features[0]

        if resulttype == "hits":
            return {
                "type": "FeatureCollection",
                "features": [],
                "numberMatched": len(relevant_features),
            }
        if itemId and len(relevant_features) == 0:
            raise ProviderNoDataError(f"No data found for id {itemId}")

        return {
            "type": "FeatureCollection",
            "features": relevant_features,
        }

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
