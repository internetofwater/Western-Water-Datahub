# Copyright 2026 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

# /// script
# requires-python = ">=3.12"
# dependencies = ["pandas", "openpyxl", "geopandas"]
# ///

from pathlib import Path

import pandas as pd

df = pd.read_csv(
    "https://raw.githubusercontent.com/cgs-earth/teacup-generator/refs/heads/main/R-workflow/config/locations.csv"
)

df = df[["Name", "Use Total or Active Storage"]]

df["Name"] = df["Name"].str.replace(" ", "")

df.rename(
    columns={
        "Name": "id",
        "Use Total or Active Storage": "use_total_or_active_storage",
    },
    inplace=True,
)


assert len(df.columns) == 2

SQL_script = ""

for row in df.itertuples():
    if pd.isna(row.use_total_or_active_storage):
        continue
    # Use single quotes for string values, escape any single quotes in data
    assert isinstance(row.use_total_or_active_storage, str)
    assert row.use_total_or_active_storage in ["Total", "Active"]
    SQL_script += f"UPDATE teacup_locations SET use_total_or_active_storage = '{row.use_total_or_active_storage}' WHERE id = '{row.id}';\n"

with open((Path(__file__).parent / "update_teacup_locations.sql"), "w") as f:
    f.write(SQL_script)

print("SQL script generated successfully!")
