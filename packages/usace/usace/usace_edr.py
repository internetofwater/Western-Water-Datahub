# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import Optional

import aiohttp
import aiohttp.client_exceptions
from com.geojson.helpers import GeojsonFeatureCollectionDict, GeojsonFeatureDict
from com.helpers import EDRFieldsMapping
from com.otel import otel_trace
from com.protocols.providers import EDRProviderProtocol
from pygeoapi.provider.base_edr import BaseEDRProvider
from com.covjson import CoverageCollectionDict
from pygeoapi.provider.base import ProviderQueryError
from usace.lib.locations_collection import LocationCollection
from usace.lib.param_helpers import get_upstream_ids_of_select_properties

LOGGER = logging.getLogger(__name__)


class USACEEDRProvider(BaseEDRProvider, EDRProviderProtocol):
    """The EDR Provider for the Snotel API"""

    def __init__(self, provider_def=None):
        """
        Initialize object

        :param provider_def: provider definition

        :returns: rise.base_edr.RiseEDRProvider
        """
        BaseEDRProvider.__init__(self, provider_def)
        self.instances = []

    @otel_trace()
    def locations(
        self,
        location_id: Optional[str] = None,
        datetime_: Optional[str] = None,
        select_properties: Optional[list[str]] = None,
        crs: Optional[str] = None,
        format_: Optional[str] = None,
        bbox: Optional[list] = None,
        **kwargs,
    ) -> CoverageCollectionDict | GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        """
        Extract data from location
        """
        # Example: http://localhost:5005/collections/usace-edr/locations/2796555126?f=html&datetime=2025-01-01/..
        # Example: http://localhost:5005/collections/usace-edr/locations/2796555126?f=html&datetime=2025-01-01/..&parameter-name=Stage

        if not location_id and datetime_:
            raise ProviderQueryError(
                "Datetime parameter is not supported without location_id"
            )
        collection = LocationCollection()
        if location_id:
            collection.drop_all_locations_but_id(location_id)

        if select_properties:
            select_properties = get_upstream_ids_of_select_properties(
                select_properties, collection
            )

        if not any([crs, datetime_, location_id]) or format_ == "geojson":
            return collection.to_geojson(itemsIDSingleFeature=location_id is not None)

        return collection.to_covjson(
            fieldMapper=self.get_fields(),
            datetime_=datetime_,
            select_properties=select_properties,
        )

    def get_fields(self) -> EDRFieldsMapping:
        """Get the list of all parameters (i.e. fields) that the user can filter by"""
        if not self._fields:
            try:
                self._fields: EDRFieldsMapping = LocationCollection().get_fields()
            except aiohttp.client_exceptions.ClientConnectorCertificateError:
                self._fields: EDRFieldsMapping = {}
        return self._fields

    @otel_trace()
    def cube(
        self,
        bbox: list,
        datetime_: Optional[str] = None,
        select_properties: Optional[list[str]] = None,
        z: Optional[str] = None,
        **kwargs,
    ) -> CoverageCollectionDict:
        """
        Returns a data cube defined by bbox and z parameters

        :param bbox: `list` of minx,miny,maxx,maxy coordinate values as `float`
        :param datetime_: temporal (datestamp or extent)
        :param z: vertical level(s)
        :param format_: data format of output
        """
        collection = LocationCollection()

        collection.drop_all_locations_outside_bounding_box(bbox, z)

        if select_properties:
            select_properties = get_upstream_ids_of_select_properties(
                select_properties, collection
            )

        return collection.to_covjson(self.get_fields(), datetime_, select_properties)

    @otel_trace()
    def area(
        self,
        # Well known text (WKT) representation of the geometry for the area
        wkt: str,
        select_properties: list[str] = [],
        datetime_: Optional[str] = None,
        z: Optional[str] = None,
        **kwargs,
    ) -> CoverageCollectionDict:
        """
        Extract and return coverage data from a specified area.
        """
        collection = LocationCollection()

        collection.drop_outside_of_wkt(wkt, z)

        if select_properties:
            select_properties = get_upstream_ids_of_select_properties(
                select_properties, collection
            )

        return collection.to_covjson(self.get_fields(), datetime_, select_properties)

    def items(self, **kwargs):
        # We have to define this since pygeoapi has a limitation and needs both EDR and OAF for items
        # https://github.com/geopython/pygeoapi/issues/1748
        pass
