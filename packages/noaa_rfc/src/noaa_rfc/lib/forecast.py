import asyncio
from datetime import date
import time
from typing import Optional, cast
import aiohttp
from com.geojson.helpers import (
    GeojsonFeatureCollectionDict,
    GeojsonFeatureDict,
    SortDict,
    all_properties_found_in_feature,
    filter_out_properties_not_selected,
    sort_by_properties_in_place,
)
from com.helpers import OAFFieldsMapping, await_
from pydantic import BaseModel
from geojson_pydantic import Feature, FeatureCollection, Point
from geojson_pydantic.types import Position2D


class ForecastData(BaseModel):
    espid: list[str]
    espfdate: list[date | str]
    espai: Optional[list[int]] = None
    espmi: Optional[list[int]] = None
    esppcti: Optional[list[int]] = None
    espavg30: list[float]
    esppavg: Optional[list[float]] = None
    esppmed: Optional[list[int]] = None
    esppctile: Optional[list[int]] = None
    espplace: Optional[list[int]] = None
    espnyears: Optional[list[int]] = None
    espname: list[str]
    esplatdd: list[float]
    esplngdd: list[float]
    espfgroupid: list[str]
    espbasin: Optional[list[str]] = None
    espsubbasin: Optional[list[str]] = None
    espbper: list[int]
    espeper: list[int]
    espp_500: list[float]
    espobpavg: Optional[list[int]] = None
    espiobpavg: Optional[list[int]] = None
    espobpmed: Optional[list[int]] = None
    espiobpmed: Optional[list[int]] = None
    espobpntd: Optional[list[int]] = None
    espiobpntd: Optional[list[int]] = None
    espobpesp: Optional[list[int]] = None
    espiobpesp: Optional[list[int]] = None
    espqpfdays: list[int]


class ForecastDataSingle(BaseModel):
    espid: str
    espfdate: date | str
    espai: Optional[int] = None
    espmi: Optional[int] = None
    esppcti: Optional[int] = None
    espavg30: float
    esppavg: Optional[float] = None
    esppmed: Optional[int] = None
    esppctile: Optional[int] = None
    espplace: Optional[int] = None
    espnyears: Optional[int] = None
    espname: str
    esplatdd: float
    esplngdd: float
    espfgroupid: str
    espbasin: Optional[str] = None
    espsubbasin: Optional[str] = None
    espbper: int
    espeper: int
    espp_500: float
    espobpavg: Optional[int] = None
    espiobpavg: Optional[int] = None
    espobpmed: Optional[int] = None
    espiobpmed: Optional[int] = None
    espobpntd: Optional[int] = None
    espiobpntd: Optional[int] = None
    espobpesp: Optional[int] = None
    espiobpesp: Optional[int] = None
    espqpfdays: int


class ForecastDataSingleWithLinks(ForecastDataSingle):
    pass


def calcFill(point, wyr):
    # Assign values to the point dictionary
    point["id"] = point["espid"]
    point["fdate"] = point["espfdate"]
    point["des"] = point["espname"]
    point["lat"] = point["esplatdd"]
    point["lng"] = point["esplngdd"]
    point["p50"] = point["espp_500"]
    # point["p10"] = point["espp_100"]
    # point["p90"] = point["espp_900"]
    point["normal"] = point["espavg30"]
    point["pnormal"] = point["esppavg"]
    point["bper"] = point["espbper"]
    point["eper"] = point["espeper"]
    point["qpfdays"] = point["espqpfdays"]

    if "wsobasin" in point:
        # Set rfc based on wsobasin
        if point["wsobasin"] not in ["AB", "MB", "WG", "CN", "NW"]:
            point["rfc"] = "CB"
        else:
            point["rfc"] = point["wsobasin"]

        if point["wsobasin"] == "CN":
            point["link"] = (
                f"https://www.cnrfc.noaa.gov/ensembleProduct.php?prodID=7&id={point['id']}"
            )
            point["plot"] = ""

        if point["wsobasin"] == "NW":
            point["link"] = (
                f"https://www.nwrfc.noaa.gov/water_supply/ws_forecasts.php?id={point['id']}"
            )
            point["plot"] = (
                f"https://www.nwrfc.noaa.gov/water_supply/ws_boxplot.php?_jpg_csimd=1&start_month=APR&end_month=SEP&fcst_method=ESP10&overlay=4&image_only=1&fit=0&show_min_max=0&id={point['id']}&water_year={wyr}"
            )
            point["plotw"] = 543
            point["ploth"] = 400

    # Set links and plot URLs
    point["link"] = (
        f"http://www.cbrfc.noaa.gov/wsup/graph/espgraph_hc.html?id={point['id']}"
    )
    point["plot"] = (
        f"https://www.cbrfc.noaa.gov/dbdata/wsup/graph/espgraph_hc.py?id={point['id']}"
    )
    point["plotw"] = 700
    point["ploth"] = 389

    # Handle case where pnormal is -1 or 0
    if point["pnormal"] == -1:
        point["pnormal"] = None

    # Parse pnormal, p50, and normal as floats
    pstat = 0
    if point["pnormal"] == "" or point["pnormal"] == 0:
        pstat = 0
    else:
        point["p50"] = float(point["p50"])
        point["normal"] = float(point["normal"])
        point["pnormal"] = float(point["pnormal"])

    point["forecast_fill"] = None

    return point


def data2obj(data, wyr):
    obj = {}
    for i, espid in enumerate(data["espid"]):
        child = {key: data[key][i] for key in data.keys()}
        obj[espid] = calcFill(child, wyr)
    return obj


async def fetch_data(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        return await response.json(content_type="text/plain")


class ForecastCollection:
    forecasts: list[ForecastDataSingle] = []

    async def _get_data(self):
        now = time.time()
        wyr = time.strftime("%Y", time.localtime(now))
        cmo = int(time.strftime("%m", time.localtime(now)))
        if cmo > 9:
            wyr = str(int(wyr) + 1)

        fdate_latest = "LATEST"
        cb_fdate_end = wyr + "-07-15"
        cb_fdate_az = wyr + "-5-30"
        ab_fdate_end = wyr + "-06-29"
        wg_fdate_end = wyr + "-07-15"

        ts = time.time() / (6 * 60 * 60)

        # Define the URLs

        # fetches basins CB,AB,WG,MB,NW
        urls = {
            "src_latest": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={fdate_latest}&area=CB&qpfdays=0&otype=json&ts={ts}",
            "src_end": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={cb_fdate_end}&area=CB&qpfdays=0&otype=json&ts={ts}",
            "src_az": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={cb_fdate_az}&area=CB&qpfdays=0&otype=json&ts={ts}",
            "src_ab_latest": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={fdate_latest}&area=AB&qpfdays=1&otype=json&ts={ts}",
            "src_ab_end": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={ab_fdate_end}&area=AB&qpfdays=1&otype=json&ts={ts}",
            "src_wg_latest": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={fdate_latest}&area=WG&qpfdays=0&otype=json&ts={ts}",
            "src_wg_end": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={wg_fdate_end}&area=WG&qpfdays=0&otype=json&ts={ts}",
            "src_mb_latest": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={fdate_latest}&area=MB&qpfdays=1&otype=json&ts={ts}",
            "src_cn_latest": f"https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_data_cnrfc.py?&ts={ts}",
            "src_nw_latest": f"https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_data_nwrfc.py?&ts={ts}",
        }

        async with aiohttp.ClientSession() as session:
            tasks = [fetch_data(session, url) for url in urls.values()]
            results = await asyncio.gather(*tasks)

            assert any([result["espid"][0] == "BTYO3" for result in results]), (
                "A station from the California basin appears to be missing"
            )

            # Process results using data2obj
            serialized = [ForecastData.model_validate(res) for res in results]
            assert any([result.espid[0] == "BTYO3" for result in serialized]), (
                "A station from the California basin appears to be missing after serializing to pydantic"
            )
            return serialized

    def __init__(self):
        wide_forecasts = await_(self._get_data())

        pivoted_forecasts: list[ForecastDataSingle] = []
        for basin_forecast in wide_forecasts:
            dumped = basin_forecast.model_dump()
            # by iterating over the field with the max length out of all of them, this is the equivalent of zipping them all together,
            # but we don't need to worry about the case in which a field is null
            MAX_LENGTH_OF_A_FIELD_LIST = len(dumped["espid"])
            for i in range(MAX_LENGTH_OF_A_FIELD_LIST):
                # Get the i indexed item from the list and serialized it with pydantic
                # This allows us to get a list of all stations instead of grouping them by basin
                item = {k: v[i] if v else None for k, v in dumped.items()}
                pivoted_forecasts.append(ForecastDataSingle.model_validate(item))

        self.forecasts = pivoted_forecasts

    def drop_all_locations_but_id(self, location_id: str):
        self.forecasts = [
            forecast for forecast in self.forecasts if forecast.espid == location_id
        ]

    def to_geojson(
        self,
        single_feature: bool = False,
        skip_geometry: Optional[bool] = False,
        select_properties: Optional[list[str]] = None,
        properties: Optional[list[tuple[str, str]]] = None,
        fields_mapping: OAFFieldsMapping = {},
        sortby: Optional[list[SortDict]] = None,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        features: list[Feature] = []
        for forecast in self.forecasts:
            serialized_feature = Feature(
                type="Feature",
                id=forecast.espid,
                properties=forecast.model_dump(exclude={"esplatdd", "esplngdd"}),
                geometry=Point(
                    coordinates=Position2D(forecast.esplngdd, forecast.esplatdd),
                    type="Point",
                )
                if not skip_geometry
                else None,
            )
            if properties:
                # narrow the FieldsMapping type here manually since properties is a query arg for oaf and thus we know that OAFFieldsMapping must be used
                if not all_properties_found_in_feature(
                    serialized_feature, properties, fields_mapping
                ):
                    continue

            if select_properties:
                filter_out_properties_not_selected(
                    serialized_feature, select_properties
                )

            features.append(serialized_feature)

        if single_feature:
            return cast(GeojsonFeatureDict, features[0].model_dump())

        if sortby:
            sort_by_properties_in_place(features, sortby)

        return cast(
            GeojsonFeatureCollectionDict,
            FeatureCollection(type="FeatureCollection", features=features).model_dump(),
        )
