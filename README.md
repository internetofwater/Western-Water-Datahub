# Western Water Datahub

The Wester Water Datahub (WWDH) is an implementation of the [OGC API](https://ogcapi.ogc.org/) suite of standards, enabling access to water data from various sources through a unified interface. It is designed to enhance data interoperability, accessibility, and discoverability across multiple water data platforms.

This project is a collaboration between the United States Beaureu of Reclamation, the Center for Geospatial Solutions, and Wester States Water Council.

## Source Systems

The interface consolidates access to multiple water data sources, offering a standardized API pattern to retrieve information from different systems. The sources are listed below:

| Data Source | Variables                                                 | OGC API Format | Source URL Link                                                                          |
| ----------- | --------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| USBR/RISE   | Reservoir Storage/Release/Level/Evap (current/historical) | Features, EDR  | [🔗](https://data.usbr.gov/rise-api)                                                     |
| NRCS/SNOTEL | Snow Water Equivalent (station, current/historical)       | Features, EDR  | [🔗](https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html)                     |
| USGS/WMA    | Streamflow (current)                                      | Features, EDR  | [🔗](https://labs.waterdata.usgs.gov/)                                                   |
| AWDB        | Streamflow (forecast)                                     | Features, EDR  | [🔗](https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html)                     |
| USACE       | Reservoir Storage/Release/Level/Evap (forecast)           | Features, EDR  | [🔗](https://water.sec.usace.army.mil/cda/reporting/)                                    |
| NOAA/QPF    | Precipitation (Raster forecast)                           | Features       | [🔗](https://mapservices.weather.noaa.gov/vector/rest/services/precip/wpc_qpf/MapServer) |
| NOAA/RFC    | Streamflow (forecast)                                     | Features       | [🔗](https://www.cbrfc.noaa.gov/wsup/graph/west/map/esp_map.html)                        |
| NOAA/NOHRSC | Snow Water/Depth (forecast)                               | Maps           | [🔗](https://www.nohrsc.noaa.gov/nsa/)                                                   |
| PRISM       | Precipitation (historical)                                | EDR            | [🔗](https://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/prism_v2)          |

To learn more about custom mappings, visit the [Western Water Datahub Mappings directory](./docs/mappings.md).

## Getting Started

In both development and containerized deployments, the server can be accessed at `http://localhost:5005`

### Local Development

- Spin up the redis db using `docker compose up -d`
- To install dependencies run `make deps`
  - We use [`uv`](https://github.com/astral-sh/uv) for dependency management and thus you should have it installed
- To run the server run: `make dev`
- To run tests run: `make test`

### Containerized Deployment

The following command will spin up all infrastructure for a containerized deployment and build both the server and UI as docker images

```bash
docker compose --profile production up
```

(Note: in production we deploy the pygeoapi server as a container on cloud run as defined by the [cloudbuild.yaml](./cloudbuild.yaml) file)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to help improve the project.

## License

This project is licensed under the MIT license. See the [`LICENSE` file](./LICENSE) for details.
