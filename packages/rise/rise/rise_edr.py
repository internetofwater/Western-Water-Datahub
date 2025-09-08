# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import ClassVar, Optional

from com.helpers import await_
from com.otel import otel_trace
from com.protocols.providers import EDRProviderProtocol
from pygeoapi.provider.base import ProviderQueryError, ProviderNoDataError
from pygeoapi.provider.base_edr import BaseEDRProvider
from rise.lib.covjson.covjson import CovJSONBuilder
from rise.lib.location import LocationResponse
from rise.lib.cache import RISECache
from rise.lib.add_results import LocationResultBuilder

LOGGER = logging.getLogger(__name__)


class RiseEDRProvider(BaseEDRProvider, EDRProviderProtocol):
    """The EDR Provider for the USBR Rise API"""

    LOCATION_API: ClassVar[str] = "https://data.usbr.gov/rise/api/location"
    BASE_API: ClassVar[str] = "https://data.usbr.gov"
    cache: RISECache

    def __init__(self, provider_def=None):
        """
        Initialize object

        :param provider_def: provider definition

        :returns: rise.base_edr.RiseEDRProvider
        """
        self.cache = RISECache()

        provider_def = {
            "name": "Rise EDR",
            "type": "feature",
            "data": "remote",
        } or provider_def

        BaseEDRProvider.__init__(self, provider_def)

        self.instances = []  # used so pygeoapi doesn't register the same query multiple times in the UI

    @otel_trace()
    def locations(
        self,
        location_id: Optional[str] = None,
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
            raise ProviderQueryError("Can't filter by date on every location")

        raw_resp = self.cache.get_or_fetch_all_param_filtered_pages(select_properties)
        if not raw_resp:
            raise ProviderNoDataError(
                f"No locations found with properties {select_properties}"
            )
        response = LocationResponse.from_api_pages_with_included_catalog_items(raw_resp)

        if location_id:
            try:
                location_id_as_int = int(location_id)
            except ValueError:
                raise ProviderQueryError(
                    f"Invalid location id: '{location_id}'; RISE location IDs must be integers"
                )
            response.drop_all_locations_but_id(str(location_id_as_int))

        if len(response.locations) == 0:
            raise ProviderNoDataError()

        # FROM SPEC: If a location id is not defined the API SHALL return a GeoJSON features array of valid location identifiers,
        if not any([crs, datetime_, location_id]) or format_ == "geojson":
            return response.to_geojson(
                itemsIDSingleFeature=location_id is not None,
                fields_mapping=self.get_fields(),
            )

        # If a location exists but has no CatalogItems, it should not appear in locations
        # but should appear in items
        response.drop_locations_without_catalogitems()

        # if we are returning covjson we need to fetch the results and fill in the json
        builder = LocationResultBuilder(cache=self.cache, base_response=response)
        response_with_results = builder.load_results(time_filter=datetime_)
        return CovJSONBuilder(self.cache).render(
            response_with_results, select_properties
        )

    def get_fields(self):
        """Get the list of all parameters (i.e. fields) that the user can filter by"""
        if self._fields:
            return self._fields

        self._fields = await_(self.cache.get_or_fetch_parameters())

        return self._fields

    @otel_trace()
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
        # Example: http://localhost:5000/collections/rise-edr/cube?bbox=-101.381836,27.215556,-92.680664,32.23139
        raw_resp = self.cache.get_or_fetch_all_param_filtered_pages(select_properties)
        response = LocationResponse.from_api_pages_with_included_catalog_items(raw_resp)

        response.drop_outside_of_bbox(bbox, z)

        response.drop_locations_without_catalogitems()

        builder = LocationResultBuilder(cache=self.cache, base_response=response)
        response_with_results = builder.load_results(time_filter=datetime_)
        return CovJSONBuilder(self.cache).render(
            response_with_results, select_properties
        )

    @otel_trace()
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
        Example: http://localhost:5000/collections/rise-edr/area?coords=POLYGON%20((-109.204102%2047.010226,%20-104.655762%2047.010226,%20-104.655762%2049.267805,%20-109.204102%2049.267805,%20-109.204102%2047.010226))&f=json
        """

        raw_resp = self.cache.get_or_fetch_all_param_filtered_pages(select_properties)
        assert len(raw_resp) > 1
        found = set()
        for url in raw_resp:
            for data in raw_resp[url]["data"]:
                id = data["attributes"]["_id"]
                assert id not in found, (
                    f"{id} is a duplicate with name {data['attributes']['locationName']} in {url}"
                )
                found.add(id)
        response = LocationResponse.from_api_pages_with_included_catalog_items(raw_resp)

        assert not response.has_duplicate_locations()

        if wkt != "":
            response.drop_outside_of_wkt(wkt, z)

        assert not response.has_duplicate_locations()

        response.drop_locations_without_catalogitems()

        builder = LocationResultBuilder(cache=self.cache, base_response=response)
        response_with_results = builder.load_results(time_filter=datetime_)
        return CovJSONBuilder(self.cache).render(
            response_with_results, select_properties
        )

    def items(self, **kwargs):
        # We have to define this since pygeoapi has a limitation and needs both EDR and OAF for items
        # https://github.com/geopython/pygeoapi/issues/1748
        pass

    def __repr__(self):
        return "<RiseEDRProvider>"
