# Copyright 2026 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

"""
the awdb forecast API uses the same API as snotel; it has one endpoint to list
params and those params are the list for the entire API for all stations. Thus
awdb forecasts can have a lot of params that are not relevant to the collection

however our collection is setup up in such as a way that
we only present the stations with forecast data and their forecast params.

"""

from pathlib import Path
import requests

url = "http://localhost:5005/collections/awdb-forecasts-edr/locations?limit=5000"

r = requests.get(url)
r.raise_for_status()

as_json = r.json()

found_params = set()

for i, feature in enumerate(as_json["features"]):
    id = feature["id"]

    timeseries_url = f"http://localhost:5005/collections/awdb-forecasts-edr/locations/{id}?datetime=2025-01-01/2025-11-01"

    timeseries_r = requests.get(timeseries_url)
    timeseries_r.raise_for_status()

    timeseries_as_json = timeseries_r.json()

    parameters = timeseries_as_json["parameters"]

    for parameter in parameters:
        found_params.add(parameter)

    print(
        f"Found {len(parameters)} params for location {i}/{len(as_json['features'])} with id {id}"
    )

output_file = Path(__file__).parent / "awdb_forecast_params.txt"
with output_file.open("w") as f:
    for param in sorted(found_params):
        f.write(f"{param}\n")
