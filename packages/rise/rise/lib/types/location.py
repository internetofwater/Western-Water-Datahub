# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, FiniteFloat


class PageLinks(BaseModel):
    first: str | None = None
    last: str | None = None
    self: str
    next: str | None = None
    prev: str | None = None


class PointCoordinates(BaseModel):
    type: Literal["Point"]
    coordinates: tuple[
        FiniteFloat, FiniteFloat
    ]  # Expecting exactly two values: [longitude, latitude]


class PolygonCoordinates(BaseModel):
    type: Literal["Polygon"]
    coordinates: list[
        list[list[FiniteFloat]]
    ]  # A list of linear rings (each ring is a list of [longitude, latitude] pairs)


class LineStringCoordinates(BaseModel):
    type: Literal["LineString"]
    coordinates: list[list[FiniteFloat]]


class LocationDataAttributes(BaseModel):
    """
    The `attributes:` key within each `data:` key for location/
    Thus, located at the following nesting:
        data:
            attributes:
    """

    model_config = ConfigDict(extra="forbid")

    # We use an alias here to map the _id field to the id field since the _ in the name causes issues
    # https://stackoverflow.com/questions/59562997/how-to-parse-and-read-id-field-from-and-to-a-pydantic-model
    id: int = Field(..., alias="_id")

    locationParentId: int | None
    locationName: str
    locationDescription: str | None
    locationStatusId: int

    # the "type" field tells us whether to validate as a Point or a Polygon
    locationCoordinates: (
        PointCoordinates | PolygonCoordinates | LineStringCoordinates
    ) = Field(discriminator="type")
    elevation: float | None = None
    createDate: str
    updateDate: str | None
    horizontalDatum: dict
    locationGeometry: dict
    timezone: str | None = None
    verticalDatum: dict | None
    locationTags: list[dict]
    relatedLocationIds: list[int] | None
    projectNames: list[str]
    locationTypeName: str
    timezoneName: str | None = None
    timezoneOffset: float | None = None
    locationRegionNames: list[str]
    locationUnifiedRegionNames: list[str]


class LocationData(BaseModel):
    """the `data:` key of the location response"""

    id: str
    type: Literal["Location"]
    attributes: LocationDataAttributes
