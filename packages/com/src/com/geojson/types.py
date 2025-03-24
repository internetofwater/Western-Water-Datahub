# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal, NotRequired, Optional, TypedDict

import geojson_pydantic
from pygeoapi.provider.base import ProviderQueryError
from rise.lib.types.location import LocationData
from typing import assert_never


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


def all_properties_found_in_feature(
    location_feature: LocationData,
    properties_to_look_for: list[tuple[str, str]],
    fields_mapping: dict[
        str, dict[Literal["type"], Literal["number", "string", "integer"]]
    ],
) -> bool:
    # We rely on fields_mapping to know how to cast each property
    if not fields_mapping:
        raise ProviderQueryError(
            "You must supply a `fields_mapping` if you want to filter by properties"
        )

    dump = location_feature.attributes.model_dump(by_alias=True)
    found_list: list[bool] = []
    for prop_name, prop_value in properties_to_look_for:
        datatype = fields_mapping.get(prop_name)
        if not datatype:
            raise ProviderQueryError(
                f"Could not find a property '{prop_name}' in {fields_mapping} and thus we cannot deserialize it"
            )

        # Convert the string passed in the query to the correct Python type
        match datatype["type"]:
            case "number":
                prop_value = float(prop_value)
            case "integer":
                prop_value = int(prop_value)
            case "string":
                prop_value = str(prop_value)
            case _:
                assert_never(datatype)

        found_list.append(dump.get(prop_name) == prop_value)

    # If *all* requested property-value pairs match, keep the feature
    return all(found_list)
