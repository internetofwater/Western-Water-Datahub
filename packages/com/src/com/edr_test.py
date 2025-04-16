# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from awdb_forecasts.awdb_forecasts_edr import AwdbForecastsEDRProvider
from com.protocols.providers import EDRProviderProtocol
import pytest
from rise.rise_edr import RiseEDRProvider
from snotel.snotel_edr import SnotelEDRProvider
from usace.usace_edr import USACEEDRProvider

provider_def = {
    "name": "test",
    "type": "feature",
    "data": "remote",
}


@pytest.mark.parametrize(
    "provider_class",
    [
        USACEEDRProvider,
        RiseEDRProvider,
        AwdbForecastsEDRProvider,
        SnotelEDRProvider,
    ],
)
def test_oaf_provider(provider_class):
    provider: EDRProviderProtocol = provider_class(provider_def=provider_def)
    assert provider

    fields = provider.get_fields()

    def test_fields():
        assert len(fields) > 0
        firstKey = list(fields.keys())[0]
        mandatoryFields = ["title", "type", "description", "x-ogc-unit"]
        assert all(key in mandatoryFields for key in fields[firstKey].keys())

    test_fields()

    locations = provider.locations()

    def test_location_id():
        assert "features" in locations
        assert len(locations["features"]) > 0

        firstId = locations["features"][0]["id"]
        singleItem = provider.locations(location_id=str(firstId))
        assert "coverages" in singleItem

    test_location_id()

    def test_select_properties():
        selectedProvider = provider.locations(
            select_properties=[list(fields.keys())[0]]
        )
        assert "features" in selectedProvider
        # awdb forecasts contains parameters that could potentially not have
        # data associated with them; this is since it shares the same upstream param api as snotel
        if not isinstance(provider, AwdbForecastsEDRProvider):
            assert len(selectedProvider["features"]) > 0

    test_select_properties()

    def test_area_and_cube_behave_similarly():
        assert "features" in locations
        firstItemGeo = locations["features"][0]["geometry"]
        assert firstItemGeo and "coordinates" in firstItemGeo
        area = provider.area(
            wkt=f"POINT({firstItemGeo['coordinates'][0]} {firstItemGeo['coordinates'][1]})"
        )
        assert "coverages" in area
        assert len(area["coverages"]) > 0

        # Create a bbox that is essentially the same thing as the wkt above
        bbox = [
            firstItemGeo["coordinates"][0] - 0.1,
            firstItemGeo["coordinates"][1] - 0.1,
            firstItemGeo["coordinates"][0] + 0.1,
            firstItemGeo["coordinates"][1] + 0.1,
        ]
        cube = provider.cube(bbox=bbox)
        assert "coverages" in cube
        assert len(cube["coverages"]) > 0

        assert area["coverages"][0] == cube["coverages"][0]

    test_area_and_cube_behave_similarly()
