# Copyright 2026 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

# %%

##### Define dependencies and load data

import json
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
west_coast_until_roughly_mississippi = "-129.287109,27.293689,-87.099609,50.569283"
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

STATES_URL = "https://reference.geoconnex.us/collections/states/items?f=json"

print("Loading NOAA RFC features...")
gdf_wwdh_noaa = gpd.read_file(WWDH_NOAA_URL)

# if we are hitting an API with the region info already set, we just remove it
# so that we can do the spatial join and regenerate the region info
gdf_wwdh_noaa.drop(columns=["doi_region_name", "doi_region_num"], inplace=True)

print(f"Loaded {len(gdf_wwdh_noaa)} NOAA RFC stations")

print("Downloading DOI regions...")
response = requests.get(DOI_REGIONS_URL, timeout=120)
response.raise_for_status()
data = response.json()

gdf_doi = gpd.GeoDataFrame.from_features(data["features"])
gdf_doi.crs = "EPSG:4326"  # set CRS if not included
print(f"Loaded {len(gdf_doi)} DOI regions")

print("Downloading all NOAA gauges...")
gdf_noaa = gpd.read_file(NOAA_ALL_GAGES_URL)
print(f"Loaded {len(gdf_noaa)} NOAA gauges")

assert len(gdf_noaa) < 10000, (
    "Fetched the max amount of stations from ESRI; this is a sign some got cut off"
)
assert len(gdf_noaa) > 6000, (
    "Less NOAA stations than expected; bbox is likely too small"
)

print("Loading states...")
# states comes from reference.geoconnex.us
states_json = Path(__file__).parent / "states.json"
with states_json.open() as f:
    states_data = json.load(f)

gdf_states = gpd.GeoDataFrame.from_features(states_data["features"])
gdf_states.crs = "EPSG:4326"

# %%

assert (
    gdf_wwdh_noaa.crs == gdf_noaa.crs == gdf_doi.crs == gdf_states.crs == "EPSG:4326"
), "CRS mismatch among datasets"

# any stations in our wwdh noaa dataset are by definition in our API
gdf_wwdh_noaa["in_wwdh_backend_api"] = True

# bring in all noaa stations into the same dataframe
gdf_noaa_both_sources = gdf_noaa.merge(
    gdf_wwdh_noaa,
    how="outer",
    left_on="gaugelid",
    right_on="id",
    suffixes=("", "_wwdh"),
)

# set a new id column; noaa_id which is more understandable
gdf_noaa_both_sources["noaa_id"] = gdf_noaa_both_sources["gaugelid"].combine_first(
    gdf_noaa_both_sources["id"]  # type: ignore
)

# ensure there is a consistent geometry column
gdf_noaa_both_sources["geometry"] = gdf_noaa_both_sources["geometry"].combine_first(
    gdf_noaa_both_sources["geometry_wwdh"]  # type: ignore
)

assert gdf_noaa_both_sources.geometry.is_valid.all(), "Missing or invalid geometry"

# spatial join to get DOI regions into the list of all noaa stations
gdf_noaa_with_doi = gpd.sjoin(
    gdf_noaa_both_sources,  # type: ignore
    gdf_doi,
    how="left",
    predicate="intersects",
)

# rename columns to words that are more readable
gdf_noaa_with_doi.rename(
    columns={
        "REG_NAME": "doi_region_name",
        "REG_NUM": "doi_region_num",
        "espname": "Location_name_in_wwdh_backend",
        "location": "Location_name_in_noaa_esri_service",
    },
    inplace=True,
)

# %%
# spatial join to get state info into the list of all noaa stations
gdf_noaa_with_doi = gdf_noaa_with_doi.drop(columns=["index_right"], errors="ignore")
gdf_noaa_with_doi_and_states = gpd.sjoin(
    gdf_noaa_with_doi,  # type: ignore
    gdf_states,
    how="left",
    predicate="intersects",
)
# make sure the name from the state json is called "State" for clarity
gdf_noaa_with_doi_and_states.rename(
    columns={
        "name": "State",
    },
    inplace=True,
)
# bring in longitude and latitude from the geometry
gdf_noaa_with_doi_and_states["longitude"] = gdf_noaa_with_doi_and_states.geometry.x
gdf_noaa_with_doi_and_states["latitude"] = gdf_noaa_with_doi_and_states.geometry.y

# %%
assert gdf_noaa_both_sources.geometry.is_valid.all()

# subset of columns to use
cols = [
    "noaa_id",
    "doi_region_name",
    "doi_region_num",
    "in_wwdh_backend_api",
    "in_noaa_western_water_supply_forecast_map",
    "Location_name_in_wwdh_backend",
    "Location_name_in_noaa_esri_service",
    "State",
    "longitude",
    "latitude",
]

# create a column for if the station is in the water supply forecast map here: https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_map.html
gdf_noaa_with_doi_and_states["in_noaa_western_water_supply_forecast_map"] = False
gdf_noaa_with_doi_and_states = gdf_noaa_with_doi_and_states[cols]

print(
    f"Found {len(gdf_noaa_with_doi_and_states)} NOAA RFC stations with DOI region info"
)


# Sort the df to make it easier to read for usbr reviewers
df_final = gdf_noaa_with_doi_and_states.sort_values(
    ["in_wwdh_backend_api", "doi_region_num"]
).reset_index(drop=True)  # type: ignore

# cast the region number to an integer so it is consistent
df_final["doi_region_num"] = pd.to_numeric(
    df_final["doi_region_num"], errors="coerce"
).astype("Int64")  # type: ignore

# if the doi_region is not defined that means it isnt in doi and thus not in continental us
df_final["doi_region_name"] = df_final["doi_region_name"].fillna(
    "NOT_IN_CONTINENTAL_US"
)
# if the wwdh backend api is not defined that means it is not in wwdh
df_final["in_wwdh_backend_api"] = df_final["in_wwdh_backend_api"].fillna(False)

# if the noaa esri service is not defined that means it is not in the noaa esri service
# we have to ensure empty strings are converted to nans to make this work
df_final["Location_name_in_noaa_esri_service"] = (
    df_final["Location_name_in_noaa_esri_service"]
    .replace("", pd.NA)
    .fillna("NO_NAME_IN_NOAA_ESRI_SERVICE")
)


output_path = (
    Path(__file__).parent.parent.parent
    / "packages"
    / "noaa_rfc"
    / "src"
    / "noaa_rfc"
    / "noaa_rfc_stations_by_region.csv"
)

##### CHECKS
with open(Path(__file__).parent / "noaa_stations.html", "r") as f:
    noaa_station_list_in_water_supply_map = f.read()

LENGTH_OF_LICENSE_HEADER = 5
# remove the header and if there is a trailing space
noaa_station_list_in_water_supply_map = noaa_station_list_in_water_supply_map.split(
    "\n"
)[LENGTH_OF_LICENSE_HEADER:-1]

assert "<!--" not in noaa_station_list_in_water_supply_map[0]
assert "Yuba" in noaa_station_list_in_water_supply_map[-1]

num_stations_in_map = len(noaa_station_list_in_water_supply_map)
assert num_stations_in_map == 468, num_stations_in_map
num_stations_in_wwdh = len(df_final[df_final["in_wwdh_backend_api"]])


assert num_stations_in_map == num_stations_in_wwdh, (
    f"{num_stations_in_map} != {num_stations_in_wwdh}"
)

for station in noaa_station_list_in_water_supply_map:
    # get just the station name
    station_substr = station.split(">")[1].split("<")[0]
    # remove all special characters or stuff that is formatted differently in the html
    station_substr = (
        station_substr.replace(" ", "")
        .lower()
        .replace("-", "")
        .replace("&amp;", "")
        .replace("&", "")
        .replace("(", "")
        .replace(")", "")
    )
    assert "<" not in station_substr and ">" not in station_substr, (
        "found html tags in station name"
    )
    contains = (
        df_final["Location_name_in_wwdh_backend"]
        .str.replace(" ", "")
        .str.lower()
        .str.replace("-", "")
        .str.replace("&", "")
        .str.replace("(", "")
        .str.replace(")", "")
        .str.contains(station_substr)
    )
    assert contains.any(), (
        f"{station_substr} not in df_final. Does one of the html tags have special characters?"
    )

# after completing our checks, we now know that the list of stations
# in the supply forecast map is the same as the wwdh backend api
df_final["in_noaa_western_water_supply_forecast_map"] = df_final["in_wwdh_backend_api"]
num_stations_in_forecast_map_joined_from_esri = len(
    df_final[df_final["in_noaa_western_water_supply_forecast_map"]]
)
assert (
    num_stations_in_map
    == num_stations_in_forecast_map_joined_from_esri
    == num_stations_in_wwdh
), (
    f"{num_stations_in_map} != {num_stations_in_forecast_map_joined_from_esri} != {num_stations_in_wwdh}"
)

df_final.to_csv(output_path, index=False)
print(
    "Saved full NOAA RFC stations table by DOI region to {}".format(
        output_path.absolute()
    )
)

# %%
