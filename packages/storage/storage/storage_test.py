from storage.storage import (
    get_all_relevant_locations,
    get_static_capacity_data,
    get_latest_for_all,
    get_storage,
)
import pytest


@pytest.mark.asyncio
async def test_storage():
    storage = await get_storage()
    assert storage


@pytest.mark.asyncio
async def test_get_all_relevant_locations():
    locations = await get_all_relevant_locations()
    assert locations
    assert len(locations) > 100, "The locations pages were not merged properly"


@pytest.mark.asyncio
async def test_get_latest_for_all():
    latest = await get_latest_for_all()
    assert latest
    assert len(latest.reservoirs) > 100
    assert latest.reservoirs
    with open("latest.json", "w") as f:
        f.write(latest.model_dump_json())


def test_get_storage_data():
    capacity = get_static_capacity_data()
    assert capacity
