# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from datetime import timedelta, date
import logging
from osgeo import ogr, gdal
import re
import requests
from typing import Iterator

from resviz.mappings import LOCATION_IDS


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

    match parameter:
        case "p10":
            p_val = "DataDateP10"
        case "avg":
            p_val = "DataDateAvg"
        case "p90":
            p_val = "DataDateP90"
        case _:
            p_val = "DataValue"

    row["SiteShortName"] = re.search(r"/([^/]+)\.png$", row["TeacupUrl"]).group(1)  # pyright: ignore
    row["SiteId"] = LOCATION_IDS.get(row["SiteShortName"], 0)

    feature = ogr.Feature(pg_layer.GetLayerDefn())
    id = f"{row['SiteId']}.{row['DataDate']}.{parameter}"
    feature.SetField("id", id)
    feature.SetField("value", row[p_val])
    feature.SetField("data_date", row["DataDate"])
    feature.SetField("monitoring_location_id", row["SiteId"])
    feature.SetField("parameter_id", parameter)

    try:
        pg_layer.CreateFeature(feature)
    except RuntimeError as e:
        LOGGER.error(e)
    finally:
        feature = None  # Release feature
