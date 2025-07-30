from typing import TypedDict


class ReservoirStorageMetadata(TypedDict):
    thirtyYearAverage: float
    tenthPercentile: float
    ninetyPercentile: float


type DateToAverages = dict[str, ReservoirStorageMetadata]


class Geometry(TypedDict):
    latitude: float
    longitude: float


type StaticDataOutput = dict[str, DateToAverages | Geometry]


class LocationCollection:
    data: StaticDataOutput

    def __init__(self, data: StaticDataOutput):
        self.data = data

    def drop_all_locations_but_id(self, location_id: str):
        filtered_data = {k: v for k, v in self.data.items() if k == location_id}
        self.data = filtered_data

    def to_covjson(): ...
