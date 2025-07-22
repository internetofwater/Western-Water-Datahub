# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from datetime import timedelta, date
import logging
from osgeo import ogr, gdal
import re
import requests
from typing import Iterator

from resviz.mappings import DOI_REGIONS, LOCATION_IDS


gdal.UseExceptions()

LOGGER = logging.getLogger(__name__)


def file_exists(url: str) -> bool:
    """Check if the URL exists by requesting only the first byte."""
    try:
        r = requests.get(url, headers={"Range": "bytes=0-0"}, timeout=10)
        return r.status_code in (200, 206)
    except requests.RequestException:
        return False


def date_range(start_date: date, end_date: date) -> Iterator[date]:
    """Create an iterator of Datetime objects between period"""
    for n in range(int((end_date - start_date).days) + 1):
        yield start_date + timedelta(n)


def create_feature(pg_layer, row, parameter: str):
    """Create postgres feature from a CSV row"""
    p_name = "Lake/Reservoir Storage"

    match parameter:
        case "p10":
            p_name += " 10th Percentile"
            p_val = "DataDateP10"
            p_suffix = "P10"
        case "avg":
            p_name += " Average"
            p_val = "DataDateAvg"
            p_suffix = "avg"
        case "p90":
            p_name += " 90th Percentile"
            p_val = "DataDateP90"
            p_suffix = "P90"
        case _:
            p_val = "DataValue"
            p_suffix = "raw"

    row["SiteShortName"] = re.search(r"/([^/]+)\.png$", row["TeacupUrl"]).group(1)  # pyright: ignore
    row["SiteId"] = LOCATION_IDS.get(row["SiteShortName"], 0)
    region = DOI_REGIONS[row["DoiRegion"]]

    feature = ogr.Feature(pg_layer.GetLayerDefn())
    id = f"{row['SiteId']}.{row['DataDate']}.{p_suffix}"
    feature.SetField("id", id)
    feature.SetField("monitoring_location_id", row["SiteId"])
    feature.SetField("monitoring_location_name", row["SiteShortName"])
    feature.SetField("site_name", row["SiteName"])
    feature.SetField("state", row["State"])
    feature.SetField("doi_region_num", region["reg_num"])
    feature.SetField("doi_region_name", region["reg_name"])
    feature.SetField("doi_region", row["DoiRegion"])
    feature.SetField("huc08", row["Huc8"])
    feature.SetField("huc06", row["Huc8"][:6])
    feature.SetField("value", row[p_val])
    feature.SetField("max_capacity", row["MaxCapacity"])
    feature.SetField("parameter_unit", row["DataUnits"].lower())
    feature.SetField("data_date", row["DataDate"])
    feature.SetField("parameter_name", p_name)
    feature.SetField("parameter_id", parameter)

    point = ogr.Geometry(ogr.wkbPoint)
    point.SetPoint_2D(0, float(row["Lon"]), float(row["Lat"]))
    feature.SetGeometry(point)

    try:
        pg_layer.CreateFeature(feature)
    except RuntimeError as e:
        LOGGER.error(e)
    finally:
        feature = None  # Release feature
