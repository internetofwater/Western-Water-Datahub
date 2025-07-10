# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import List, Literal, Optional
from com.cache import RedisCache
from pydantic import BaseModel, FiniteFloat
from usace.lib.result_collection import ResultCollection


class TimeseriesParameter(BaseModel):
    tsid: str
    label: str
    base_parameter: str
    parameter: str
    unit: str
    unit_long_name: str
    latest_time: str
    latest_value: float
    delta24h: Optional[float] = None
    sort_order: int

    # This field is not returned from the upstream
    # API but is appended at runtime to create the covjson
    results: Optional[ResultCollection] = None

    async def _get_results(
        self, office: str, start_date: str, end_date: str
    ) -> ResultCollection:
        """
        Get results by fetching from the USACE API; note that the office is also known as the
        provider in the API terminology; these terms are interchangable
        """
        assert office and start_date and end_date
        # parse start_date and end_date and make sure start is before end

        url = f"https://water.usace.army.mil/cda/reporting/providers/{office.lower()}/timeseries?name={self.tsid}&begin={start_date}&end={end_date}"
        result = await RedisCache().get_or_fetch_json(url)
        assert result
        return ResultCollection(**result)

    async def fill_results(self, office: str, start_date: str, end_date: str):
        """
        Given the office, start date, and end date, fetch the results
        and store them in the results field of the class
        """
        self.results = await self._get_results(office, start_date, end_date)


class GeojsonProperties(BaseModel):
    provider: str
    code: str
    slug: str
    elevation: Optional[float] = None
    horizontal_datum: str
    vertical_datum: str
    state: str
    kind: Literal["PROJECT"]
    nearest_city: str
    public_name: str
    location_code: int
    nsid: Optional[str] = None
    aliases: dict[Literal["NIDID"], str] | dict
    timeseries: Optional[list[TimeseriesParameter]] = None
    name: Optional[str] = None

    # This field is not returned from the upstream
    # but rather comes from the static metadata file created
    # from the USACE National Institute of Dams API response
    nid_static_metadata: Optional[dict] = None


class PointCoordinates(BaseModel):
    type: Literal["Point"]
    coordinates: tuple[
        FiniteFloat, FiniteFloat
    ]  # Expecting exactly two values: [longitude, latitude]


class Feature(BaseModel):
    type: Literal["Feature"]
    properties: GeojsonProperties
    geometry: PointCoordinates
    id: Optional[str] = None


class FeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[Feature]
