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

from teacup.env import BASE_URL, POSTGRES_URL
from teacup.lib import (
    create_feature,
    date_range,
    run_location_load,
    setup_table_schema,
)
from teacup.mappings import NAME_TO_ID_MAPPING


LOGGER = logging.getLogger(__name__)

# Set GDAL config options via environment variable
# https://gdal.org/en/stable/user/configoptions.html#global-configuration-options
os.environ["CPL_VSIL_CURL_USE_HEAD"] = "NO"
os.environ["PG_USE_COPY"] = "OFF"
os.environ["OGR_PG_RETRIEVE_FID"] = "NO"
os.environ["OGR_PG_SKIP_CONFLICTS"] = "YES"


def run_subprocess(csv_url: str):
    """
    Downloads a CSV, processes and loads it into PostgreSQL
    using OGR Python bindings.
    """
    if csv_url.startswith("http"):
        csv_url = f"/vsicurl/{csv_url}"

    if csv_url.endswith(".zip"):
        csv_url = f"/vsizip/{csv_url}"

    # Open the CSV datasource
    csv_driver = ogr.GetDriverByName("CSV")
    try:
        csv_ds = csv_driver.Open(csv_url, 0)  # 0 for read-only mode
    except RuntimeError:
        LOGGER.warning(f"No CSV found at {csv_url}")
        return

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
    pg_layer = pg_ds.GetLayerByName("teacup")

    # Process source 'layer'
    for feature in layer:
        try:
            row = {
                layer_def.GetFieldDefn(i).GetName().strip(): feature.GetField(i).strip()
                for i in range(layer_def.GetFieldCount())
            }
        except AttributeError:
            LOGGER.error(f"Skipping row with missing fields from {feature}")
            continue

        if (
            not row.get("SiteName")
            or not row.get("DataDate")
            or not row.get("DataValue")
        ):
            LOGGER.debug(
                f"Skipping incomplete row from {row.get('SiteName', 'unknown site')}"
            )
            continue

        try:
            row["DataDate"] = datetime.strptime(row["DataDate"], "%m/%d/%Y").strftime(
                "%Y-%m-%d"
            )
        except ValueError:
            LOGGER.error(
                f"Skipping invalid date {row['DataDate']} from {row['SiteName']}"
            )
            continue

        if isnan(float(row["DataValue"])):
            LOGGER.error(f"Skipping NaN on {row['DataDate']} from {row['SiteName']}")
            continue

        LOGGER.debug(
            f"Processing {row['SiteName']} on {row['DataDate']} with value {row['DataValue']}"
        )
        row["SiteId"] = NAME_TO_ID_MAPPING.get(row["SiteName"])
        if row["SiteId"] is None:
            LOGGER.error(f"Skipping unmapped site {row['SiteName']}")
            continue

        # Upsert data value
        create_feature(pg_layer, row, "raw")
        # Upsert average value
        create_feature(pg_layer, row, "avg")
        # Upsert 10th percentile value
        create_feature(pg_layer, row, "p10")
        # Upsert 90th percentile value
        create_feature(pg_layer, row, "p90")


@click.command()
def create_table_schema():
    """Create the database table schema."""
    setup_table_schema()


@click.command()
@click.option(
    "--force-clean-layer",
    is_flag=True,
    help="Force reload locations by recreating existing table",
)
def load_locations(force_clean_layer):
    """Load location GeoJSON into PostGIS using ogr2ogr."""
    try:
        run_location_load(force_clean_layer=force_clean_layer)
    except Exception as e:
        LOGGER.error(f"Error loading locations: {e}")
        LOGGER.info("Attempting to create table schema and retry loading locations.")
        setup_table_schema()
        run_location_load()


@click.command()
@click.option("--start", default=None, help="Start date (YYYY-MM-DD)", type=str)
@click.option("--end", default=None, help="End date (YYYY-MM-DD)", type=str)
@click.option(
    "--url", default=None, help="CSV URL to load (overrides date range)", type=str
)
def load(start, end, url):
    """Download and load drought CSVs into PostGIS using ogr2ogr."""

    if url:
        click.echo(f"Loading: {url}")
        run_subprocess(url)
        click.echo("Loading process done.")
        return

    today = date.today()
    start_date = dateparse(start).date() if start else today - timedelta(days=2)
    end_date = dateparse(end).date() if end else today

    for dt in date_range(start_date, end_date):
        ymd = dt.strftime("%Y%m%d")
        layer_name = f"droughtData{ymd}"
        csv_url = f"{BASE_URL}/{layer_name}.csv"

        while len(mp.active_children()) == mp.cpu_count():
            sleep(0.1)

        click.echo(f"Loading: {csv_url}")
        p = mp.Process(target=run_subprocess, args=(csv_url,))
        p.start()

    while len(mp.active_children()) > 0:
        sleep(0.5)

    click.echo("All loading processes done.")


@click.group()
def cli():
    pass


cli.add_command(create_table_schema, "tables")
cli.add_command(load_locations, "locations")
cli.add_command(load)


if __name__ == "__main__":
    load()
