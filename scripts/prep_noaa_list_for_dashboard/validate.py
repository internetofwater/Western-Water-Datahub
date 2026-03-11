# Copyright 2026 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

# /// script
# requires-python = ">=3.12"
# dependencies = ["pandas", "openpyxl", "geopandas"]
# ///

"""

This script validates that the data in our local api
matches all the include / exclude info that usbr requested
"""

from pathlib import Path
import geopandas as gpd
import pandas as pd

excel_df = pd.read_excel(
    Path(__file__).parent / "NOAA RFC Forecast Points - To IoW.xlsx",
    sheet_name="RFC Stations - Regional Review",
)

mapping = {"Include": True, "Do Not Include": False}

excel_df["Post-Review Decision"] = excel_df["Post-Review Decision"].map(mapping)

assert excel_df["Post-Review Decision"].isin([True, False]).all()

# change the value of LABW4 to LABW4; there is an extra tab in the xlsx file
# for some reason
excel_df.loc[excel_df["noaa_id"] == "\tLABW4", "noaa_id"] = "LABW4"

# filter out the row with noaa_id ESSC2 / CGYC2 since these are edge cases that
# don't have info in the API
excel_df = excel_df[excel_df["noaa_id"] != "ESSC2"]
excel_df = excel_df[excel_df["noaa_id"] != "CGYC2"]


# locations in local API
api = "http://localhost:5005/collections/noaa-rfc/items?limit=2000"
api_df = gpd.read_file(api)

api_df["is_usbr_curated"] = api_df["is_usbr_curated"].astype(bool)
excel_df["Post-Review Decision"] = excel_df["Post-Review Decision"].astype(bool)

excel_df_include_total = len(excel_df.query("`Post-Review Decision` == True"))
api_df_include_total = len(api_df.query("is_usbr_curated == True"))

assert excel_df_include_total == api_df_include_total == 216, (
    f"{excel_df_include_total=} != {api_df_include_total=} != 216"
)

# compare sets
excel_ids = set(excel_df["noaa_id"].unique())
api_ids = set(api_df["espid"].unique())


missing_in_api = excel_ids - api_ids
extra_in_api = api_ids - excel_ids

if missing_in_api or extra_in_api:
    msg = "NOAA ID mismatch:\n"
    if missing_in_api:
        msg += f"  Missing in API: {missing_in_api}\n"
    if extra_in_api:
        msg += f"  Extra in API: {extra_in_api}\n"
    raise AssertionError(msg)

assert len(excel_ids) == len(api_ids), (
    f"Excel has {len(excel_ids)} locations but API has {len(api_ids)}"
)

# ensure that is_usbr_curated as set in the excel df matches the api df for each id value
# merge the relevant columns from Excel and API on the NOAA ID
merged = excel_df[["noaa_id", "Post-Review Decision"]].merge(
    api_df[["espid", "is_usbr_curated"]],
    left_on="noaa_id",
    right_on="espid",
    suffixes=("_excel", "_api"),
    how="inner",
)

# ensure they are the same type, i.e. string values that represent true / false
mismatches = merged[
    merged["Post-Review Decision"].astype(str).str.lower()
    != merged["is_usbr_curated"].astype(str).str.lower()
]

assert mismatches.empty, (
    f"Mismatch in 'is_usbr_curated' for the following IDs:\n"
    f"{mismatches[['noaa_id', 'Post-Review Decision', 'is_usbr_curated']]}"
)


# ensure the location filter in the API behaves the same as manually querying in geopandas
api_with_include_filter = (
    "http://localhost:5005/collections/noaa-rfc/items?limit=2000&is_usbr_curated=True"
)
api_df_with_include_filter = gpd.read_file(api_with_include_filter)
assert len(api_df_with_include_filter) == 216
assert (
    api_df_with_include_filter["espid"]
    .isin(merged.query("`Post-Review Decision` == True")["noaa_id"].unique())
    .all
)

print("Success!")
