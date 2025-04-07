# Western Water Datahub EDR Mappings

This repository maps the various federal water data APIs like the USBR RISE API to OGC EDR using pygeoapi for ETL. It defaults to redis for the caching implementation.


## Limitations

- This repository uses extensive caching to prevent unnecessary fetch requests to RISE. OGC EDR does not map cleanly onto RISE without this.
  - We set a default TTL. However, whenever we need to repopulate the cache, RISE sometimes denies parallelized requests and throws an error saying the server is down for maintenance, which is not the case.

## OGC API Features Spec Compliance

| Provider | Property Filters/Display | Result Type | BBox | Datetime | Sort By | Skip Geometry | CQL | Transactions | CRS |
| -------- | ------------------------ | ----------- | ---- | -------- | ------- | ------------- | --- | ------------ | --- |
| `RISE`   | ✅ / ✅                  | ✅          | ✅   | ✅       | ✅      | ✅            | ❌  | ❌           | ✅  |
| `SNOTEL` | ✅ / ✅                  | ✅          | ✅   | ✅       | ✅      | ✅            | ❌  | ❌           | ✅  |

## OGC EDR Spec Compliance

| Provider | Position | Radius | Area | Cube | Trajectory | Coordidor | Items |
| -------- | -------- | ------ | ---- | ---- | ---------- | --------- | ----- |
| RISE     | ❌       | ❌     | ✅   | ✅   | ❌         | ❌        | ✅    |
| SNOTEL   | ❌       | ❌     | ✅   | ✅   | ❌         | ❌        | ✅    |

### EDR Query Options

| Provider | Coords | Parameter-Name | Datetime |
| -------- | ------ | -------------- | -------- |
| RISE     | ✅     | ✅             | ✅       |
| SNOTEL   | ✅     | ✅             | ✅       |
