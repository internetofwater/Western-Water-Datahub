# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

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
    assert fields["SC18.Elev.Inst.1Hour.0.Best-NWO"] == {
        "title": "Elevation",
        "type": "string",
        "description": "Elevation (Feet) with id SC18.Elev.Inst.1Hour.0.Best-NWO",
        "x-ogc-unit": "ft",
    }
