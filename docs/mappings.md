## Limitations

- This repository uses extensive caching to prevent unnecessary fetch requests for custom mappings.

## OGC API Features Spec Compliance

These tables track the EDR implementation of each mapping in this repo [here](../packages/)

| Provider             | Property Filters/Display | Result Type | BBox | Datetime | Sort By | Skip Geometry | CQL | Transactions | CRS |
| -------------------- | ------------------------ | ----------- | ---- | -------- | ------- | ------------- | --- | ------------ | --- |
| `RISE`               | ✅ / ✅                  | ✅          | ✅   | ✅       | ✅      | ✅            | ❌  | ❌           | ✅  |
| `SNOTEL`             | ✅ / ✅                  | ✅          | ✅   | ✅       | ✅      | ✅            | ❌  | ❌           | ✅  |
| `AWDB Forecasts`     | ✅ / ✅                  | ✅          | ✅   | ✅       | ✅      | ✅            | ❌  | ❌           | ✅  |
| `USACE`              | ❌ / ❌                  | ❌          | ❌   | ❌       | ❌      | ❌            | ❌  | ❌           | ❌  |
| `NOAA RFC Forecasts` | ✅ / ✅                  | ✅          | ❌   | ❌       | ✅      | ✅            | ❌  | ❌           | ✅  |

## OGC EDR Spec Compliance

| Provider       | Position | Radius | Area | Cube | Trajectory | Coordidor | Items |
| -------------- | -------- | ------ | ---- | ---- | ---------- | --------- | ----- |
| RISE           | ❌       | ❌     | ✅   | ✅   | ❌         | ❌        | ✅    |
| SNOTEL         | ❌       | ❌     | ✅   | ✅   | ❌         | ❌        | ✅    |
| AWDB Forecasts | ❌       | ❌     | ✅   | ✅   | ❌         | ❌        | ✅    |
| USACE          | ❌       | ❌     | ❌   | ❌   | ❌         | ❌        | ❌    |

### EDR Query Options

| Provider       | Coords | Parameter-Name | Datetime |
| -------------- | ------ | -------------- | -------- |
| RISE           | ✅     | ✅             | ✅       |
| SNOTEL         | ✅     | ✅             | ✅       |
| AWDB Forecasts | ✅     | ✅             | ✅       |
| USACE          | ❌     | ❌             | ❌       |
