# Western Water Datahub

The Wester Water Datahub (WWDH) is an implementation of the [OGC API - Environmental Data Retrieval (EDR)](https://ogcapi.ogc.org/edr/) standard, enabiling access to water data from various sources through a unified interface. It is designed to enhance data interoperability, accessibility, and discoverability across multiple agricultural water data platforms.

This project is a collaboration between the United States Beaureu of Reclamation, the Center for Geospatial Solutions, and Wester States Water Council.

## Source Systems

The EDR interface consolidates access to multiple water data sources, offering a standardized API pattern to retrieve information from different systems. The supported sources are listed below:

| Data Source | Variables | EDR URL
|-------------|-----------------------------------------------------------|-------------------------------------------------------------|
| USBR/RISE   | Reservoir Storage/Release/Level/Evap (current/historical) | https://api.wwdh.internetofwater.app/collections/rise-edr   |
| NRCS/SNOTEL | Snow Water Equivalent (station, current/historical)       | https://api.wwdh.internetofwater.app/collections/snotel-edr |
| USGS        | Streamflow (current)                                      | https://api.wwdh.internetofwater.app/collections/usgs-sta   |
| PRISM       | Precipitation (historical)                                | https://api.wwdh.internetofwater.app/collections/usgs-prism |

To learn more about custom EDR mappings, visit the [Western Water Datahub Mappings directory](./docs/mappings.md).

## Getting Started

To run with Docker:

```bash
docker compose --profile production up 
```

### Local Development

- To install dependencies run `make deps`
  - We use uv for dependency management and thus you should have it installed
  - You can however also use the `requirements.txt` as well for quick checks as it is kept up to date automatically
- To run the server run: `make dev`
- To run the redis container for caching, run `docker compose up`
- To run tests run: `make test`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to help improve the project.

## License

This project is licensed under the MIT. See the `LICENSE` file for details.
