# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import json
import logging
import pathlib
from typing import Optional

import aiohttp
import aiohttp.client_exceptions
from com.geojson.helpers import GeojsonFeatureCollectionDict, GeojsonFeatureDict
from com.helpers import EDRFieldsMapping, parse_date
from com.otel import otel_trace
from com.protocols.providers import EDRProviderProtocol
from pygeoapi.provider.base_edr import BaseEDRProvider
from com.covjson import CoverageCollectionDict
from pygeoapi.provider.base import ProviderQueryError
from nid.lib import LocationCollection, StaticDataOutput

LOGGER = logging.getLogger(__name__)


thirty_year_averages_path = (
    pathlib.Path(__file__).parent.parent.parent / "30_year_averages_by_nid_id.json"
)

with thirty_year_averages_path.open() as f:
    LOGGER.info(
        f"Loading 30 year average USACE metadata from {thirty_year_averages_path}"
    )
    USACE_THIRTY_YEAR_AVERAGES: StaticDataOutput = json.load(f)


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
        **kwargs,
    ) -> CoverageCollectionDict | GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        """
        Extract data from location
        """
        if not location_id and datetime_:
            raise ProviderQueryError(
                "Datetime parameter is not supported without location_id"
            )

        if select_properties:
            raise NotImplementedError

        if datetime_:
            parsed_date = parse_date(datetime_)
            if isinstance(parsed_date, tuple):
                start, end = parsed_date
                if start > end:
                    raise ProviderQueryError("Start date must be before end date")
                startYear, endYear = start.year, end.year
                if startYear != endYear:
                    raise ProviderQueryError("Start and end years must be the same")

        collection = LocationCollection(USACE_THIRTY_YEAR_AVERAGES)
        if location_id:
            collection.drop_all_locations_but_id(location_id)

        return collection.to_covjson()

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
        raise NotImplementedError

    def items(self, **kwargs):
        raise NotImplementedError
