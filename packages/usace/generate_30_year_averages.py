# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

# pyright: reportAttributeAccessIssue=false
# pyright: reportArgumentType=false
# type ignores needed to disable pyright errors for dynamic pandas operations
from datetime import datetime
import json
from pathlib import Path
from typing import TypedDict
import pandas as pd
import pathlib
import geopandas as gpd


def generate_mapper():
    print("Generating nid to grand id mapper...")
    current_dir = pathlib.Path(__file__).parent

    # Load the dam datasets
    global_dams = gpd.read_file(current_dir / "ReservoirsGRanD.gpkg")

    print(f"Loaded {len(global_dams)} global dams.")

    nid_dams = gpd.read_file(current_dir / "national_inventory_of_dams.gpkg")

    print(f"Loaded {len(nid_dams)} NID dams.")

    # Ensure same CRS (reproject to EPSG:3857 for accurate distance calculations in meters)
    global_dams = global_dams.to_crs(epsg=3857)
    nid_dams = nid_dams.to_crs(epsg=3857)

    # Perform spatial join between buffered NID dams and global dams
    threeHundredMeters = 300
    joined = gpd.sjoin_nearest(
        nid_dams, global_dams, how="inner", max_distance=threeHundredMeters
    )

    grand_to_nid = dict(zip(joined["GRAND_ID"], joined["nidId"]))

    # Export to JSON
    with open(current_dir / "grand_to_nid.json", "w") as f:
        json.dump(grand_to_nid, f, indent=2)

    print(f"Mapped the grand and nid ids of {len(grand_to_nid)} dams.")


generate_mapper()

attributes = (
    Path(__file__).parent / "ResOpsUS" / "attributes" / "reservoir_attributes.csv"
)

assert attributes.exists()

data_dict = pd.read_csv(attributes)

# filter out dams with agency code not equal to ACE or DUKE somewhere
# this is since our integration we only care about adding the averages to the usace
# reservoirs
usace_stations = data_dict[
    data_dict["AGENCY_CODE"].str.contains("DUKE")
    | data_dict["AGENCY_CODE"].str.contains("ACE")
]

assert len(usace_stations) < len(data_dict)

print(f"Filtered ResOpsUS to {len(usace_stations)} USACE affiliated dams.")

# The time_series_all folder contains individual CSV files for each dam that contain all the direct observations.
# Raw time series folder is not used since it contains the same dam from multiple sources; we can just use the one canonical one
timeseries_folder = Path(__file__).parent / "ResOpsUS" / "time_series_all"


type date = str
type reservoirName = str


# We want to be able to store this data in a json, so we use
# a typeddict for more understandability
class ReservoirStorageMetadata(TypedDict):
    thirtyYearAverage: float
    tenthPercentile: float
    ninetiethPercentile: float


reservoirToDayOfMonthAndValues: dict[str, dict[str, ReservoirStorageMetadata]] = {}

grandNidMapper = Path(__file__).parent / "grand_to_nid.json"

with open(grandNidMapper, "r") as f:
    GRAND_ID_TO_NID: dict = json.load(f)


unmappedIds: list[str] = []

for _, station in usace_stations.iterrows():
    grand_id = station["DAM_ID"]

    associatedNidId = GRAND_ID_TO_NID.get(str(grand_id))

    if associatedNidId is None:
        unmappedIds.append(str(grand_id))
        continue

    dam_name = station["DAM_NAME"]

    # we will need to join with the timeseries csv
    associatedTimeseries = (
        Path(__file__).parent
        / "ResOpsUS"
        / "time_series_all"
        / f"ResOpsUS_{grand_id}.csv"
    )

    csv = pd.read_csv(associatedTimeseries)

    # this is the 30 year period that usbr uses for the purposes of calculating its 30 year
    # average; this allows both
    usbr_30_year_period = (
        datetime.strptime("10/1/1990", "%m/%d/%Y"),
        datetime.strptime("9/30/2020", "%m/%d/%Y"),
    )

    # convert to datetime for comparison
    csv["date"] = csv["date"].apply(lambda x: datetime.strptime(x, "%Y-%m-%d"))

    # filter to the 30 year period and copy to avoid mutation issues
    filteredCsv = csv[
        (csv["date"] >= usbr_30_year_period[0])
        & (csv["date"] <= usbr_30_year_period[1])
    ].copy()

    # get just the month and day; this is since for every day we need to provide the 30 year average
    # for that day, regardless of the year
    filteredCsv["month_and_day"] = filteredCsv["date"].apply(
        lambda x: x.strftime("%m-%d")
    )

    # don't use any missing values for averages
    filteredCsv["storage"].dropna(inplace=True)

    if len(filteredCsv["storage"]) == 0:
        print(f"No values for {dam_name} so we cannot generate 30 year averages for it")
        continue

    for date_group, group in filteredCsv.groupby("month_and_day"):
        if associatedNidId not in reservoirToDayOfMonthAndValues:
            reservoirToDayOfMonthAndValues[associatedNidId] = {"grandID": grand_id}

        assert isinstance(date_group, str)

        values = group["storage"]
        assert isinstance(values, pd.Series)

        reservoirToDayOfMonthAndValues[associatedNidId][date_group] = (
            ReservoirStorageMetadata(
                thirtyYearAverage=values.mean(),
                # 10th percentile is the same as 0.1 quantile
                tenthPercentile=values.quantile(0.1),
                ninetiethPercentile=values.quantile(0.9),
            )
        )
print(
    f"{len(unmappedIds)} dams could not be mapped to NID IDs so we cannot generate 30 year averages for them; skipped {', '.join(unmappedIds)}"
)
print(
    f"Generated 30 year averages and quantiles for {len(reservoirToDayOfMonthAndValues)} dams"
)

with open("30_year_averages_by_nid_id.json", "w") as f:
    f.write(json.dumps(reservoirToDayOfMonthAndValues, indent=4))
