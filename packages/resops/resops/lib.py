from collections import OrderedDict
import datetime
from typing import TypedDict

from com.geojson.helpers import GeojsonFeatureCollectionDict, GeojsonFeatureDict


class ReservoirStorageMetadata(TypedDict):
    thirtyYearAverage: float
    tenthPercentile: float
    ninetyPercentile: float


def days_after_today(md_str):
    month, day = map(int, md_str.split("-"))
    base_year = 2000  # Leap year
    target_date = datetime.datetime(base_year, month, day)

    today = datetime.datetime.today()
    today_md = datetime.datetime(base_year, today.month, today.day)

    delta = (target_date - today_md).days
    if delta < 0:
        delta += 366  # Account for wrap-around, use 366 to support leap years
    return delta


class LocationCollection:
    data: dict

    def __init__(self, data: dict):
        self.data: dict = {}

        for k, v in data.items():
            sortedAverages = OrderedDict(
                sorted(
                    v["averages"].items(), key=lambda item: days_after_today(item[0])
                )
            )
            self.data[k] = v
            self.data[k]["averages"] = sortedAverages

    def drop_all_locations_but_id(self, location_id: str):
        filtered_data = {k: v for k, v in self.data.items() if k == location_id}
        self.data = filtered_data

    def filter_by_month_and_day(self, start: datetime.datetime, end: datetime.datetime):
        assert start <= end
        assert start.year == end.year

        filtered_data = {
            k: v
            for k, v in self.data.items()
            # we set the year to be the start year so we can compare just the month and day
            if start <= datetime.datetime.strptime(k, f"{start.year}-%m-%d") <= end
        }
        self.data = filtered_data

    def to_covjson(self): ...

    def to_geojson(
        self, returnOneFeature=False
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        fc: GeojsonFeatureCollectionDict = {
            "type": "FeatureCollection",
            "features": [],
        }
        for key in self.data.keys():
            values = self.data[key]
            features: list = fc["features"]
            featureToAdd: GeojsonFeatureDict = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [values["longitude"], values["latitude"]],
                },
                "id": key,
                "properties": {
                    "grandID": values["grandID"],
                    "name": values["name"],
                    "agencyCode": values["agencyCode"],
                },
            }
            if returnOneFeature:
                return featureToAdd
            else:
                features.append(featureToAdd)
        return fc
