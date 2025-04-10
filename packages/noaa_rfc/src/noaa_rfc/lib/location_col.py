from typing import Optional
from pydantic import BaseModel
from datetime import date


class ForecastData(BaseModel):
    espid: str
    espfdate: date
    espai: int
    espmi: int
    esppcti: int
    espavg30: float
    esppavg: int
    esppmed: int
    esppctile: int
    espplace: int
    espnyears: int
    espname: str
    esplatdd: float
    esplngdd: float
    espfgroupid: str
    espbasin: str
    espsubbasin: str
    espbper: int
    espeper: int
    espp_500: int
    espobpavg: int
    espiobpavg: int
    espobpmed: int
    espiobpmed: int
    espobpntd: int
    espiobpntd: int
    espobpesp: int
    espiobpesp: int
    espqpfdays: int

    id: str
    fdate: date
    des: str
    lat: float
    lng: float
    p50: int
    p10: Optional[int] = None
    p90: Optional[int] = None
    normal: float
    pnormal: int
    bper: int
    eper: int
    qpfdays: int
    rfc: str
    link: str
    plot: Optional[str] = None
    plotw: int
    ploth: int
    forecast_fill: Optional[str] = None
