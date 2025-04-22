# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from com.helpers import await_
from usace.lib.locations_collection import LocationCollection


def test_location_collection():
    assert LocationCollection()


def test_to_geojson():
    collection = LocationCollection()
    geojson = collection.to_geojson(itemsIDSingleFeature=False)
    assert geojson["type"] == "FeatureCollection"


def test_get_edr_fields():
    collection = LocationCollection()
    fields = collection.get_fields()
    assert fields
    assert fields["Elevation"] == {
        "title": "Elevation",
        "type": "string",
        "description": "Elevation",
        "x-ogc-unit": "ft",
    }


def test_fill_all_results():
    start = "2023-05-14T15:32:25.520Z"
    end = "2023-05-15T15:32:25.520Z"
    collection = LocationCollection()
    collection.drop_after_limit(1)
    await_(collection.fill_all_results(start, end))
    assert collection.locations[0].properties.timeseries
    assert collection.locations[0].properties.timeseries[0].results


def test_select_properties():
    collection1 = LocationCollection()
    collection1.select_properties(["SC18.Elev.Inst.1Hour.0.Best-NWO"])
    assert collection1.locations[0].properties.timeseries

    collection2 = LocationCollection()
    collection2.select_properties(["DUMMY"])
    assert not collection2.locations

    collection3 = LocationCollection()
    collection3.select_properties(["SC18.Elev.Inst.1Hour.0.Best-NWO", "DUMMY"])
    assert (
        collection1.locations[0].properties.timeseries
        == collection3.locations[0].properties.timeseries
    )
