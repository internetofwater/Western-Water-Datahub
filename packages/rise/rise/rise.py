# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import Literal, Optional

from com.helpers import FieldsMapping, get_oaf_fields_from_pydantic_model
from pygeoapi.provider.base import BaseProvider
from pygeoapi.util import crs_transform
from com.env import TRACER
from rise.lib.cache import RISECache
from com.geojson.types import GeojsonFeatureCollectionDict
from rise.lib.location import LocationResponseWithIncluded
from rise.lib.types.location import LocationDataAttributes
from rise.lib.types.sorting import SortDict

LOGGER = logging.getLogger(__name__)


class RiseProvider(BaseProvider):
    """Rise Provider for OGC API Features"""

    def __init__(self, provider_def):
        """
        Initialize object
        :param provider_def: provider definition
        """
        self.cache = RISECache()
        super().__init__(provider_def)
        self.get_fields()

    @TRACER.start_as_current_span("items")
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
    ) -> GeojsonFeatureCollectionDict:
        # we don't filter by parameters here since OAF filters features by
        # the attributes of the feature, not the parameters of the associated timeseries data
        raw_resp = self.cache.get_or_fetch_all_param_filtered_pages()
        response = LocationResponseWithIncluded.from_api_pages(raw_resp)

        if itemId:
            response = response.drop_everything_but_one_location(int(itemId))

        if datetime_:
            response = response.drop_outside_of_date_range(datetime_)

        # Even though bbox is required, it can be an empty list. If it is empty just skip filtering
        if bbox:
            response = response.drop_outside_of_bbox(bbox)

        if offset:
            response = response.drop_before_offset(offset)

        if limit:
            response = response.drop_after_limit(limit)

        if resulttype == "hits":
            return {
                "type": "FeatureCollection",
                "features": [],
                "numberMatched": len(response.data),
            }

        return response.to_geojson(
            skip_geometry,
            select_properties=select_properties,
            properties=properties,
            fields_mapping=self._fields,
            sortby=sortby,
        )

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

    def get_fields(self, **kwargs) -> FieldsMapping:
        """
        Get provider field information (names, types)

        Example response: {'field1': 'string', 'field2': 'number'}

        :returns: dict of field names and their associated JSON Schema types
        """
        if not self._fields:
            self._fields = get_oaf_fields_from_pydantic_model(LocationDataAttributes)

        return self._fields
