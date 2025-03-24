# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from com.geojson.types import SortDict, sort_by_properties_in_place
import geojson_pydantic


def test_sort_by_properties_in_place():
    geojson: list[geojson_pydantic.Feature] = [
        geojson_pydantic.Feature(
            **{
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [1, 2]},
                "properties": {"a": 1, "b": 2},
            }
        ),
        geojson_pydantic.Feature(
            **{
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [3, 4]},
                "properties": {"a": 3, "b": 4},
            }
        ),
        geojson_pydantic.Feature(
            **{
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [5, 6]},
                "properties": {"a": 5, "b": 6},
            }
        ),
    ]

    sortby: list[SortDict] = [{"property": "a", "order": "+"}]

    sort_by_properties_in_place(geojson, sortby)
    assert geojson[0].properties
    assert geojson[0].properties["a"] == 1
    assert geojson[1].properties
    assert geojson[1].properties["a"] == 3
    assert geojson[2].properties
    assert geojson[2].properties["a"] == 5
    sortby = [{"property": "a", "order": "-"}]
    sort_by_properties_in_place(geojson, sortby)
    assert geojson[0].properties
    assert geojson[0].properties["a"] == 5
    assert geojson[1].properties
    assert geojson[1].properties["a"] == 3
    assert geojson[2].properties
    assert geojson[2].properties["a"] == 1
