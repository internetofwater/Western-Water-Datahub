# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import asyncio
import datetime
from typing import Coroutine, Optional, Tuple

import shapely
from pygeoapi.provider.base import ProviderQueryError
from rise.lib.types.helpers import ZType
from rise.env import rise_event_loop

from typing import Dict


def await_(coro: Coroutine):
    """
    await an asyncio coroutine, ensuring it works even if an event loop is already running.
    """
    return asyncio.run_coroutine_threadsafe(coro, loop=rise_event_loop).result()


def merge_pages(pages: Dict[str, dict]) -> dict:
    """Given multiple different pages of data, merge them together."""
    assert pages

    combined_data = {}

    for content in pages.values():
        for key in ("data", "included"):
            if key in content:
                combined_data.setdefault(key, []).extend(content[key])

    return combined_data


def no_duplicates_in_pages(pages: dict):
    found = {}
    for url in pages:
        for data in pages[url]["data"]:
            id = data["attributes"]["_id"]
            assert id not in found, (
                f"{id} witn name {data['attributes']['locationName']} was found in both {url} and {found[id]}. You may need to clear the cache for {found[id]}"
            )
            found[id] = url


def flatten_values(input: dict[str, list]) -> list:
    """Given a dict of lists, flatten them into a single list"""
    output = []
    for _, v in input.items():
        for i in v:
            output.append(i)

    return output


def parse_z(z: str) -> Optional[Tuple[ZType, list[int]]]:
    """Parse a z value in the format required by the OGC EDR spec"""
    if not z:
        return None
    if z.startswith("R") and len(z.split("/")) == 3:
        z = z.replace("R", "")
        interval = z.split("/")
        if len(interval) != 3:
            raise ProviderQueryError(f"Invalid z interval: {z}")
        steps = int(interval[0])
        start = int(interval[1])
        step_len = int(interval[2])
        return (
            ZType.ENUMERATED_LIST,
            list(range(start, start + (steps * step_len), step_len)),
        )
    elif "/" in z and len(z.split("/")) == 2:
        start = int(z.split("/")[0])
        stop = int(z.split("/")[1])

        return (ZType.RANGE, [start, stop])
    elif "," in z:
        try:
            return (ZType.ENUMERATED_LIST, list(map(int, z.split(","))))
        # if we can't convert to int, it's invalid
        except ValueError:
            raise ProviderQueryError(f"Invalid z value: {z}")
    else:
        try:
            return (ZType.SINGLE, [int(z)])
        except ValueError:
            raise ProviderQueryError(f"Invalid z value: {z}")


def parse_date(datetime_: str) -> list[datetime.datetime]:
    """Parses an EDR formatted datetime string into a datetime object"""
    dateRange = datetime_.split("/")

    if len(dateRange) == 2:  # noqa F841
        start, end = dateRange

        # python does not accept Z at the end of the datetime even though that is a valid ISO 8601 datetime
        if start.endswith("Z"):
            start = start.replace("Z", "+00:00")

        if end.endswith("Z"):
            end = end.replace("Z", "+00:00")

        start = (
            datetime.datetime.min
            if start == ".."
            else datetime.datetime.fromisoformat(start)
        )
        end = (
            datetime.datetime.max
            if end == ".."
            else datetime.datetime.fromisoformat(end)
        )
        start, end = (
            start.replace(tzinfo=datetime.timezone.utc),
            end.replace(tzinfo=datetime.timezone.utc),
        )

        if start > end:
            raise ProviderQueryError(
                "Start date must be before end date but got {} and {}".format(
                    start, end
                )
            )

        return [start, end]
    else:
        return [datetime.datetime.fromisoformat(datetime_)]


def parse_bbox(
    bbox: Optional[list],
) -> Tuple[Optional[shapely.geometry.base.BaseGeometry], Optional[str]]:
    minz, maxz = None, None

    if not bbox:
        return None, None
    else:
        bbox = list(map(float, bbox))

    if len(bbox) == 4:
        minx, miny, maxx, maxy = bbox
        return shapely.geometry.box(minx, miny, maxx, maxy), None
    elif len(bbox) == 6:
        minx, miny, minz, maxx, maxy, maxz = bbox
        return shapely.geometry.box(minx, miny, maxx, maxy), (f"{minz}/{maxz}")
    else:
        raise ProviderQueryError(
            f"Invalid bbox; Expected 4 or 6 points but {len(bbox)} values"
        )


def get_only_key(mapper: dict):
    value = list(mapper.values())[0]
    return value


def get_trailing_id(url: str) -> str:
    return url.split("/")[-1]


def getResultUrlFromCatalogUrl(url: str, datetime_: Optional[str]) -> str:
    """Create the result url given a catalog item url and the datetime we want to filter by"""
    base = f"https://data.usbr.gov/rise/api/result?itemId={get_trailing_id(url)}"

    if datetime_:
        parsed_date = datetime_.split("/")
        if len(parsed_date) == 2:
            after_date = parsed_date[0]
            before_date = parsed_date[1]
        else:
            # In RISE we are allowed to filter broadly by using the same start and end date
            # i.e. 2017-01-01 as the start and end would match on 2017-01-01:00:00:00 - 2017-01-01:23:59:59
            after_date = parsed_date[0]
            before_date = parsed_date[0]

        base += f"&dateTime%5Bbefore%5D={before_date}"
        base += f"&dateTime%5Bafter%5D={after_date}"

    return base
