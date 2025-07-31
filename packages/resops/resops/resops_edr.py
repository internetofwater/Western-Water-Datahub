# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging
from typing import Optional

from com.geojson.helpers import GeojsonFeatureCollectionDict, GeojsonFeatureDict
from com.helpers import EDRFieldsMapping, parse_date
from com.otel import otel_trace
from com.protocols.providers import EDRProviderProtocol
from pygeoapi.provider.base_edr import BaseEDRProvider
from com.covjson import CoverageCollectionDict
from pygeoapi.provider.base import ProviderQueryError
from resops.lib import LocationCollection
from resops.resops import USACE_THIRTY_YEAR_AVERAGES

LOGGER = logging.getLogger(__name__)


class ResOpsUSProviderEDR(BaseEDRProvider, EDRProviderProtocol):
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
        limit: Optional[int] = None,
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

        collection = LocationCollection(USACE_THIRTY_YEAR_AVERAGES)

        if location_id:
            collection.drop_all_locations_but_id(location_id)

        if datetime_:
            parsed_date = parse_date(datetime_)
            if isinstance(parsed_date, tuple):
                start, end = parsed_date
                if start > end:
                    raise ProviderQueryError("Start date must be before end date")
                startYear, endYear = start.year, end.year
                if startYear != endYear:
                    raise ProviderQueryError("Start and end years must be the same")

                collection.filter_by_month_and_day(start, end)

        if not location_id:
            return collection.to_geojson(returnOneFeature=location_id is not None)
        else:
            return collection.to_covjson()

    def get_fields(self) -> EDRFieldsMapping:
        """Get the list of all parameters (i.e. fields) that the user can filter by"""
        return {}

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
        pass
