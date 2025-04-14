There appear to be two publicly available USACE APIs for water data:

1. The [Access To Water API](https://water.sec.usace.army.mil/cda/reporting/#/Reporting/get_cda_reporting_providers)

   - Contains no documentation besides for github repo here https://github.com/USACE/water-api which does not have issues/discussions enabled
   - Seems to be able to be proxied to EDR assuming no rate limit / throughput latency issues (ETL requires a few joins however unfortunately)

   1. Fetch `https://water.sec.usace.army.mil/cda/reporting/providers/projects?fmt=geojson`
      - geojson format is completely undocumented and just happened to work from guessing
      <!-- ```sh
      curl -X 'GET' \
      'https://water.usace.army.mil/cda/reporting/providers/NAB/locations' \
      -H 'accept: application/json'
      ```-->

      ```
   2. Each of the locations has:
      - an associated office like (office is the same as provider in the API ontology, confusingly)
      ```
      "type":"Feature",
          "properties":{
              "provider":"SAM",
      ```
      - associated timeseries IDs like `RIS.Elev-Forebay.Ave.~1Day.1Day.CBT-REV` that describe the timeseries data and sometimes also the associated units
   3. You can then use both the office and the timeseries id to fetch the data (with the start/end specified) like the following
      ```sh
      curl -X 'GET' \
      'https://water.usace.army.mil/cda/reporting/providers/lrh/timeseries?name=AlumCr-Outflow.Stage.Inst.15Minutes.0.OBS&begin=2023-05-14T15%3A32%3A25.520Z&end=2023-05-15T15%3A32%3A25.520Z' \
      -H 'accept: application/json'
      ```

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
