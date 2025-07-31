# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import json
import logging
import pathlib
from typing import Literal, Optional

from com.otel import otel_trace
from com.protocols.providers import OAFProviderProtocol
from pygeoapi.provider.base import BaseProvider
from pygeoapi.util import crs_transform
from com.geojson.helpers import (
    GeojsonFeatureDict,
    GeojsonFeatureCollectionDict,
    SortDict,
)

from resops.lib import LocationCollection


LOGGER = logging.getLogger(__name__)

thirty_year_averages_path = (
    pathlib.Path(__file__).parent.parent / "30_year_averages_by_nid_id.json"
)

with thirty_year_averages_path.open() as f:
    LOGGER.info(
        f"Loading 30 year average USACE metadata from {thirty_year_averages_path}"
    )
    USACE_THIRTY_YEAR_AVERAGES = json.load(f)


class ResOpsUSProvider(BaseProvider, OAFProviderProtocol):
    """Provider for OGC API Features"""

    def __init__(self, provider_def):
        """
        Initialize object
        :param provider_def: provider definition
        """
        super().__init__(provider_def)
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
        locations = LocationCollection(USACE_THIRTY_YEAR_AVERAGES)

        return locations.to_geojson()

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
        return {}
