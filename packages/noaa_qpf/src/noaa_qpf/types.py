from typing import Literal, Optional
from pydantic import BaseModel


class LengthField(BaseModel):
    length: int


class FeatureAttributes(BaseModel):
    objectid: int
    product: str
    valid_time: str
    qpf: float
    units: str
    issue_time: str
    start_time: str
    idp_filedate: str
    idp_ingestdate: str


class ForecastResponse(BaseModel):
    displayFieldName: str
    fields: list[
        dict[
            Literal["name"] | Literal["type"] | Literal["alias"] | Literal["length"],
            str,
        ]
        | LengthField
    ]
    fieldAlises: Optional[dict[str, str]] = None
    geometryType: Literal["esriGeometryPolygon"]
    spatialReference: dict[Literal["wkt"] | Literal["wkt2"], str]
    features: list[FeatureAttributes | dict]
