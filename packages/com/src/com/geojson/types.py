# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal, NotRequired, Optional, TypedDict

import geojson_pydantic


class SortDict(TypedDict):
    property: str
    order: Literal["+", "-"]


class GeojsonFeatureDict(TypedDict):
    type: Literal["Feature"]
    geometry: Optional[dict]
    properties: dict
    id: int | str


class GeojsonFeatureCollectionDict(TypedDict):
    """A dict reprsentation of a GeoJSON FeatureCollection that is returned from OAF items/ queries"""

    type: Literal["FeatureCollection"]
    features: list[GeojsonFeatureDict]
    # numberMatched is not required because it is only returned when resulttype=hits
    numberMatched: NotRequired[int]


def sort_by_properties_in_place(
    geojson_features: list[geojson_pydantic.Feature], sortby: list[SortDict]
) -> None:
    """
    Sort a GeojsonFeatureCollectionDict by the given keys
    """
    if len(geojson_features) <= 1 or not sortby:
        return

    for sort_criterion in reversed(sortby):
        sort_prop = sort_criterion["property"]
        sort_order = sort_criterion["order"]
        reverse_sort = sort_order == "-"

        # Define a key function that places None values at the end for ascending order
        # and at the beginning for descending order.
        def sort_key(f):
            value = (f.properties or {}).get(sort_prop, None)
            return (
                (value is None, value)
                if not reverse_sort
                else (value is not None, value)
            )

        # Sort in-place using the key function
        geojson_features.sort(key=sort_key, reverse=reverse_sort)
