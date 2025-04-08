from com.helpers import get_oaf_fields_from_pydantic_model
from noaa_qpf.types import FeatureAttributes
from pygeoapi.provider.tile import BaseTileProvider


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

        raise NotImplementedError()

    def get_tiles_service(self, baseurl, servicepath, dirpath, tile_type) -> dict:
        """
        Gets tile service description

        :param baseurl: base URL of endpoint
        :param servicepath: base path of URL
        :param dirpath: directory basepath (equivalent of URL)
        :param tile_type: tile format type

        :returns: `dict` of file listing or `dict` of GeoJSON item or raw file
        """

        raise NotImplementedError()

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

        raise NotImplementedError()

    def get_metadata(self):
        """
        Provide data/file metadata

        :returns: `dict` of metadata construct (format
                  determined by provider/standard)
        """

        raise NotImplementedError()
