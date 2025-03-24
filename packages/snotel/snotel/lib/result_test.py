# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from snotel.lib.parameters import ParametersCollection
from snotel.lib.result import ResultCollection


def test_use_fields_to_query_results():
    fields = ParametersCollection().get_fields()
    assert "TMIN" in fields
    collection = ResultCollection(station_triplets="908:WA:SNTL", element_code="TMIN")
    assert collection.results
    assert collection.results[0]
