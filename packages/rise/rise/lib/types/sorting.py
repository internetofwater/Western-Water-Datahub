# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal, TypedDict


class SortDict(TypedDict):
    property: str
    order: Literal["+", "-"]
