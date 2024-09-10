# Overview

This repository maps RISE to OGC EDR using pygeoapi for ETL. It defaults to redis for the caching implementation. 

EDR has many operations that filter locations and can be said to be location-oriented. 


## Paint Points

The mapping is currently


### Caching

RISE does not provider any invalidation headers or indicators when an item is updated. T

### Pagination

### CoverageJson 
`/locations/{id}` in EDR returns [coveragejson](https://covjson.org/). coveragejson lists both location geometry and its associated timerseries data in the same output. This is challenging since in RISE, locations are decoupled from their parameters and results into different API calls.

#### Example
- `http://localhost:5000/collections/rise-edr/locations/1`
    - fetch `https://data.usbr.gov/rise/api/location/1`
    - for each catalogItem in `https://data.usbr.gov/rise/api/location/1`'s `catalogItem` mapping:
        - fetch the catalogItem
        - join the parameter name back to the location output.
