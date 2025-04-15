# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Optional, Protocol

from com.helpers import EDRFieldsMapping


class CovjsonBuilderProtocol(Protocol):
    def __init__(
        self,
        station_triples: list[str],
        triplesToGeometry: dict[str, tuple[float, float]],
        fieldsMapper: EDRFieldsMapping,
        datetime_: Optional[str] = None,
        select_properties: Optional[list[str]] = None,
    ): ...

    def render(self) -> dict: ...
