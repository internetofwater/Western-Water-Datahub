import json
from pathlib import Path
from pydantic import BaseModel
from rise.lib.cache import RISECache
from rise.lib.helpers import merge_pages


class Location(BaseModel):
    id: int
    name: str


def get_static_capacity_data() -> dict:
    file = (
        Path(__file__).parent.parent.parent
        / "rise"
        / "generated"
        / "Reservoirs_and_Capacity_Data.json"
    )
    assert file.exists()
    with open(file, "r") as f:
        return json.load(f)


async def get_all_relevant_locations():
    url = "https://data.usbr.gov/rise/api/location?page=1&itemsPerPage=25&parameterId=3%2C47"
    cache = RISECache()
    response = await cache.get_or_fetch_all_pages(url)
    ids: list[Location] = []
    for location in merge_pages(response)["data"]:
        id = location["attributes"]["_id"]
        naturalLanguageName = location["attributes"]["locationName"]
        ids.append(Location(id=id, name=naturalLanguageName))
    return ids


async def get_storage():
    url = "https://data.usbr.gov/rise/api/result?page=1&itemsPerPage=25&parameterId=3%2C47&dateTime%5Bstrictly_after%5D=2025-06-01"
    cache = RISECache()
    return await cache.get_or_fetch_json(url)


async def get_latest_for_all():
    locations = await get_all_relevant_locations()

    class LatestReservoirStorage(BaseModel):
        id: int
        name: str
        reservoir_storage: float
        associated_capacity_data: dict

    class ReservoirStorageReport(BaseModel):
        reservoirs: list[LatestReservoirStorage]

    cache = RISECache()

    latest: list[LatestReservoirStorage] = []

    capacity_data = get_static_capacity_data()

    for loc in locations:
        url = f"https://data.usbr.gov/rise/api/result?page=1&itemsPerPage=1&locationId={loc.id}&parameterId=3%2C47&dateTime%5Border%5D=desc"
        response = await cache.get_or_fetch_json(url)
        result: float = response["data"][0]["attributes"]["result"]
        associated_capacity_data = capacity_data.get(loc.name.strip(), {})

        latest.append(
            LatestReservoirStorage(
                id=loc.id,
                reservoir_storage=result,
                name=loc.name,
                associated_capacity_data=associated_capacity_data,
            )
        )

    return ReservoirStorageReport(reservoirs=latest)
