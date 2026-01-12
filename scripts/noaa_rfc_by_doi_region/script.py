# Copyright 2026 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from pathlib import Path
import geopandas as gpd
import pandas as pd
import requests

# --------------------------------------------------
# 1. API endpoints
# --------------------------------------------------
NOAA_RFC_URL = "https://api.wwdh.internetofwater.app/collections/noaa-rfc/items?f=json"
DOI_REGIONS_URL = (
    "https://api.wwdh.internetofwater.app/collections/doi-regions/items?f=json"
)

# --------------------------------------------------
# 2. Load NOAA RFC features
# --------------------------------------------------
print("Loading NOAA RFC features...")
gdf_noaa = gpd.read_file(NOAA_RFC_URL)
print(f"Loaded {len(gdf_noaa)} NOAA RFC stations")

# --------------------------------------------------
# 3. Load DOI Regions features via requests (avoid 500 error)
# --------------------------------------------------
print("Downloading DOI regions...")
headers = {"User-Agent": "Mozilla/5.0"}
response = requests.get(DOI_REGIONS_URL, headers=headers, timeout=120)
response.raise_for_status()
data = response.json()

gdf_regions = gpd.GeoDataFrame.from_features(data["features"])
gdf_regions.crs = "EPSG:4326"  # set CRS if not included
print(f"Loaded {len(gdf_regions)} DOI regions")

# --------------------------------------------------
# 4. Ensure CRS matches
# --------------------------------------------------
if gdf_noaa.crs != gdf_regions.crs:
    gdf_noaa = gdf_noaa.to_crs(gdf_regions.crs)  # type: ignore

# --------------------------------------------------
# 5. Spatial join: assign each NOAA station to a DOI region
# --------------------------------------------------
print("Performing spatial join...")
gdf_joined = gpd.sjoin(gdf_noaa, gdf_regions, how="left", predicate="within")

# make REG_NAME renamed to DOI_REGION
gdf_joined.rename(
    columns={"REG_NAME": "doi_region_name", "REG_NUM": "doi_region_num"}, inplace=True
)

# --------------------------------------------------
# 6. Rearrange columns: DOI_REGION first, espname second, then all NOAA properties
# --------------------------------------------------
# Start with DOI_REGION
cols = ["doi_region_name", "doi_region_num"] + [
    c for c in gdf_noaa.columns if c != "geometry"
]

# Ensure espname is second column
if "espname" in cols:
    cols.remove("espname")
    cols.insert(1, "espname")

# Convert to DataFrame
df_final = pd.DataFrame(gdf_joined[cols])

# Drop unwanted columns
df_final.drop(columns=["forecasts"], inplace=True)
df_final.drop(columns=["latest_esppavg"], inplace=True)

noaa_cols = [c for c in cols if c not in ["doi_region_name", "doi_region_num"]]
rename_dict = {c: f"noaa_{c}" for c in noaa_cols}
df_final = df_final.rename(columns=rename_dict)

# Sort by REG_NAME
df_final = df_final.sort_values("doi_region_name").reset_index(drop=True)

# cast the region number to an integer so it is consistent across collections for sorting
df_final["doi_region_num"] = pd.to_numeric(
    df_final["doi_region_num"], errors="coerce"
).astype("Int64")

# --------------------------------------------------
# 7. Save results
# --------------------------------------------------

output_path = Path(__file__).parent / "noaa_rfc_stations_by_region.csv"

df_final.to_csv(output_path, index=False)
print(
    "Saved full NOAA RFC stations table by DOI region to noaa_rfc_stations_by_region.csv"
)
