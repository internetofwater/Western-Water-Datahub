from typing import cast
from arcgis2geojson import arcgis2geojson
from com.env import TRACER
from com.helpers import get_oaf_fields_from_pydantic_model
from com.otel import otel_trace
from noaa_qpf.types import FeatureAttributes, ForecastResponse
from pygeoapi.provider.tile import BaseTileProvider
from pygeoapi.models.provider.base import TileMatrixSetEnum
import requests


class NOAAQPFTileProvider(BaseTileProvider):
    """The tile provider for NOAA Quantitative Precipitation Forecast (QPF) data."""

    def __init__(self, provider_def):
        """
        Initialize object

        :param provider_def: provider definition

        :returns: pygeoapi.provider.tile.BaseTileProvider
        """

        # self.name = provider_def["name"]
        # self.data = provider_def["data"]
        # self.format_type = provider_def["format"]["name"]
        # self.mimetype = provider_def["format"]["mimetype"]
        # self.options = provider_def.get("options")
        # self.tile_type = None
        # self.fields = {}

        super().__init__(provider_def)
        self.url = "https://mapservices.weather.noaa.gov/vector/rest/services/precip/wpc_qpf/MapServer/13/query?where=1=1&outFields=*&f=json"

    def get_layer(self) -> str:
        """
        Get provider layer name

        :returns: `string` of layer name
        """
        return self.url

    def get_fields(self) -> dict:
        """
        Get provider field information (names, types)

        :returns: `dict` of fields
        """

        if not self._fields:
            self._fields = get_oaf_fields_from_pydantic_model(FeatureAttributes)
        return self._fields

    def get_tiling_schemes(self) -> dict:
        """
        Get provider field information (names, types)

        :returns: `dict` of tiling schemes
        """

        return [TileMatrixSetEnum.WEBMERCATORQUAD.value]

    @otel_trace()
    def get_tiles_service(
        self, baseurl, servicepath, dirpath=None, tile_type=None
    ) -> dict:
        """
        Gets tile service description

        :param baseurl: base URL of endpoint
        :param servicepath: base path of URL
        :param dirpath: directory basepath (equivalent of URL)
        :param tile_type: tile format type

        :returns: `dict` of file listing or `dict` of GeoJSON item or raw file
        """

        return {
            "links": [
                {
                    "type": "application/json",
                    "rel": "self",
                    "title": "This collection as multi vector tilesets",
                    "href": f"{self.url}?f=json",
                },
                {
                    "type": self.mimetype,
                    "rel": "item",
                    "title": "This collection as multi vector tiles",
                    "href": self.url,
                },
                {
                    "type": "application/json",
                    "rel": "describedby",
                    "title": "Collection metadata in TileJSON format",
                    "href": f"{self.url}?f=json",
                },
            ]
        }

    def get_tiles(self, layer, tileset, z, y, x, format_):
        """
        Gets tiles data

        :param layer: tile layer
        :param tileset: tile set
        :param z: z index
        :param y: y index
        :param x: x index
        :param format_: tile format type

        :returns: `binary` of the tile
        """

        with TRACER.start_span("fetch_tiles"):
            response = requests.get(self.url)
            assert response.ok, response.text
            res = response.json()
        with TRACER.start_span("covert_tiles"):
            res = cast(
                dict,
                arcgis2geojson(
                    ForecastResponse.model_construct(res).features[0]["geometry"]
                ),
            )
            return res

    def get_metadata(self):
        """
        Provide data/file metadata

        :returns: `dict` of metadata construct (format
                  determined by provider/standard)
        """

        raise NotImplementedError()
