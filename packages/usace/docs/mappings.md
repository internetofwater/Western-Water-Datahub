There appear to be two publicly available USACE APIs for water data:

1. The [Access To Water API](https://water.sec.usace.army.mil/cda/reporting/#/Reporting/get_cda_reporting_providers) 
    - Contains no documentation besides for github repo here https://github.com/USACE/water-api which does not have issues/discussions enabled
    - Seems to be able to be proxied to EDR assuming no rate limit / throughput latency issues (ETL requires a few joins however unfortunately)
        - You can get all locations by fetching all offices using `'https://water.usace.army.mil/cda/reporting/providers'`
        - For each of the ~30 offices you can use it to fetch associated locations using `/cda/reporting/providers/{office}/locations`
        - You can then extract parameter information from each location for using for timeseries fetches
        - For each of the offices you can fetch associated timeseries using `/cda/reporting/providers/{office}/timeseries`
2. The [CWMS API](https://cwms-data.usace.army.mil/cwms-data/swagger-ui.html)
    - Contains documentation and a public github repo with issues enabled
    - However, seems to not be able to be proxied to EDR due to https://github.com/USACE/cwms-data-api/issues/1077
        - No response on this so far
3. (Tangentially related) [Duke USACE Proxy](https://nicholasinstitute.duke.edu/reservoir-data/)
    - Duke Nicholas Institute appears to be using USACE data with a similar access pattern
        - Namely, returning all locations at once and associating each location with its parameters or timeseries
    - However, this has no documentation nor any public github repo; thus it is unclear what endpoint is being used
    - Somehow they have a geojson response for all locations; (perhaps they are doing some sort of ETL?)
        - https://nicholasinstitute.duke.edu/reservoir-data/usace/shapefiles/districts.json