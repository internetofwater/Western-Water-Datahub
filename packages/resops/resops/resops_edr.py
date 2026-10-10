# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import logging

from com.covjson import CoverageCollectionDict
from com.geojson.helpers import GeojsonFeatureCollectionDict, GeojsonFeatureDict
from com.helpers import EDRFieldsMapping
from com.otel import otel_trace
from com.protocols.providers import EDRProviderProtocol
from pygeoapi.provider.base import ProviderQueryError
from pygeoapi.provider.base_edr import BaseEDRProvider

from resops.lib import LocationCollection
from resops.resops import USACE_THIRTY_YEAR_AVERAGES

LOGGER = logging.getLogger(__name__)


class ResOpsUSProviderEDR(BaseEDRProvider, EDRProviderProtocol):
    """The EDR Provider"""

    def __init__(self, provider_def=None):
        """
        Initialize object

        :param provider_def: provider definition
        """
        BaseEDRProvider.__init__(self, provider_def)

    @otel_trace()
    def locations(
        self,
        location_id: str | None = None,
        datetime_: str | None = None,
        select_properties: list[str] | None = None,
        crs: str | None = None,
        format_: str | None = None,
        bbox: list | None = None,
        limit: int | None = None,
        **kwargs,
    ) -> CoverageCollectionDict | GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        """
        Extract data from location
        """
        if not location_id and datetime_:
            raise ProviderQueryError(
                "Datetime parameter is not supported without location_id"
            )

        if datetime_ and "2020" not in datetime_:
            raise ProviderQueryError(
                "Datetime parameter must include 2020, since our dataset only includes one year for the end of the 30 year period"
            )

        collection = LocationCollection(USACE_THIRTY_YEAR_AVERAGES)

        if location_id:
            collection.drop_all_locations_but_id(location_id)

        if not location_id:
            return collection.to_geojson(returnOneFeature=location_id is not None)
        else:
            return collection.to_covjson(datetime_, limit=limit)

    def get_fields(self) -> EDRFieldsMapping:
        """Get the list of all parameters (i.e. fields) that the user can filter by"""
        return {
            "avg": {
                "title": "Average Lake/Reservoir Storage",
                "description": "Average Lake/Reservoir Storage",
                "x-ogc-unit": "Million Cubic Meters",
                "type": "number",
            },
            "p10": {
                "title": "10th Percentile Lake/Reservoir Storage",
                "description": "10th Percentile Lake/Reservoir Storage",
                "x-ogc-unit": "Million Cubic Meters",
                "type": "number",
            },
            "p90": {
                "title": "90th Percentile Lake/Reservoir Storage",
                "description": "90th Percentile Lake/Reservoir Storage",
                "x-ogc-unit": "Million Cubic Meters",
                "type": "number",
            },
        }

    @otel_trace()
    def cube(
        self,
        bbox: list,
        datetime_: str | None = None,
        select_properties: list[str] | None = None,
        z: str | None = None,
        **kwargs,
    ) -> CoverageCollectionDict:
        raise NotImplementedError

    def area(
        self,
        wkt: str,
        select_properties: list[str] = [],
        datetime_: str | None = None,
        z: str | None = None,
        **kwargs,
    ) -> CoverageCollectionDict:
        raise NotImplementedError

    def items(self, **kwargs):
        pass
