# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import csv
from dataclasses import dataclass
from datetime import date
import logging
from pathlib import Path
import time
from typing import Literal, Optional, TypedDict, cast
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
from com.protocols.locations import LocationCollectionProtocol
from pydantic import BaseModel
from geojson_pydantic import Feature, FeatureCollection, Point
from geojson_pydantic.types import Position2D
import shapely
from shapely.geometry.base import BaseGeometry
from shapely.geometry import Point as ShapelyPoint
from pygeoapi.provider.base import ProviderItemNotFoundError, ProviderInvalidDataError

LOGGER = logging.getLogger(__name__)


class NOAAMetadata(TypedDict):
    doi_region_num: Optional[int]
    doi_region_name: Optional[str]
    Include_in_WWDH_Dashboard: bool
    NOAA_RFC_NAME: str
    geometry: str
    Location_Name: str


NOAA_ID_TO_METADATA: dict[str, NOAAMetadata] = {}
metadata_path = Path(__file__).parent.parent / "noaa_rfc_stations_by_region.csv"

NOAA_ID_TO_INCLUDE: dict[str, dict] = {}
# we open two csvs and merge them together since
# usbr historically needed the other csv so its easy to keep them as distinct
# in case of future requests
include_path = Path(__file__).parent.parent / "noaa_id_to_include.csv"
with include_path.open() as f:
    LOGGER.info(f"Loading static NOAA include metadata from {include_path}")
    reader = csv.DictReader(f)
    for row in reader:
        noaa_id = row.pop("noaa_id")
        print(row)
        NOAA_ID_TO_INCLUDE[noaa_id] = {
            "Include_in_WWDH_Dashboard": row.pop("Include_in_WWDH_Dashboard"),
            "NOAA_RFC_NAME": row.pop("NOAA_RFC_NAME"),
            "geometry": row.pop("geometry"),
            "Location_Name": row.pop("Location_Name"),
        }

with metadata_path.open() as f:
    LOGGER.info(f"Loading static NOAA doi region metadata from {metadata_path}")
    reader = csv.DictReader(f)
    for row in reader:
        noaa_id = row.pop("noaa_id")
        # we don't need all the fields, so just grab the ones we need for the API
        doi_region_num = row.pop("doi_region_num")
        if noaa_id not in NOAA_ID_TO_INCLUDE:
            continue
        NOAA_ID_TO_METADATA[noaa_id] = {
            "doi_region_num": int(doi_region_num) if doi_region_num else None,
            "doi_region_name": row.pop("doi_region_name"),
            "Include_in_WWDH_Dashboard": str(
                NOAA_ID_TO_INCLUDE[noaa_id]["Include_in_WWDH_Dashboard"]
            ).lower()
            == "true",
            "NOAA_RFC_NAME": NOAA_ID_TO_INCLUDE[noaa_id]["NOAA_RFC_NAME"],
            "geometry": NOAA_ID_TO_INCLUDE[noaa_id]["geometry"],
            "Location_Name": NOAA_ID_TO_INCLUDE[noaa_id]["Location_Name"],
        }
# we don't need to keep a second copy of this around so it can be deleted
del NOAA_ID_TO_INCLUDE


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


@dataclass
class ForecastDataAdHoc:
    """This is ad hoc data from other river forecast centers like arkansas that don't have a proper api
    to query and thus need to be populated with pregenerated static data"""

    espid: str
    includeInWWDHDashboard: bool
    NOAA_RFC_NAME: str
    geometry: shapely.Point
    doi_region_num: Optional[int]
    doi_region_name: Optional[str]
    espname: str
    image_plot_link: Optional[str] = None
    dataset_link: Optional[str] = None


class ForecastDataForNOAAStation(BaseModel):
    """
    A class reprsenting the output data of an extended streamflow prediction
    for the entire station; this essentially combines multiple extended streamflow predictions
    for the same station into one object
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

    # extra doi metadata not in the upstream API
    # but inserted via the NOAA_DOI_REGIONS csv dict
    doi_region_num: Optional[int] = None
    doi_region_name: Optional[str] = None

    NOAA_RFC_NAME: Optional[str] = None
    include_in_wwdh_dashboard: Optional[bool] = None

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
    forecastDataSingle: ForecastDataForNOAAStation

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
    locations: list[ForecastDataForNOAAStation | ForecastDataAdHoc] = []

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
            # NOTE: this was previously commented out since the upstream API appears to be failing; this is out of our control
            # you can go to an endpoint like https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate=LATEST&area=MB&qpfdays=1&otype=json&ts=81636.83333333333
            # to check if it is back up
            "src_wg_latest": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={fdate_latest}&area=WG&qpfdays=0&otype=json&ts={ts}",
            "src_wg_end": f"https://www.cbrfc.noaa.gov/wsup/graph/espcond_data.py?fdate={wg_fdate_end}&area=WG&qpfdays=0&otype=json&ts={ts}",
            # NOTE: this was previously commented out since the upstream API appears to be failing; this is out of our control;
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

        # Process results using data2obj
        serialized = [ForecastData.model_validate(res) for res in results]

        return serialized

    def __init__(self):
        # we fetch the data in a format where there are 10+ parallel lists and then we want to pivot
        # them so it is a list of forecasts where each forecast represents item[N] from each list.
        wide_forecasts = self._get_data()

        pivoted_forecasts: list[ForecastDataForNOAAStation | ForecastDataAdHoc] = []

        noaa_ids_seen_in_api_response = set()
        for basin_forecast in wide_forecasts:
            dumped: dict = basin_forecast.model_dump()

            # by iterating over the field with the max length out of all of them, this is the equivalent of zipping them all together,
            # but we don't need to worry about the case in which a field is null
            MAX_LENGTH_OF_A_FIELD_LIST = len(dumped["espid"])
            for i in range(MAX_LENGTH_OF_A_FIELD_LIST):
                # Get the i indexed item from the list and serialized it with pydantic
                # This allows us to get a list of all stations instead of grouping them by basin
                item = {k: v[i] if v else None for k, v in dumped.items()}

                metadata = NOAA_ID_TO_METADATA[dumped["espid"][i]]

                noaa_ids_seen_in_api_response.add(dumped["espid"][i])

                item["doi_region_num"] = metadata["doi_region_num"]
                item["doi_region_name"] = metadata["doi_region_name"]
                item["include_in_wwdh_dashboard"] = (
                    str(metadata["Include_in_WWDH_Dashboard"]).lower() == "true"
                )

                item["NOAA_RFC_NAME"] = metadata["NOAA_RFC_NAME"]
                pivoted_forecasts.append(
                    ForecastDataForNOAAStation.model_validate(item)
                )

        for id in NOAA_ID_TO_METADATA:
            # don't add the same id twice; if we saw it already in the API
            # we don't need to add the same location info frm the CSV metadata
            if id in noaa_ids_seen_in_api_response:
                continue
            else:
                noaa_rfc_name = NOAA_ID_TO_METADATA[id]["NOAA_RFC_NAME"]

                match noaa_rfc_name:
                    case "Arkansas-Red Basin":
                        # all stations in the arkansas river basin for which this doesn't 404 are already
                        # included in the main noaa rfc api which powers the esp map so there is no reason to include this here;
                        # all stations that would hit this if statement would all 404 out
                        # image_plot_link = f"https://www.weather.gov/images/abrfc/WaterSupply/wsp.{id}.volume.exceed.90day.gif"
                        image_plot_link = None
                        dataset_link = "https://www.weather.gov/abrfc/watersupply_fcst"
                    case "Arkansas-Rio Grande-Texas Gulf":
                        dataset_link = "https://www.weather.gov/wgrfc/wsp_forecasts"
                        # not aware of anywhere that wgrfc has an image plot link
                        image_plot_link = None
                    case _:
                        dataset_link = None
                        image_plot_link = None
                shapely_geometry = shapely.from_wkt(NOAA_ID_TO_METADATA[id]["geometry"])
                assert isinstance(shapely_geometry, shapely.geometry.Point)
                pivoted_forecasts.append(
                    ForecastDataAdHoc(
                        espid=id,
                        includeInWWDHDashboard=(
                            NOAA_ID_TO_METADATA[id]["Include_in_WWDH_Dashboard"]
                        ),
                        NOAA_RFC_NAME=NOAA_ID_TO_METADATA[id]["NOAA_RFC_NAME"],
                        geometry=shapely_geometry,
                        doi_region_num=NOAA_ID_TO_METADATA[id]["doi_region_num"],
                        doi_region_name=NOAA_ID_TO_METADATA[id]["doi_region_name"],
                        espname=NOAA_ID_TO_METADATA[id]["Location_Name"],
                        image_plot_link=image_plot_link,
                        dataset_link=dataset_link,
                    )
                )

        self.locations = pivoted_forecasts

    def drop_all_locations_but_id(self, location_id: str):
        locations = []

        for forecast in self.locations:
            if forecast.espid == location_id:
                locations.append(forecast)

        self.locations = locations

    def _filter_by_geometry(
        self, geometry: BaseGeometry | None, z: str | None = None
    ) -> None:
        if z:
            raise NotImplementedError
        if not geometry:
            return

        locations = []
        for forecast in self.locations:
            if isinstance(forecast, ForecastDataAdHoc) and geometry.contains(
                forecast.geometry
            ):
                locations.append(forecast)
            elif isinstance(forecast, ForecastDataForNOAAStation):
                if geometry.contains(
                    ShapelyPoint(forecast.esplngdd, forecast.esplatdd)
                ):
                    locations.append(forecast)

        self.locations = locations

    def to_geojson(
        self,
        itemsIDSingleFeature: bool = False,
        skip_geometry: Optional[bool] = False,
        select_properties: Optional[list[str]] = None,
        properties: Optional[list[tuple[str, str]]] = None,
        fields_mapping: EDRFieldsMapping | OAFFieldsMapping = {},
        sortby: Optional[list[SortDict]] = None,
    ) -> GeojsonFeatureCollectionDict | GeojsonFeatureDict:
        features: dict[str, Feature] = {}
        for forecast in self.locations:
            if isinstance(forecast, ForecastDataAdHoc):
                serialized_feature = Feature(
                    type="Feature",
                    id=forecast.espid,
                    properties={
                        "espid": forecast.espid,
                        "include_in_wwdh_dashboard": forecast.includeInWWDHDashboard,
                        "NOAA_RFC_NAME": forecast.NOAA_RFC_NAME,
                        "noaa_id": forecast.espid,
                        "espname": forecast.espname,
                        "doi_region_num": forecast.doi_region_num,
                        "doi_region_name": forecast.doi_region_name,
                        "image_plot_link": forecast.image_plot_link,
                        "dataset_link": forecast.dataset_link,
                    },
                    geometry=Point(
                        coordinates=Position2D(
                            forecast.geometry.x,
                            forecast.geometry.y,
                        ),
                        type="Point",
                    ),
                )
            else:
                forecast.extend_with_metadata()

                # get all forecast values besides those which are shared across the entire forecast
                all_forecast_values = forecast.model_dump(
                    exclude={
                        "esplatdd",
                        "esplngdd",
                        "espid",
                        "espfdate",
                        "espname",
                        "dataset_link",
                        "image_plot_link",
                        "espfgroupid",
                        "espbasin",
                        "espsubbasin",
                    }
                )

                serialized_feature = Feature(
                    type="Feature",
                    id=forecast.espid,
                    properties={
                        "forecasts": {
                            str(forecast.espfdate): all_forecast_values,
                        },
                        "image_plot_link": forecast.image_plot_link,
                        "dataset_link": forecast.dataset_link,
                        "espname": forecast.espname,
                        "espfgroupid": forecast.espfgroupid,
                        "espbasin": forecast.espbasin,
                        "espsubbasin": forecast.espsubbasin,
                        "espid": forecast.espid,
                        "doi_region_num": forecast.doi_region_num,
                        "doi_region_name": forecast.doi_region_name,
                        "include_in_wwdh_dashboard": forecast.include_in_wwdh_dashboard,
                        "NOAA_RFC_NAME": forecast.NOAA_RFC_NAME,
                    },
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
            if isinstance(forecast, ForecastDataForNOAAStation):
                if forecast.espid in features:
                    alreadyExistingFeature = features[forecast.espid]
                    assert alreadyExistingFeature.properties
                    alreadyExistingFeature.properties["forecasts"][
                        str(forecast.espfdate)
                    ] = all_forecast_values  # pyright: ignore[reportPossiblyUnboundVariable]
                else:
                    features[forecast.espid] = serialized_feature
            elif isinstance(forecast, ForecastDataAdHoc):
                features[forecast.espid] = serialized_feature

        # since mapbox requires a static property for the latest forecast, we create it here
        # so the frontend doesn't need to do transformations on the data
        for feature in features.values():
            if not feature.properties or not feature.properties.get("forecasts"):
                continue

            # why the first forecast esppavg is considered to be the % normal
            # i have no idea; this is not defined anywhere i can see
            first_forecast_esppavg = list(feature.properties["forecasts"].values())[0][
                "esppavg"
            ]
            if first_forecast_esppavg == 0:
                # if the first forecast is 0 the % normal is considered to be null
                # this is just an arbitrary quirk of how the map here: https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_map.html
                # defines the % normal and missing data;
                feature.properties["percentage_normal"] = None
            else:
                feature.properties["percentage_normal"] = first_forecast_esppavg

        allFeatures = list(features.values())
        if itemsIDSingleFeature:
            match len(allFeatures):
                case 0:
                    raise ProviderItemNotFoundError(
                        "Filter resulted in 0 features after filtering; no feature with the associated id was found"
                    )
                case 1:
                    return cast(
                        GeojsonFeatureDict,
                        allFeatures[0].model_dump(exclude_unset=True),
                    )
                case _:
                    raise ProviderInvalidDataError(
                        f"Expected at most 1 feature, got {len(features)} features: {features}"
                    )

        if sortby:
            sort_by_properties_in_place(allFeatures, sortby)

        return cast(
            GeojsonFeatureCollectionDict,
            FeatureCollection(
                type="FeatureCollection", features=allFeatures
            ).model_dump(exclude_unset=True),
        )
