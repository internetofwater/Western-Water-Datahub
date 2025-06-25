# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from datetime import timedelta, date
import requests
import pandas as pd

from typing import Iterator

# GDAL VRT template
VRT_TEMPLATE = """<OGRVRTDataSource>
  <OGRVRTLayer name="input">
    <SrcDataSource>{file}</SrcDataSource>
    <GeometryType>wkbPoint</GeometryType>
    <LayerSRS>EPSG:4326</LayerSRS>
    <FID />
    <Field name="SiteShortName" type="String" />
    <Field name="SiteName"      type="String" />
    <Field name="State"         type="String" />
    <Field name="DoiRegion"     type="String" />
    <Field name="DataValue"     type="Real" />
    <Field name="DataUnits"     type="String" />
    <Field name="DataDate"      type="String" />
    <Field name="TeacupUrl"     type="String" />
    <Field name="MaxCapacity"   type="Integer" />
    <GeometryField name="geom" encoding="PointFromColumns" x="Lon" y="Lat" />
  </OGRVRTLayer>
</OGRVRTDataSource>"""

# GDAL Select insert
VRT_ROW = """
SELECT 
  CONCAT(SiteShortName, '.', DataDate) AS id,
  SiteShortName AS monitoring_location_id,
  SiteName AS site_name,
  State AS state,
  DoiRegion AS doi_region,
  DataValue AS value,
  MaxCapacity AS max_capacity,
  DataDate AS data_date,
  'Lake/Reservoir Storage' AS parameter_name,
  3 AS parameter_id,
  DataUnits AS parameter_unit,
  geom
FROM input
"""


def file_exists(url: str) -> bool:
    """Check if the URL exists by requesting only the first byte."""
    try:
        r = requests.get(url, headers={"Range": "bytes=0-0"}, timeout=10)
        return r.status_code in (200, 206)
    except requests.RequestException:
        return False


def fetch_csv(url: str) -> pd.DataFrame:
    """Fetch CSV and insert into pandas dataframe"""
    df = pd.read_csv(url, skipinitialspace=True)

    # Strip excess whitespace because the csv does not
    # conform to https://www.rfc-editor.org/rfc/rfc4180
    df.columns = df.columns.str.strip()
    for col in df.select_dtypes(include="object"):
        df[col] = df[col].str.strip()

    # Format date as ISO8601 compatible
    df["DataDate"] = pd.to_datetime(df["DataDate"], errors="coerce").dt.strftime(
        "%Y-%m-%d"
    )

    # Create URL friendly monitoring location identifier
    df["SiteShortName"] = df["TeacupUrl"].str.extract(r"/([^/]+)\.png$")[0]

    return df


def date_range(start_date: date, end_date: date) -> Iterator[date]:
    """Create an iterator of Datetime objects between period"""
    for n in range(int((end_date - start_date).days) + 1):
        yield start_date + timedelta(n)
