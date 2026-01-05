# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT


import pytest
from usace.usace_edr import USACEEDRProvider
from pygeoapi.provider.base import ProviderNoDataError

provider_def = {
    "name": "test",
    "type": "feature",
    "data": "remote",
}


def test_usace_decode_param():
    p = USACEEDRProvider(provider_def)
    result = p.locations(
        location_id="2796555126",
        select_properties=["Stage Tailwater"],
        datetime_="2025-01-01/..",
    )
    assert result and "coverages" in result
    assert len(result["coverages"]) == 1, (
        "There should be one coverage for this location after filtering out the others"
    )
    assert "parameters" in result
    assert "Stage Tailwater" in result["parameters"], (
        "Expected to find the filtered parameter with the same name in the parameters list"
    )

    with pytest.raises(ProviderNoDataError):
        p.locations(
            location_id="2796555126",
            select_properties=["DUMMY"],
            datetime_="2025-01-01/..",
        )
