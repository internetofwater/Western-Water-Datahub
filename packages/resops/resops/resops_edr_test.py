# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from datetime import datetime
from typing import cast
from com.covjson import CoverageCollectionDict
from com.geojson.helpers import GeojsonFeatureCollectionDict
import pytest
import resops
import resops.resops_edr
from pygeoapi.provider.base import ProviderQueryError

provider_def = {
    "name": "resops",
    "type": "edr",
    "data": "remote",
}


def test_location_geojson():
    p = resops.resops_edr.ResOpsUSProviderEDR(provider_def)
    locresp = p.locations()
    assert "type" in locresp
    assert locresp["type"] == "FeatureCollection"


def test_location_id():
    p = resops.resops_edr.ResOpsUSProviderEDR(provider_def)
    locresp = p.locations()
    locresp = cast(GeojsonFeatureCollectionDict, locresp)

    someId = locresp["features"][0]["id"]
    secondId = locresp["features"][1]["id"]
    locresp = p.locations(location_id=str(someId))

    idLocResp = p.locations(location_id=str(someId))

    assert "type" in idLocResp
    assert idLocResp["type"] == "CoverageCollection"

    secondIdLocResp = p.locations(location_id=str(secondId))
    assert "type" in secondIdLocResp
    assert secondIdLocResp["type"] == "CoverageCollection"

    assert idLocResp != secondIdLocResp


def test_location_datetime_filter():
    p = resops.resops_edr.ResOpsUSProviderEDR(provider_def)
    locresp = p.locations()
    locresp = cast(GeojsonFeatureCollectionDict, locresp)

    someId = locresp["features"][0]["id"]
    locresp = p.locations(location_id=str(someId), datetime_="2020-01-01")
    assert "type" in locresp
    assert locresp["type"] == "CoverageCollection"
    locresp = cast(CoverageCollectionDict, locresp)
    for coverage in locresp["coverages"]:
        assert coverage["domain"]["axes"]["t"]["values"][0] == datetime.fromisoformat(
            "2020-01-01T00:00:00+00:00"
        ), "The coverage should match the same time as the datetime filter"


def test_bad_datetime_format():
    p = resops.resops_edr.ResOpsUSProviderEDR(provider_def)
    locresp = p.locations()
    locresp = cast(GeojsonFeatureCollectionDict, locresp)

    someId = locresp["features"][0]["id"]
    with pytest.raises(ValueError, match="isoformat string"):
        p.locations(location_id=str(someId), datetime_="202007-07")

    with pytest.raises(ProviderQueryError):
        p.locations(location_id=str(someId), datetime_="07-07")
