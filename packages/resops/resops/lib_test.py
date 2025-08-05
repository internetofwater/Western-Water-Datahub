# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import json
from pathlib import Path
from resops.lib import LocationCollection, load_thirty_year_averages


def test_construct_location_collection():
    json_file = Path(__file__).parent.parent / "30_year_averages_by_nid_id.json"
    assert json_file.exists()

    with json_file.open() as f:
        data = json.load(f)
        assert data

    location_collection = LocationCollection(data)
    assert location_collection

    for k in location_collection.data:
        assert location_collection.data[k]["averages"]


def test_data():
    averages = load_thirty_year_averages()
    assert isinstance(averages, dict)
