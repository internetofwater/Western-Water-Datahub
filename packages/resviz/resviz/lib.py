# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from copy import deepcopy
from datetime import timedelta, date, datetime
from osgeo import ogr, gdal
import re
import requests
from typing import Iterator

gdal.UseExceptions()


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


def create_feature(pg_layer, row, parameter):
    """Create postgres feature from a CSV row"""
    row = deepcopy(row)
    p_name = "Lake/Reservoir Storage"

    match parameter:
        case 0:
            p_name = "Min" + p_name
            p_val = "DataDateMin"
            p_suffix = "min"
        case 1:
            p_name = "Avg" + p_name
            p_val = "DataDateAvg"
            p_suffix = "avg"
        case 2:
            p_name = "Max" + p_name
            p_val = "DataDateMax"
            p_suffix = "max"
        case _:
            p_val = "DataValue"
            p_suffix = "value"

    row["DataDate"] = datetime.strptime(
        row["DataDate"], "%m/%d/%Y"
    ).strftime("%Y-%m-%d")
    row["SiteShortName"] = re.search(
        r"/([^/]+)\.png$", row["TeacupUrl"]
    ).group(1) # pyright: ignore

    feature = ogr.Feature(pg_layer.GetLayerDefn())
    id = f"{row["SiteShortName"]}.{row["DataDate"]}.{p_suffix}"
    feature.SetField("id", id)
    feature.SetField("monitoring_location_id", row["SiteShortName"])
    feature.SetField("site_name", row["SiteName"])
    feature.SetField("state", row["State"])
    feature.SetField("doi_region", row["DoiRegion"])
    feature.SetField("value", row[p_val])
    feature.SetField("max_capacity", row["MaxCapacity"])
    feature.SetField("parameter_unit", row["DataUnits"])
    feature.SetField("data_date", row["DataDate"])
    feature.SetField("parameter_name", p_name)
    feature.SetField("parameter_id", parameter)

    point = ogr.Geometry(ogr.wkbPoint)
    point.SetPoint_2D(0, float(row["Lon"]), float(row["Lat"]))
    feature.SetGeometry(point)

    try:
        pg_layer.CreateFeature(feature)
    except RuntimeError:
        pass
    finally:
        feature = None # Release feature
