# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal, Protocol

from com.covjson import CoverageCollectionDict
from com.geojson.helpers import (
    GeojsonFeatureCollectionDict,
    GeojsonFeatureDict,
    SortDict,
)
from com.helpers import EDRFieldsMapping, OAFFieldsMapping


class EDRProviderProtocol(Protocol):
    """
    A protocol for EDR providers to make sure that
    all provider implementations are using the same
    types and interface
    """

    def locations(
        self,
        location_id: str | None = None,
        datetime_: str | None = None,
        select_properties: list[str] | None = None,
        crs: str | None = None,
        format_: str | None = None,
        # not explicitly in the current stable EDR spec;
        # seems to be going to be added in the future?
        bbox: list | None = None,
        **kwargs,
    ) -> CoverageCollectionDict | GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def get_fields(self) -> EDRFieldsMapping: ...

    def cube(
        self,
        bbox: list,
        datetime_: str | None = None,
        select_properties: list[str] | None = None,
        z: str | None = None,
        **kwargs,
    ) -> CoverageCollectionDict: ...

    def area(
        self,
        wkt: str,
        select_properties: list[str] = [],
        datetime_: str | None = None,
        z: str | None = None,
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
        datetime_: str | None = None,
        resulttype: Literal["hits", "results"] | None = "results",
        select_properties: list[str] | None = None,
        properties: list[tuple[str, str]] = [],
        sortby: list[SortDict] | None = None,
        limit: int | None = None,
        itemId: str | None = None,
        offset: int | None = 0,
        skip_geometry: bool | None = False,
        **kwargs,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def query(self, **kwargs) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def get(
        self, identifier, **kwargs
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict: ...

    def get_fields(self, **kwargs) -> OAFFieldsMapping: ...
