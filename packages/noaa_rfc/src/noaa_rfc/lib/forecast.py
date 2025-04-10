import asyncio
from datetime import date
import time
from typing import Optional
import aiohttp
from com.helpers import await_
from pydantic import BaseModel


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


def calcFill(point, wyr=None):
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


def data2obj(data):
    obj = {}
    for i, espid in enumerate(data["espid"]):
        child = {key: data[key][i] for key in data.keys()}
        obj[espid] = calcFill(child)
    return obj


async def fetch_data(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        return await response.json(content_type="text/plain")


class ForecastCollection:
    forecasts: list[ForecastData] = []

    async def _get_data(self):
        fdate_latest = "2025-04-10"
        cb_fdate_end = "2025-04-10"
        cb_fdate_az = "2025-04-10"
        ab_fdate_end = "2025-04-10"
        wg_fdate_end = "2025-04-10"

        ts = time.time() / (6 * 60 * 60)

        # Define the URLs
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

            # Process results using data2obj
            return [ForecastData.model_validate(res) for res in results]

    def __init__(self):
        self.forecasts = await_(self._get_data())
        # pivotedData = pivotWide(data)

        # self.forecasts = pivotedData

        # self.forecasts = [
        #     ForecastData.model_validate(forecast)
        #     for forecast in await_(self._get_data())
        # ]
