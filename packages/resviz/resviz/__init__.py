#!/usr/bin/env python3
# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import click
from datetime import date, timedelta, datetime
from dateutil.parser import parse as dateparse
from math import isnan

import logging
import multiprocessing as mp
from osgeo import ogr
import os
from time import sleep

from resviz.env import BASE_URL, POSTGRES_URL
from resviz.lib import create_feature, date_range, file_exists


LOGGER = logging.getLogger(__name__)


os.environ["CPL_VSIL_CURL_USE_HEAD"] = "NO"
os.environ["PG_USE_COPY"] = "OFF"
os.environ["OGR_PG_RETRIEVE_FID"] = "NO"
os.environ["OGR_PG_SKIP_CONFLICTS"] = "YES"


def run_subprocess(csv_url: str):
    """
    Downloads a CSV, processes and loads it into PostgreSQL
    using OGR Python bindings.
    """

    # Open the CSV datasource
    csv_driver = ogr.GetDriverByName("CSV")
    csv_ds = csv_driver.Open(f"/vsicurl/{csv_url}", 0)  # 0 for update mode
    if csv_ds is None:
        LOGGER.warning(f"Could not open CSV file: {csv_url}")
        return

    # Get the source layer.
    layer = csv_ds.GetLayer()
    layer_def = layer.GetLayerDefn()

    # Open the PostgreSQL datasource
    pg_driver = ogr.GetDriverByName("PostgreSQL")
    pg_ds = pg_driver.Open(POSTGRES_URL, 1)  # 1 for update mode
    if pg_ds is None:
        LOGGER.error("Could not open PostgreSQL database")

    # Get the target layer.
    pg_layer = pg_ds.GetLayerByName("resviz")

    # Process source 'layer'
    for feature in layer:
        row = {
            layer_def.GetFieldDefn(i).GetName().strip(): feature.GetField(i).strip()
            for i in range(layer_def.GetFieldCount())
        }

        row["DataDate"] = datetime.strptime(row["DataDate"], "%m/%d/%Y").strftime(
            "%Y-%m-%d"
        )

        if isnan(float(row["DataValue"])):
            LOGGER.error(f"Skipping NaN on {row['DataDate']} from {row['SiteName']}")

        # Upsert data value
        create_feature(pg_layer, row, "raw")
        # Upsert average value
        create_feature(pg_layer, row, "avg")
        # Upsert 10th percentile value
        create_feature(pg_layer, row, "p10")
        # Upsert 90th percentile value
        create_feature(pg_layer, row, "p90")


@click.command()
@click.option("--start", default=None, help="Start date (YYYY-MM-DD)", type=str)
@click.option("--end", default=None, help="End date (YYYY-MM-DD)", type=str)
def load(start, end):
    """Download and load drought CSVs into PostGIS using ogr2ogr."""

    today = date.today()
    start_date = dateparse(start).date() if start else today - timedelta(days=1)
    end_date = dateparse(end).date() if end else today

    for dt in date_range(start_date, end_date):
        ymd = dt.strftime("%Y%m%d")
        layer_name = f"droughtData{ymd}"
        csv_url = f"{BASE_URL}/{layer_name}.csv"

        # Only download if it exists
        if not file_exists(csv_url):
            continue

        while len(mp.active_children()) == mp.cpu_count():
            sleep(0.1)

        click.echo(f"Loading: {csv_url}")
        p = mp.Process(target=run_subprocess, args=(csv_url,))
        p.start()

    click.echo("All loading processes done.")


if __name__ == "__main__":
    load()
