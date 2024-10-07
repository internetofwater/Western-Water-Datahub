import asyncio
import datetime
from typing import Any, Coroutine, Optional, Tuple

import shapely
from pygeoapi.provider.base import ProviderQueryError
from rise.custom_types import JsonPayload, Url, ZType


def safe_run_async(coro: Coroutine[Any, Any, Any]) -> Any:
    """
    Run an asyncio coroutine, ensuring it works even if an event loop is already running.
    """
    try:
        loop = asyncio.get_running_loop()
        return loop.run_until_complete(coro)
    except RuntimeError:
        # No running event loop
        return asyncio.run(coro)


def merge_pages(pages: dict[Url, JsonPayload]):
    # Initialize variables to hold the URL and combined data
    combined_url = None
    combined_data = None

    for url, content in pages.items():
        if combined_url is None:
            combined_url = url  # Set the URL from the first dictionary
        if combined_data is None:
            combined_data = content
        else:
            data = content.get("data", [])
            if not data:
                continue

            combined_data["data"].extend(data)

    # Create the merged dictionary with the combined URL and data
    merged_dict = {combined_url: combined_data}

    return merged_dict


def flatten_values(input: dict[str, list[str]]) -> list[str]:
    output = []
    for _, v in input.items():
        for i in v:
            output.append(i)

    return output


def parse_z(z: str) -> Optional[Tuple[ZType, list[int]]]:
    """Parse a z value in the format required by the OGC API spec"""
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
