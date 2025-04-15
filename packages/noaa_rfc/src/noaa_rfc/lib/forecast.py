# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from datetime import date
import time
from typing import Literal, Optional, cast
from com.cache import RedisCache
from com.geojson.helpers import (
    GeojsonFeatureCollectionDict,
    GeojsonFeatureDict,
    SortDict,
    all_properties_found_in_feature,
    filter_out_properties_not_selected,
    sort_by_properties_in_place,
)
from com.helpers import EDRFieldsMapping, OAFFieldsMapping, await_
from protocols.locations import LocationCollectionProtocol
from pydantic import BaseModel
from geojson_pydantic import Feature, FeatureCollection, Point
from geojson_pydantic.types import Position2D
from shapely.geometry.base import BaseGeometry


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
    wsobasin: Optional[list[str]] = None


class ForecastDataSingle(BaseModel):
    """
    A class reprsenting the output data of an extended streamflow prediction
    """

    espid: str  # The id of the station where the data is from
    espfdate: date | str  # the data the forecast was made
    espai: Optional[int] = None
    espmi: Optional[int] = None
    esppcti: Optional[int] = None
    espavg30: float
    esppavg: Optional[float] = None  #
    esppmed: Optional[int] = None
    esppctile: Optional[int] = None
    espplace: Optional[int] = None
    espnyears: Optional[int] = None
    espname: str  # The human readable name of the station
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
    wsobasin: Optional[
        Literal["AB"]
        | Literal["MB"]
        | Literal["WG"]
        | Literal["CN"]
        | Literal["NW"]
        | None
    ] = None

    dataset_link: Optional[str] = None
    image_plot_link: Optional[str] = None

    def extend_with_metadata(self):
        """
        Add plotting and datasets links to the metadata of the pydantic object in place

        Since this integration fetches from different basins, certain basins need to be handled differently
        """
        water_year = get_water_year()

        match self.wsobasin:
            case "CN":
                self.dataset_link = f"https://www.cnrfc.noaa.gov/ensembleProduct.php?prodID=7&id={self.espid}"
                self.image_plot_link = f"https://www.cbrfc.noaa.gov/dbdata/wsup/graph/espgraph_hc.py?id={self.espid}"
            case "NW":
                self.dataset_link = f"https://www.nwrfc.noaa.gov/water_supply/ws_forecasts.php?id={self.espid}"
                self.image_plot_link = (
                    "https://www.nwrfc.noaa.gov/water_supply/ws_boxplot.php?_jpg_csimd=1&start_month=APR&end_month=SEP&fcst_method=ESP10&overlay=4&image_only=1&fit=0&show_min_max=0&id="
                    + self.espid
                    + "&water_year="
                    + water_year
                )
            case _:
                self.dataset_link = (
                    "http://www.cbrfc.noaa.gov/wsup/graph/espgraph_hc.html?id="
                    + self.espid
                )
                self.image_plot_link = f"https://www.cbrfc.noaa.gov/dbdata/wsup/graph/espgraph_hc.py?id={self.espid}"


class ForecastDataSingleWithLinks:
    forecastDataSingle: ForecastDataSingle

    link: Optional[str] = None
    plot: Optional[str] = None


def get_water_year() -> str:
    now = time.time()
    water_year = time.strftime("%Y", time.localtime(now))
    calendar_month = int(time.strftime("%m", time.localtime(now)))
    if calendar_month > 9:
        # if month is greater than 9, increment water year since the water year typically starts on October 1st and ends on September 30th
        water_year = str(int(water_year) + 1)
    return water_year


class ForecastCollection(LocationCollectionProtocol):
    locations: list[ForecastDataSingle] = []

    def _get_data(self):
        water_year = get_water_year()

        fdate_latest = "LATEST"
        cb_fdate_end = water_year + "-07-15"
        cb_fdate_az = water_year + "-5-30"
        ab_fdate_end = water_year + "-06-29"
        wg_fdate_end = water_year + "-07-15"

        # ts = time.time() / (6 * 60 * 60) js used the equivalent of that < but if we use seconds frm epoch it is uncachable
        ts = time.mktime(date.today().timetuple()) / (6 * 60 * 60)

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

        # tasks = [fetch_data(session, url) for url in urls.values()]
        results = await_(
            RedisCache().get_or_fetch_group(
                urls=list(urls.values()), custom_mimetype="text/plain"
            )
        )
        results = list(results.values())

        assert len(results) >= 10

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
        wide_forecasts = self._get_data()

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

        self.locations = pivoted_forecasts

    def drop_all_locations_but_id(self, location_id: str):
        self.locations = [
            forecast for forecast in self.locations if forecast.espid == location_id
        ]

    def _filter_by_geometry(
        self, geometry: BaseGeometry | None, z: str | None = None
    ) -> None:
        raise NotImplementedError

    def to_geojson(
        self,
        itemsIDSingleFeature: bool = False,
        skip_geometry: Optional[bool] = False,
        select_properties: Optional[list[str]] = None,
        properties: Optional[list[tuple[str, str]]] = None,
        fields_mapping: EDRFieldsMapping | OAFFieldsMapping = {},
        sortby: Optional[list[SortDict]] = None,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        features: list[Feature] = []
        for forecast in self.locations:
            forecast.extend_with_metadata()

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
                fields_mapping = cast(OAFFieldsMapping, fields_mapping)
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

        if itemsIDSingleFeature:
            return cast(GeojsonFeatureDict, features[0].model_dump(exclude_unset=True))

        if sortby:
            sort_by_properties_in_place(features, sortby)

        return cast(
            GeojsonFeatureCollectionDict,
            FeatureCollection(type="FeatureCollection", features=features).model_dump(
                exclude_unset=True
            ),
        )
