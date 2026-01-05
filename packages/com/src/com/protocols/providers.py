# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Optional, Protocol
from typing import Literal

from com.geojson.helpers import (
    GeojsonFeatureCollectionDict,
    GeojsonFeatureDict,
    SortDict,
)
from com.covjson import CoverageCollectionDict
from com.helpers import EDRFieldsMapping, OAFFieldsMapping


class EDRProviderProtocol(Protocol):
    """
    A protocol for EDR providers to make sure that
    all provider implementations are using the same
    types and interface
    """

    def locations(
        self,
        location_id: Optional[str] = None,
        datetime_: Optional[str] = None,
        select_properties: Optional[list[str]] = None,
        crs: Optional[str] = None,
        format_: Optional[str] = None,
        # not explicitly in the current stable EDR spec;
        # seems to be going to be added in the future?
        bbox: Optional[list] = None,
        **kwargs,
    ) -> CoverageCollectionDict | GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def get_fields(self) -> EDRFieldsMapping: ...

    def cube(
        self,
        bbox: list,
        datetime_: Optional[str] = None,
        select_properties: Optional[list[str]] = None,
        z: Optional[str] = None,
        **kwargs,
    ) -> CoverageCollectionDict: ...

    def area(
        self,
        wkt: str,
        select_properties: list[str] = [],
        datetime_: Optional[str] = None,
        z: Optional[str] = None,
        **kwargs,
    ) -> CoverageCollectionDict: ...

    def items(self, **kwargs): ...


class OAFProviderProtocol(Protocol):
    """
    A protocol for OAF providers to make sure that
    all provider implementations are using the same
    types and interface
    """

    def items(
        self,
        bbox: list = [],
        datetime_: Optional[str] = None,
        resulttype: Optional[Literal["hits", "results"]] = "results",
        select_properties: Optional[list[str]] = None,
        properties: list[tuple[str, str]] = [],
        sortby: Optional[list[SortDict]] = None,
        limit: Optional[int] = None,
        itemId: Optional[str] = None,
        offset: Optional[int] = 0,
        skip_geometry: Optional[bool] = False,
        **kwargs,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def query(self, **kwargs) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def get(
        self, identifier, **kwargs
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def get_fields(self, **kwargs) -> OAFFieldsMapping: ...
