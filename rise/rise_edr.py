import logging
from typing import Any, ClassVar, Optional
import requests

from pygeoapi.provider.base import (
    ProviderNoDataError,
    ProviderQueryError,
)
from pygeoapi.provider.base_edr import BaseEDRProvider
from rise.rise_edr_helpers import (
    RISECache,
    get_only_key,
    LocationHelper,
)
from rise.rise_edr_share import merge_pages


LOGGER = logging.getLogger(__name__)


class RiseEDRProvider(BaseEDRProvider):
    """Base EDR Provider"""

    LOCATION_API: ClassVar[str] = "https://data.usbr.gov/rise/api/location"
    BASE_API: ClassVar[str] = "https://data.usbr.gov"
    cache: RISECache

    def __init__(self, provider_def: dict[str, Any]):
        """
        Initialize object

        :param provider_def: provider definition

        :returns: rise.base_edr.RiseEDRProvider
        """
        try:
            self.cache = RISECache(provider_def["cache"])
        except KeyError:
            LOGGER.error(
                "You must specify a cache implementation in the config.yml for RISE"
            )
            raise

        provider_def = {
            "name": "Rise EDR",
            "type": "feature",
            "data": "remote",
        }

        super().__init__(provider_def)

        self.instances = []

    @BaseEDRProvider.register()
    def locations(
        self,
        location_id: Optional[int] = None,
        datetime_: Optional[str] = None,
        select_properties: Optional[str] = None,
        crs: Optional[str] = None,
        format_: Optional[str] = None,
        **kwargs,
    ):
        """
        Extract data from location
        """

        if location_id:
            # Instead of merging all location pages, just
            # fetch the location associated with the ID
            response = requests.get(
                RiseEDRProvider.LOCATION_API,
                headers={"accept": "application/vnd.api+json"},
                params={"id": location_id},
            )

            if not response.ok:
                raise ProviderQueryError(response.text)
            else:
                response = response.json()

        else:
            response = self.cache.get_or_fetch_all_pages(RiseEDRProvider.LOCATION_API)
            response = merge_pages(response)
            response = get_only_key(response)
            if response is None:
                raise ProviderNoDataError

        if datetime_:
            response = LocationHelper.filter_by_date(response, datetime_)

        # location 1 has parameter 1721
        if select_properties:
            response = LocationHelper.filter_by_properties(
                response, select_properties, self.cache
            )

        query_args = [crs, datetime_, location_id]

        if not any(query_args) or format_ == "geojson":
            return LocationHelper.to_geojson(
                response, single_feature=True if location_id else False
            )
        else:
            return LocationHelper.to_covjson(response, self.cache)

    def get_fields(self):
        if self._fields:
            return self._fields

        self._fields = self.cache.get_or_fetch_parameters()

        return self._fields

    @BaseEDRProvider.register()
    def cube(
        self,
        bbox: list,
        datetime_: Optional[str] = None,
        select_properties: Optional[list] = None,
        z: Optional[str] = None,
        format_: Optional[str] = None,
        **kwargs,
    ):
        """
        Returns a data cube defined by bbox and z parameters

        :param bbox: `list` of minx,miny,maxx,maxy coordinate values as `float`
        :param datetime_: temporal (datestamp or extent)
        :param z: vertical level(s)
        :param format_: data format of output

        """
        response = self.cache.get_or_fetch_all_pages(RiseEDRProvider.LOCATION_API)
        response = merge_pages(response)
        response = get_only_key(response)
        if response is None:
            raise ProviderNoDataError

        if select_properties:
            response = LocationHelper.filter_by_properties(
                response, select_properties, self.cache
            )

        if datetime_:
            response = LocationHelper.filter_by_date(response, datetime_)

        response = LocationHelper.filter_by_bbox(response, bbox, z)

        # match format_:
        #     case "json" | "GeoJSON" | _:
        return LocationHelper.to_geojson(response)

    @BaseEDRProvider.register()
    def area(
        self,
        wkt: str,
        select_properties: list[str] = [],
        datetime_: Optional[str] = None,
        z: Optional[str] = None,
        format_: Optional[str] = None,
        **kwargs,
    ):
        """
        Extract and return coverage data from a specified area.

        :param wkt: Well-Known Text (WKT) representation of the
                    geometry for the area.
        :param select_properties: List of properties to include
                                  in the response.
        :param datetime_: Temporal filter for observations.

        :returns: A CovJSON CoverageCollection.
        """

        response = self.cache.get_or_fetch_all_pages(RiseEDRProvider.LOCATION_API)
        response = merge_pages(response)
        response = get_only_key(response)
        if response is None:
            raise ProviderNoDataError

        if select_properties:
            response = LocationHelper.filter_by_properties(
                response, select_properties, self.cache
            )

        if datetime_:
            response = LocationHelper.filter_by_date(response, datetime_)

        response = LocationHelper.filter_by_wkt(response, wkt, z)

        # match format_:
        #     case "json" | "GeoJSON" | "" | None:
        return LocationHelper.to_geojson(response)
        # case "covjson":
        #     return LocationHelper.to_covjson(response)

    @BaseEDRProvider.register()
    def items(self, **kwargs):
        """
        Retrieve a collection of items.

        :param kwargs: Additional parameters for the request.
        :returns: A GeoJSON representation of the items.
        """
        # https://github.com/geopython/pygeoapi/issues/1748
        # define this as an OAF provider as well since pygeoapi has a limitation
        pass

    def __repr__(self):
        return "<RiseEDRProvider>"
