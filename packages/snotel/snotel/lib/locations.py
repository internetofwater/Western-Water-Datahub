# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from awdb_com.locations import LocationCollection
from awdb_com.types import StationDTO
from com.cache import RedisCache
from com.helpers import (
    EDRFieldsMapping,
    await_,
)
from com.protocols.locations import LocationCollectionProtocolWithEDR
from com.covjson import CoverageCollectionDict
from snotel.lib.covjson_builder import CovjsonBuilder
from typing import Optional, cast

type longitudeAndLatitude = tuple[float, float]


def get_and_remove_huc_from_properties(
    properties: list[tuple[str, str]],
) -> Optional[str]:
    """
    Get the huc from the properties list if it is present and remove it from the list
    We have to remove it from the list because it is a special filter and we don't want to
    double filter on it
    """
    for i, (key, value) in enumerate(properties):
        if key == "huc":
            del properties[i]
            return value
    return None


class SnotelLocationCollection(LocationCollection, LocationCollectionProtocolWithEDR):
    """A wrapper class containing locations and methods to filter them"""

    def __init__(
        self, select_properties: Optional[list[str]] = None, huc: Optional[str] = None
    ):
        self.cache = RedisCache()
        # snotel also proxies usgs so we just want to get SNOTEL stations
        JUST_SNOTEL_STATIONS = "*:*:SNTL"
        url = f"https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?activeOnly=true&stationTriplets={JUST_SNOTEL_STATIONS}"

        # filter by the hydrological unit code. this can container a wildcard. i.e. 12* matches all hucs beginning with 12
        if huc:
            # NOTE this is 'hucs' not 'huc', if you accidentally misspell it snotel won't throw an error and will just ignore the filter
            url += f"&hucs={huc}"

        if select_properties:
            url += f"&elements={','.join(select_properties)}"
        result = await_(self.cache.get_or_fetch_json(url))
        self.locations = [StationDTO.model_validate(res) for res in result]

    def to_covjson(
        self,
        fieldMapper: EDRFieldsMapping,
        datetime_: Optional[str],
        select_properties: Optional[list[str]],
    ) -> CoverageCollectionDict:
        stationTriples: list[str] = [
            location.stationTriplet
            for location in self.locations
            if location.stationTriplet
        ]

        tripleToGeometry: dict[str, longitudeAndLatitude] = {}
        for location in self.locations:
            if location.stationTriplet and location.longitude and location.latitude:
                assert location.longitude and location.latitude
                tripleToGeometry[location.stationTriplet] = (
                    location.longitude,
                    location.latitude,
                )

        # We cast the return value here because we know it will be a CoverageCollectionDict
        covjson_result = CovjsonBuilder(
            stationTriples, tripleToGeometry, fieldMapper, datetime_, select_properties
        ).render()

        return cast(
            CoverageCollectionDict,
            covjson_result,
        )
