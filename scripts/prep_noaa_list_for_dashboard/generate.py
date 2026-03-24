# Copyright 2026 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

# /// script
# requires-python = ">=3.12"
# dependencies = ["pandas", "openpyxl", "geopandas"]
# ///

from pathlib import Path

import geopandas as gpd

df = gpd.read_file(
    Path(__file__).parent / "NOAA RFC Forecast Points - To IoW.xlsx",
    sheet_name="RFC Stations - Regional Review",
)

# create a geometry column that is a point created from the longitude and latitude
# for some reason usbr renamed the column to "Column1" so we need to use that for longitude
df = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df["longitude"], df["Column1"]))

# filter out the row with noaa_id ESSC2 / CGYC2 since these are edge cases that
# don't have info in the API
df = df[df["noaa_id"] != "ESSC2"]
df = df[df["noaa_id"] != "CGYC2"]


def print_invalid(gdf):
    invalid = gdf[~gdf.geometry.is_valid]
    print(invalid)


assert df.geometry.is_valid.all(), print_invalid(df)
assert df.crs is None

df.crs = "EPSG:4326"

assert "Post-Review Decision" in df.columns.to_list()


failed = df[df["in_wwdh_backend_api"].isna()]
assert failed.empty, (
    f"Found NaNs in in_wwdh_backend_api. Found {len(failed)} rows:\n{failed.head()}"
)

print(
    df.groupby("doi_region_name")["in_wwdh_backend_api"]
    .value_counts()
    .unstack(fill_value=0)
    .rename(columns={0.0: "missing", 1.0: "present"})
)

print(
    df.query(
        "'Post-Review Decision' == 'Include' and in_wwdh_backend_api == 0.0"
    ).sort_values("in_wwdh_backend_api", ascending=True)
)

noaa_rfc_boundaries = gpd.read_file(Path(__file__).parent / "rf05mr24")

assert noaa_rfc_boundaries.crs == "EPSG:4269", noaa_rfc_boundaries.crs
# drop alaska since there are no relevant rfc gages there for usbr's purposes and
# the geometry appears to be incorrect
noaa_rfc_boundaries = noaa_rfc_boundaries[
    noaa_rfc_boundaries["RFC_CITY"] != "Anchorage"
]
noaa_rfc_boundaries.to_crs("EPSG:4326", inplace=True)

assert noaa_rfc_boundaries.geometry.is_valid.all(), print_invalid(noaa_rfc_boundaries)

df = gpd.sjoin(df, noaa_rfc_boundaries, how="left", rsuffix="_noaa_rfc_boundaries")

df["in_wwdh_backend_api"] = df["in_wwdh_backend_api"].fillna(False)

df["Location_Name"] = df["Location Full Name"].combine_first(
    df["Location_name_in_noaa_esri_service"]
)

assert df["Location_Name"].isna().sum() == 0
df = df[
    [
        "noaa_id",
        "Post-Review Decision",
        "RFC_NAME",
        "Location_Name",
        "geometry",
    ]
]


mapping = {"Include": True, "Do Not Include": False}

mapped = df["Post-Review Decision"].map(mapping)

# detect unmapped values
invalid = df.loc[
    mapped.isna() & df["Post-Review Decision"].notna(), "Post-Review Decision"
]

if not invalid.empty:
    raise ValueError(f"Unexpected values in Post-Review Decision: {invalid.unique()}")

df["Post-Review Decision"] = mapped

df.rename(
    columns={
        "Post-Review Decision": "Include_in_WWDH_Dashboard",
        "RFC_NAME": "NOAA_RFC_NAME",
    },
    inplace=True,
)

# change the value of LABW4 to LABW4; there is an extra tab in the file
# for some reason
df.loc[df["noaa_id"] == "\tLABW4", "noaa_id"] = "LABW4"


df.to_csv(
    Path(__file__).parent.parent.parent
    / "packages"
    / "noaa_rfc"
    / "src"
    / "noaa_rfc"
    / "noaa_id_to_include.csv",
    index=False,
)


print(df.head())

print("DONE!")
