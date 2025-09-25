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


class SnotelLocationCollection(LocationCollection, LocationCollectionProtocolWithEDR):
    """A wrapper class containing locations and methods to filter them"""

    def __init__(
        self,
        select_properties: Optional[list[str]] = None,
        itemId: Optional[str] = None,
    ):
        self.cache = RedisCache()
        # snotel also proxies usgs so we just want to get SNOTEL stations
        # we assume that sntl has a unique id on the triplet so we can specify itemId:*:SNTL
        # which is the same as fetching all snotel and filtering by the item id
        stations_to_fetch = "*:*:SNTL" if not itemId else f"{itemId}:*:SNTL"
        url = f"https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?activeOnly=true&stationTriplets={stations_to_fetch}"

        if itemId:
            url += "&returnStationElements=true"

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
