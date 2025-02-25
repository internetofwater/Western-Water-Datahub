# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import Optional

import requests

from pygeoapi.provider.base import BaseProvider, ProviderNoDataError, ProviderQueryError
from rise.custom_types import LocationResponse
from rise.rise_edr import RiseEDRProvider
from rise.edr_helpers import (
    LocationHelper,
    RISECache,
)
from rise.lib import get_only_key, merge_pages

LOGGER = logging.getLogger(__name__)


class RiseProvider(BaseProvider):
    """Rise Provider for OGC API Features"""

    def __init__(self, provider_def):
        """
        Initialize object
        :param provider_def: provider definition
        """

        try:
            self.cache = RISECache(provider_def["cache"])
        except KeyError:
            LOGGER.error(
                "You must specify a cache implementation in the config.yml for RISE"
            )
            raise

        super().__init__(provider_def)

    def items(
        self,
        bbox: list = [],
        datetime_: Optional[str] = None,
        limit: Optional[int] = None,
        itemId: Optional[str] = None,
        offset: Optional[int] = 0,
        **kwargs,
    ):
        if itemId:
            try:
                str(int(itemId))
            except ValueError:
                raise ProviderQueryError(
                    f"ID should be able to be converted to int but got: {itemId}"
                )

            # Instead of merging all location pages, just
            # fetch the location associated with the ID
            single_endpoint_response = requests.get(
                RiseEDRProvider.LOCATION_API,
                headers={"accept": "application/vnd.api+json"},
                params={"id": itemId},
            )

            if not single_endpoint_response.ok:
                raise ProviderQueryError(single_endpoint_response.text)
            else:
                response: LocationResponse = single_endpoint_response.json()

        else:
            all_location_responses = self.cache.get_or_fetch_all_pages(
                RiseEDRProvider.LOCATION_API
            )
            merged_response = merge_pages(all_location_responses)
            response: LocationResponse = get_only_key(merged_response)
            if response is None:
                raise ProviderNoDataError

        if datetime_:
            response = LocationHelper.filter_by_date(response, datetime_)

        if offset:
            response = LocationHelper.remove_before_offset(response, offset)

        if limit:
            response = LocationHelper.filter_by_limit(response, limit)

        # Even though bbox is required, it can be an empty list. If it is empty just skip filtering
        if bbox:
            response = LocationHelper.filter_by_bbox(response, bbox)

        return LocationHelper.to_geojson(response, single_feature=itemId is not None)

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
