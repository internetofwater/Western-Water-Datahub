# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from datetime import timedelta, date
import logging
from osgeo import ogr, gdal
import requests
from typing import Iterator

from teacup.env import POSTGRES_URL
from teacup.mappings import LOCATION_IDS, DOI_REGIONS, STATE_MAPPING


gdal.UseExceptions()

LOGGER = logging.getLogger(__name__)


def setup_table_schema():
    # Open the PostgreSQL datasource
    pg_driver = ogr.GetDriverByName("PostgreSQL")
    pg_ds = pg_driver.Open(POSTGRES_URL, 1)  # 1 for update mode
    if pg_ds is None:
        LOGGER.error("Could not open PostgreSQL database")

    create_locations_table(pg_ds)
    create_parameters_table(pg_ds)
    create_results_table(pg_ds)

    return pg_ds


def create_locations_table(pg_ds):
    # Create the target layer.
    pg_layer = pg_ds.CreateLayer(
        "teacup_locations",
        geom_type=ogr.wkbPoint,
        options=["OVERWRITE=YES", "LAUNDER=NO"],
    )
    # Mark 'id' as the layer FID so it becomes the Postgres primary key
    try:
        pg_layer.SetFIDColumn("id")
    except AttributeError:
        # SetFIDColumn may not be available on older GDAL/OGR Python bindings
        pass
    pg_layer.CreateField(ogr.FieldDefn("id", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("name", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("map_label", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("popup_label", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("source_uri", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("huc6", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("huc12", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("state", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("reg_name", ogr.OFTString))
    pg_layer.CreateField(ogr.FieldDefn("reg_num", ogr.OFTInteger))
    pg_layer.CreateField(ogr.FieldDefn("total_capacity", ogr.OFTReal))
    pg_layer.CreateField(ogr.FieldDefn("active_capacity", ogr.OFTReal))
    pg_ds.ExecuteSQL("""
        ALTER TABLE teacup_locations ADD CONSTRAINT locations_id_unique UNIQUE (id);
        ALTER TABLE teacup_locations DROP CONSTRAINT teacup_locations_pkey;
        ALTER TABLE teacup_locations ADD PRIMARY KEY (id)
    """)


def create_parameters_table(pg_ds):
    # Create the Parameter Table.
    pg_ds.ExecuteSQL("""
        DROP TABLE IF EXISTS public.teacup_parameters CASCADE;

        CREATE TABLE public.teacup_parameters (
            parameter_id character(3) PRIMARY KEY,
            parameter_name character varying,
            parameter_unit character varying
        );

        ALTER TABLE ONLY public.teacup_parameters
            ADD CONSTRAINT teacup_parameters_parameter_id_key UNIQUE (parameter_id);
    """)

    # Insert parameters
    pg_ds.ExecuteSQL("""
        INSERT INTO public.teacup_parameters (parameter_name, parameter_id, parameter_unit) VALUES
        ('Lake/Reservoir Storage', 'raw', 'acre-feet'),
        ('Average Lake/Reservoir Storage', 'avg', 'acre-feet'),
        ('10th Percentile Lake/Reservoir Storage', 'p10', 'acre-feet'),
        ('90th Percentile Lake/Reservoir Storage', 'p90', 'acre-feet');
    """)


def create_results_table(pg_ds):
    # Create the Result Table.
    pg_ds.ExecuteSQL("""
        DROP TABLE IF EXISTS public.teacup CASCADE;

        CREATE TABLE public.teacup (
            id character varying unique,
            value double precision,
            data_date date,
            parameter_id character(3),
            monitoring_location_id character(25)
        );
                     
        CREATE INDEX teacup_covjson_param_idx 
            ON public.teacup USING btree (monitoring_location_id, parameter_id, data_date DESC) INCLUDE (value);
                     
        ALTER TABLE ONLY public.teacup
            ADD CONSTRAINT teacup_monitoring_location_id_fkey FOREIGN KEY (monitoring_location_id) REFERENCES public.teacup_locations(id);
                     
        ALTER TABLE ONLY public.teacup
            ADD CONSTRAINT teacup_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.teacup_parameters(parameter_id);
    """)


def run_location_load():
    # Open the CSV datasource
    csv_driver = ogr.GetDriverByName("GeoJSON")
    csv_ds = csv_driver.Open(
        "/vsicurl/https://raw.githubusercontent.com/cgs-earth/teacup-generator/refs/heads/main/R-workflow/config/locations.geojson",
        0,
    )
    if csv_ds is None:
        LOGGER.warning("Could not open GeoJSON")
        return

    # Get the source layer.
    layer = csv_ds.GetLayer()
    layer_def = layer.GetLayerDefn()

    pg_driver = ogr.GetDriverByName("PostgreSQL")
    pg_ds = pg_driver.Open(POSTGRES_URL, 1)  # 1 for update mode
    if pg_ds is None:
        LOGGER.error("Could not open PostgreSQL database")

    pg_layer = pg_ds.GetLayerByName("teacup_locations")

    mapping = {}
    # Process source 'layer'
    for f in layer:
        # Represent at SQL column names
        row = {
            layer_def.GetFieldDefn(i)
            .GetName()
            .strip()
            .lower()
            .replace(" ", "_")
            .replace("-", "_"): f.GetField(i)
            for i in range(layer_def.GetFieldCount())
        }

        # Handle source URL
        source = row["source_for_storage_data"]
        source_name = row["source_name"]
        pref_name = row["preferred_label_for_map_and_table"]
        row["source_uri"] = get_source_url(source_name, source, pref_name)

        # Clean Total Capacity (cast to float)
        row["total_capacity"] = float(
            row["total_capacity"].replace(",", "").replace("--", "NaN")
        )

        # Shorten Column Names
        row["map_label"] = row.pop("preferred_label_for_map_and_table")
        row["popup_label"] = row.pop("preferred_label_for_popup_and_modal")

        # Handle uris
        row["huc6"] = "https://geoconnex.us/ref/hu06/" + row["huc6"]
        row["huc12"] = get_hu12(row)
        row["state"] = STATE_MAPPING[row["state"]]
        row.update(DOI_REGIONS[row["doiregion"]])

        row["id"] = row["name"].replace(" ", "").replace(" ", ".")
        mapping[row["popup_label"]] = row["id"]

        feature = ogr.Feature(pg_layer.GetLayerDefn())
        feature.SetField("id", row["id"])
        feature.SetField("name", row["name"])
        feature.SetField("map_label", row["map_label"])
        feature.SetField("popup_label", row["popup_label"])
        feature.SetField("source_uri", row["source_uri"])
        feature.SetField("huc6", row["huc6"])
        feature.SetField("huc12", row["huc12"])
        feature.SetField("state", row["state"])
        feature.SetField("reg_name", row["reg_name"])
        feature.SetField("reg_num", row["reg_num"])
        feature.SetField("total_capacity", row["total_capacity"])
        feature.SetField("active_capacity", row["active_capacity"])
        # Prefer geometry from the source GeoJSON feature (saved as src_feature).
        # Falls back to lon/lat if geometry is missing.
        lon = float(row["longitude"])
        lat = float(row["latitude"])
        geom = ogr.Geometry(ogr.wkbPoint)
        geom.AddPoint(lon, lat)
        feature.SetGeometry(geom)

        try:
            pg_layer.CreateFeature(feature)
        except RuntimeError as e:
            LOGGER.error(e)
        finally:
            feature = None  # Release feature


def get_source_url(
    source_name: str, source_for_storage_data: str, pref_name: str
) -> str:
    if source_name == "USACE":
        return source_for_storage_data.split()[-1]
    elif source_name.startswith("USGS"):
        station_id = source_for_storage_data[-13:]
        return "https://waterdata.usgs.gov/monitoring-location/" + station_id
    elif source_name == "RISE":
        return "https://data.usbr.gov/rise/api/locations/" + str(
            LOCATION_IDS[pref_name]
        )
    elif source_name in ("USACE", "CDEC"):
        return source_for_storage_data
    else:
        LOGGER.warning(
            f"Unrecognized source_for_storage_data for {pref_name}: {source_name}"
        )
        return ""


def get_hu12(row) -> str:

    params = {
        "f": "json",
        "skipGeometry": True,
        "bbox": f"{row['longitude']},{row['latitude']},{row['longitude']},{row['latitude']}",
    }
    response = requests.get(
        "https://reference.geoconnex.us/collections/hu12/items", params=params
    )

    if response.status_code == 200:
        data = response.json()
        features = data["features"]
        if features:
            return features[0]["properties"]["uri"]

    return ""


def file_exists(url: str) -> bool:
    """Check if the URL exists by requesting only the first byte."""
    try:
        r = requests.get(url + "/", headers={"Range": "bytes=0-0"}, timeout=10)
        return r.status_code in (200, 206)
    except requests.RequestException:
        return False


def date_range(start_date: date, end_date: date) -> Iterator[date]:
    """Create an iterator of Datetime objects between period"""
    for n in range(int((end_date - start_date).days) + 1):
        yield start_date + timedelta(n)


def create_feature(pg_layer, row, parameter: str):
    """Create postgres feature from a CSV row"""

    match parameter:
        case "p10":
            p_val = "DataDateP10"
        case "avg":
            p_val = "DataDateAvg"
        case "p90":
            p_val = "DataDateP90"
        case _:
            p_val = "DataValue"

    feature = ogr.Feature(pg_layer.GetLayerDefn())
    id = f"{row['SiteId']}.{row['DataDate']}.{parameter}"
    feature.SetField("id", id)
    feature.SetField("value", row[p_val])
    feature.SetField("data_date", row["DataDate"])
    feature.SetField("monitoring_location_id", row["SiteId"])
    feature.SetField("parameter_id", parameter)

    try:
        pg_layer.CreateFeature(feature)
    except RuntimeError as e:
        LOGGER.error(e)
    finally:
        feature = None  # Release feature
