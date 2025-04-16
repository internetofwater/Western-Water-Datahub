# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Protocol

from com.covjson import CoverageCollectionDict


class CovjsonBuilderProtocol(Protocol):
    def render(self) -> CoverageCollectionDict: ...
