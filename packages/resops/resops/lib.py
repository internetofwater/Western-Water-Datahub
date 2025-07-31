from collections import OrderedDict
import datetime
from typing import Optional, TypedDict, cast

from com.covjson import CoverageCollectionDict
from com.geojson.helpers import GeojsonFeatureCollectionDict, GeojsonFeatureDict

from com.helpers import parse_date
from covjson_pydantic.coverage import CoverageCollection, Coverage
from covjson_pydantic.domain import Domain, DomainType
from covjson_pydantic.domain import Axes

from covjson_pydantic.domain import ValuesAxis
from covjson_pydantic.reference_system import (
    ReferenceSystemConnectionObject,
    ReferenceSystem,
)
from covjson_pydantic.ndarray import NdArrayFloat
from covjson_pydantic.parameter import Parameter, Parameters
from covjson_pydantic.unit import Unit
from covjson_pydantic.observed_property import ObservedProperty


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


def filter_averages(time: str, averages: dict) -> dict:
    result = parse_date(time)
    if isinstance(result, tuple):
        start, end = result

        filteredAverages = {}
        for k, v in averages.items():
            if start <= datetime.datetime.strptime(k, "%m-%d") <= end:
                filteredAverages[k] = v

        return filteredAverages
    else:
        for k, v in averages.items():
            if result == datetime.datetime.strptime(k, "%m-%d"):
                return {k: v}
        return {}


def get_all_values_for_one_key(data: dict, key: str) -> list:
    vals = []
    for k in data.keys():
        vals.append(data[k][key])
    return vals


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

    def to_covjson(
        self,
        datetime_: Optional[str],
        limit: Optional[int] = None,
    ) -> CoverageCollectionDict:
        coverages: list[Coverage] = []

        params: dict[str, Parameter] = {}

        for key in self.data.keys():
            values = self.data[key]
            longitude, latitude = values["longitude"], values["latitude"]
            averages = values["averages"]
            if datetime_:
                averages = filter_averages(datetime_, averages)

            if limit:
                averages = dict(list(averages.items())[:limit])

            thirtyYearAverages = get_all_values_for_one_key(
                averages, "thirtyYearAverage"
            )
            tenthPercentile = get_all_values_for_one_key(averages, "tenthPercentile")
            ninetiethPercentile = get_all_values_for_one_key(
                averages, "ninetiethPercentile"
            )

            keysWithCurrentYear = []
            for k in averages.keys():
                date = f"2020-{k}"
                date = datetime.datetime.strptime(date, "%Y-%m-%d")
                date = date.astimezone(datetime.timezone.utc)
                keysWithCurrentYear.append(date)

            for key, value in {
                "avg": thirtyYearAverages,
                "p10": tenthPercentile,
                "p90": ninetiethPercentile,
            }.items():
                param = Parameter(
                    type="Parameter",
                    unit=Unit(symbol="Million Cubic Meters"),
                    id="Million Cubic Meters",
                    observedProperty=ObservedProperty(
                        label={"en": "Million Cubic Meters"},
                        id="Million Cubic Meters",
                        description={"en": "Million Cubic Meters"},
                    ),
                )

                params[key] = param

                cov = Coverage(
                    type="Coverage",
                    domain=Domain(
                        type="Domain",
                        domainType=DomainType.point_series,
                        axes=Axes(
                            x=ValuesAxis(values=[longitude]),
                            y=ValuesAxis(values=[latitude]),
                            t=ValuesAxis(values=keysWithCurrentYear),
                        ),
                        referencing=[
                            ReferenceSystemConnectionObject(
                                coordinates=["x", "y"],
                                system=ReferenceSystem(
                                    type="GeographicCRS",
                                    id="http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                                ),
                            ),
                            ReferenceSystemConnectionObject(
                                coordinates=["t"],
                                system=ReferenceSystem(
                                    type="TemporalRS",
                                    id="http://www.opengis.net/def/uom/ISO-8601/0/Gregorian",
                                    calendar="Gregorian",
                                ),
                            ),
                        ],
                    ),
                    ranges={
                        key: NdArrayFloat(
                            shape=[len(value)],
                            values=list(value),
                            axisNames=["t"],
                        ),
                    },
                )
                coverages.append(cov)

        cc = CoverageCollection(
            coverages=coverages,
            domainType=DomainType.point_series,
            parameters=Parameters(root=params),
        )

        return cast(
            CoverageCollectionDict, cc.model_dump(by_alias=True, exclude_none=True)
        )

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
            averages: OrderedDict = values["averages"]

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
                    "nidId": key,
                    "averages": dict(averages),
                },
            }
            if returnOneFeature:
                return featureToAdd
            else:
                features.append(featureToAdd)
        return fc
