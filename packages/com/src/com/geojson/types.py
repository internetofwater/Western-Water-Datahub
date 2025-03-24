# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal, NotRequired, Optional, TypedDict


class GeojsonFeature(TypedDict):
    type: Literal["Feature"]
    geometry: Optional[dict]
    properties: dict
    id: int | str


class GeojsonFeatureCollectionDict(TypedDict):
    """A dict reprsentation of a GeoJSON FeatureCollection that is returned from OAF items/ queries"""

    type: Literal["FeatureCollection"]
    features: list[GeojsonFeature]
    # numberMatched is not required because it is only returned when resulttype=hits
    numberMatched: NotRequired[int]
