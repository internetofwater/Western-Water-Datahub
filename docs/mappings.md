## Limitations

- This repository uses extensive caching to prevent unnecessary fetch requests to RISE. OGC EDR does not map cleanly onto RISE without this.
  - We set a default TTL. However, whenever we need to repopulate the cache, RISE sometimes denies parallelized requests and throws an error saying the server is down for maintenance, which is not the case.

## OGC API Features Spec Compliance

These tables track the EDR implementation of each mapping in this repo [here](../packages/)

| Provider         | Property Filters/Display | Result Type | BBox | Datetime | Sort By | Skip Geometry | CQL | Transactions | CRS |
| ---------------- | ------------------------ | ----------- | ---- | -------- | ------- | ------------- | --- | ------------ | --- |
| `RISE`           | ✅ / ✅                  | ✅          | ✅   | ✅       | ✅      | ✅            | ❌  | ❌           | ✅  |
| `SNOTEL`         | ✅ / ✅                  | ✅          | ✅   | ✅       | ✅      | ✅            | ❌  | ❌           | ✅  |
| `AWDB Forecasts` | ✅ / ✅                  | ✅          | ✅   | ✅       | ✅      | ✅            | ❌  | ❌           | ✅  |
| `USACE`          | ❌ / ❌                  | ❌          | ❌   | ❌       | ❌      | ❌            | ❌  | ❌           | ❌  |

## OGC EDR Spec Compliance

| Provider       | Position | Radius | Area | Cube | Trajectory | Coordidor | Items |
| -------------- | -------- | ------ | ---- | ---- | ---------- | --------- | ----- |
| RISE           | ❌       | ❌     | ✅   | ✅   | ❌         | ❌        | ✅    |
| SNOTEL         | ❌       | ❌     | ✅   | ✅   | ❌         | ❌        | ✅    |
| AWDB Forecasts | ❌       | ❌     | ✅   | ✅   | ❌         | ❌        | ✅    |
| USACE          | ❌       | ❌     | ❌  | ❌  | ❌         | ❌        | ❌    |

### EDR Query Options

| Provider       | Coords | Parameter-Name | Datetime |
| -------------- | ------ | -------------- | -------- |
| RISE           | ✅     | ✅             | ✅       |
| SNOTEL         | ✅     | ✅             | ✅       |
| AWDB Forecasts | ✅     | ✅             | ✅       |
| USACE          | ❌     | ❌             | ❌       |
