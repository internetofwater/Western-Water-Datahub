# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import Any, ClassVar, Optional
import requests

from pygeoapi.provider.base import (
    ProviderQueryError,
)
from pygeoapi.provider.base_edr import BaseEDRProvider
from rise.covjson import CovJSONBuilder
from rise.custom_types import LocationResponse
from rise.edr_helpers import (
    RISECache,
    LocationHelper,
)
from rise.lib import merge_pages, get_only_key

LOGGER = logging.getLogger(__name__)


class RiseEDRProvider(BaseEDRProvider):
    """Base EDR Provider"""

    LOCATION_API: ClassVar[str] = "https://data.usbr.gov/rise/api/location"
    BASE_API: ClassVar[str] = "https://data.usbr.gov"
    cache: RISECache

    def __init__(self, provider_def: dict[str, Any]):
        """
        Initialize object

        :param provider_def: provider definition

        :returns: rise.base_edr.RiseEDRProvider
        """
        try:
            self.cache = RISECache(provider_def["cache"])
        except KeyError:
            LOGGER.error(
                "You must specify a cache implementation in the config.yml for RISE"
            )
            raise

        provider_def = {
            "name": "Rise EDR",
            "type": "feature",
            "data": "remote",
        }

        super().__init__(provider_def)

        self.instances = []

    def get_or_fetch_all_param_filtered_pages(
        self, properties: Optional[list[str]] = None
    ) -> LocationResponse:
        """Return all locations which contain"""
        # RISE has an API for fetching locations by property/param ids. Thus, we want to fetch only relevant properties if we have them
        if properties:
            base_url = "https://data.usbr.gov/rise/api/location?&"
            for prop in properties:
                assert isinstance(prop, str)
                base_url += f"parameterId%5B%5D={prop}&"
            base_url = base_url.removesuffix("&")
        else:
            base_url = RiseEDRProvider.LOCATION_API
        response = self.cache.get_or_fetch_all_pages(base_url)
        response = merge_pages(response)
        response = get_only_key(response)
        return response

    @BaseEDRProvider.register()
    def locations(
        self,
        location_id: Optional[int] = None,
        datetime_: Optional[str] = None,
        select_properties: Optional[list[str]] = None,
        crs: Optional[str] = None,
        format_: Optional[str] = None,
        **kwargs,
    ):
        """
        Extract data from location
        """
        if not location_id and datetime_:
            raise ProviderQueryError("Can't filter by date on the entire ")

        LOGGER.warning(datetime_)

        if location_id:
            # Instead of merging all location pages, just
            # fetch the location associated with the ID
            response = requests.get(
                RiseEDRProvider.LOCATION_API,
                headers={"accept": "application/vnd.api+json"},
                params={"id": location_id},
            )

            if not response.ok:
                raise ProviderQueryError(response.text)
            else:
                response = response.json()

        else:
            response = self.get_or_fetch_all_param_filtered_pages(select_properties)

        if not any([crs, datetime_, location_id]) or format_ == "geojson":
            return LocationHelper.to_geojson(
                response,
                single_feature=True
                if location_id
                else False,  # Geojson is redered differently if there is just one feature
            )
        else:
            # When we return covjson we also end up filtering by datetime_ along the way
            return CovJSONBuilder(self.cache).render(response, datetime_)

    def get_fields(self):
        if self._fields:
            return self._fields

        self._fields = self.cache.get_or_fetch_parameters()

        return self._fields

    @BaseEDRProvider.register()
    def cube(
        self,
        bbox: list,
        datetime_: Optional[str] = None,
        select_properties: Optional[list] = None,
        z: Optional[str] = None,
        format_: Optional[str] = None,
        **kwargs,
    ):
        """
        Returns a data cube defined by bbox and z parameters

        :param bbox: `list` of minx,miny,maxx,maxy coordinate values as `float`
        :param datetime_: temporal (datestamp or extent)
        :param z: vertical level(s)
        :param format_: data format of output

        """

        response = self.get_or_fetch_all_param_filtered_pages(select_properties)

        if datetime_:
            response = LocationHelper.filter_by_date(response, datetime_)

        response = LocationHelper.filter_by_bbox(response, bbox, z)

        # match format_:
        #     case "json" | "GeoJSON" | _:
        # return LocationHelper.to_geojson(response)
        return CovJSONBuilder(self.cache).render(response, datetime_)

    @BaseEDRProvider.register()
    def area(
        self,
        # Well known text (WKT) representation of the geometry for the area
        wkt: str,
        select_properties: list[str] = [],
        datetime_: Optional[str] = None,
        z: Optional[str] = None,
        format_: Optional[str] = None,
        **kwargs,
    ):
        """
        Extract and return coverage data from a specified area.
        Example: http://localhost:5000/collections/rise-edr/area?coords=POLYGON((-124.566244%2042.000709%2C%20-124.566244%2046.292035%2C%20-116.463262%2046.292035%2C%20-116.463262%2042.000709%2C%20-124.566244%2042.000709))

        """

        response = self.get_or_fetch_all_param_filtered_pages(select_properties)

        if datetime_:
            response = LocationHelper.filter_by_date(response, datetime_)

        response = LocationHelper.filter_by_wkt(response, wkt, z)

        return CovJSONBuilder(self.cache).render(response, datetime_)

    @BaseEDRProvider.register()
    def items(self, **kwargs):
        """
        Retrieve a collection of items.

        :param kwargs: Additional parameters for the request.
        :returns: A GeoJSON representation of the items.
        """
        # We have to define this since pygeoapi has a limitation and needs both EDR and OAF for items
        # https://github.com/geopython/pygeoapi/issues/1748
        pass

    def __repr__(self):
        return "<RiseEDRProvider>"
