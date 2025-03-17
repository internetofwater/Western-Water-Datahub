# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import Literal, Optional


from pygeoapi.provider.base import BaseProvider
from pygeoapi.util import crs_transform
from rise.env import TRACER
from rise.lib.cache import RISECache
from rise.lib.location import LocationResponse
from rise.rise_edr import RiseEDRProvider
from rise.lib.helpers import merge_pages, await_

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

    @TRACER.start_as_current_span("items")
    def items(
        self,
        bbox: list = [],
        datetime_: Optional[str] = None,
        resulttype: Optional[Literal["hits", "results"]] = "results",
        limit: Optional[int] = None,
        itemId: Optional[str] = None,
        offset: Optional[int] = 0,
        skip_geometry: Optional[bool] = False,
        **kwargs,
    ):
        response: LocationResponse
        if itemId:
            # Instead of merging all location pages, just
            # fetch the location associated with the ID
            url: str = f"https://data.usbr.gov/rise/api/location/{itemId}"
            raw_resp = await_(self.cache.get_or_fetch(url))
            response = LocationResponse(**raw_resp)
        else:
            all_location_responses = await_(
                self.cache.get_or_fetch_all_pages(RiseEDRProvider.LOCATION_API)
            )
            merged_response = merge_pages(all_location_responses)
            response = LocationResponse(**merged_response)

        if datetime_:
            response = response.drop_outside_of_date_range(datetime_)

        if offset:
            response = response.drop_before_offset(offset)

        if limit:
            response = response.drop_after_limit(limit)

        # Even though bbox is required, it can be an empty list. If it is empty just skip filtering
        if bbox:
            response = response.drop_outside_of_bbox(bbox)

        if resulttype == "hits":
            return {
                "type": "FeatureCollection",
                "features": [],
                "numberMatched": len(response.data),
            }

        return response.to_geojson(skip_geometry)

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
        return self.cache.get_or_fetch_parameters()
