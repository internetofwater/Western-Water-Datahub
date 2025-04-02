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

To learn more about custom EDR mappings, visit the [Western Water Datahub Mappings repository](https://github.com/cgs-earth/Western-Water-Datahub-Mappings).

## Getting Started

To run with Docker:

```bash
docker compose up -d
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to help improve the project.

## License

This project is licensed under the MIT. See the `LICENSE` file for details.
