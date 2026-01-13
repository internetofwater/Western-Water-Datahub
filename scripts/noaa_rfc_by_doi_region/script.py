# Copyright 2026 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

# %%
from pathlib import Path
import geopandas as gpd
import pandas as pd
import requests

# use the local development server so that so that the data is always up-to-date
WWDH_NOAA_URL = "http://localhost:5005/collections/noaa-rfc/items?f=json"
DOI_REGIONS_URL = (
    "https://api.wwdh.internetofwater.app/collections/doi-regions/items?f=json"
)
# we don't request the entire us since usbr doesn't care about the east for this project
# see the extent.png file for the extent visually
west_coast_until_roughly_mississippi = "-130.078125,25.085599,-91.230469,50.120578"
NOAA_ALL_GAGES_URL = (
    "https://mapservices.weather.noaa.gov/eventdriven/rest/services/"
    "water/riv_gauges/MapServer/15/query"
    "?where=1=1"
    "&outFields=*"
    "&geometryType=esriGeometryEnvelope"
    f"&geometry={west_coast_until_roughly_mississippi}"
    "&inSR=4326"
    "&spatialRel=esriSpatialRelIntersects"
    "&f=geojson"
)

print("Loading NOAA RFC features...")
gdf_wwdh_noaa = gpd.read_file(WWDH_NOAA_URL)

# %%

# if we are hitting an API with the region info already set, we just remove it
# so that we can do the spatial join and regenerate the region info
gdf_wwdh_noaa.drop(columns=["doi_region_name", "doi_region_num"], inplace=True)

print(f"Loaded {len(gdf_wwdh_noaa)} NOAA RFC stations")

print("Downloading DOI regions...")
headers = {"User-Agent": "Mozilla/5.0"}
response = requests.get(DOI_REGIONS_URL, headers=headers, timeout=120)
response.raise_for_status()
data = response.json()

gdf_doi = gpd.GeoDataFrame.from_features(data["features"])
gdf_doi.crs = "EPSG:4326"  # set CRS if not included
print(f"Loaded {len(gdf_doi)} DOI regions")

print("Downloading all NOAA gauges...")
gdf_noaa = gpd.read_file(NOAA_ALL_GAGES_URL)
print(f"Loaded {len(gdf_noaa)} NOAA gauges")

# %%

assert gdf_wwdh_noaa.crs == gdf_noaa.crs == gdf_doi.crs == "EPSG:4326"

gdf_wwdh_noaa["in_wwdh_backend_api"] = True

gdf_noaa_both_sources = gdf_noaa.merge(
    gdf_wwdh_noaa,
    how="outer",
    left_on="gaugelid",
    right_on="id",
    suffixes=("", "_wwdh"),
)

# set a new id column
gdf_noaa_both_sources["noaa_id"] = gdf_noaa_both_sources["gaugelid"].combine_first(
    gdf_noaa_both_sources["id"]
)

gdf_noaa_both_sources["geometry"] = gdf_noaa_both_sources["geometry"].combine_first(
    gdf_noaa_both_sources["geometry_wwdh"]
)

assert gdf_noaa_both_sources.geometry.is_valid.all()

gdf_noaa_with_doi = gpd.sjoin(
    gdf_noaa_both_sources, gdf_doi, how="left", predicate="intersects"
)


# make REG_NAME renamed to DOI_REGION
gdf_noaa_with_doi.rename(
    columns={"REG_NAME": "doi_region_name", "REG_NUM": "doi_region_num"}, inplace=True
)

# make sure

cols = [
    "noaa_id",
    "doi_region_name",
    "doi_region_num",
    "image_plot_link",
    "in_wwdh_backend_api",
]
gdf_noaa_with_doi = gdf_noaa_with_doi[cols]

print(f"Found {len(gdf_noaa_with_doi)} NOAA RFC stations with DOI region info")


# Sort by REG_NAME
df_final = gdf_noaa_with_doi.sort_values(
    ["in_wwdh_backend_api", "doi_region_num"]
).reset_index(drop=True)

# cast the region number to an integer so it is consistent across collections for sorting
df_final["doi_region_num"] = pd.to_numeric(
    df_final["doi_region_num"], errors="coerce"
).astype("Int64")  # type: ignore

df_final["doi_region_name"] = df_final["doi_region_name"].fillna(
    "NOT_IN_CONTINENTAL_US"
)
df_final["in_wwdh_backend_api"] = df_final["in_wwdh_backend_api"].fillna(False)

output_path = (
    Path(__file__).parent.parent.parent
    / "packages"
    / "noaa_rfc"
    / "src"
    / "noaa_rfc"
    / "noaa_rfc_stations_by_region.csv"
)

# regions_in_noaa_map = [9, 10, 8, 7, 5]

df_final.to_csv(output_path, index=False)
print(
    "Saved full NOAA RFC stations table by DOI region to {}".format(
        output_path.absolute()
    )
)

# %%
