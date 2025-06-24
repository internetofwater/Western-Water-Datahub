#!/usr/bin/env python3
# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import click
from datetime import date, timedelta
from dateutil.parser import parse as dateparse
from pathlib import Path
import multiprocessing as mp
import subprocess
from tempfile import TemporaryDirectory

from time import sleep

from resviz.env import BASE_URL, POSTGRES_URL
from resviz.lib import VRT_TEMPLATE, VRT_ROW, file_exists, fetch_csv, date_range


def run_subprocess(csv_url, layer_name):
    tmpdir = TemporaryDirectory()
    tmp = Path(tmpdir.name)
    tmp.mkdir(parents=True, exist_ok=True)
    csv_file = tmp / "input.csv"
    vrt_file = tmp / f"{layer_name}.vrt"

    with open(vrt_file, "w") as vrt:
        vrt.write(VRT_TEMPLATE.format(file=csv_file))

    fh = fetch_csv(csv_url)
    fh.to_csv(csv_file, index=False)

    ogr_cmd = [
        "ogr2ogr",
        "-f",
        "PostgreSQL",
        POSTGRES_URL,
        vrt_file,
        "-nln",
        "resviz",
        "--config",
        "OGR_PG_RETRIEVE_FID",
        "NO",
        "--config",
        "OGR_PG_SKIP_CONFLICTS",
        "YES",
        "-append",
        "-update",
        "-sql",
        VRT_ROW,
    ]
    try:
        subprocess.run(ogr_cmd, check=True)
    except subprocess.CalledProcessError as e:
        click.echo(f"ogr2ogr failed: {e}")
    finally:
        tmpdir.cleanup()


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
        p = mp.Process(target=run_subprocess, args=(csv_url, layer_name))
        p.start()

    click.echo("Done")


if __name__ == "__main__":
    load()
