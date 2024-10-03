import asyncio
import os
import json
import logging
import math
import shelve
from typing import ClassVar, Literal, Optional, Union
from typing_extensions import assert_never
from pygeoapi.provider.base import ProviderConnectionError, ProviderNoDataError
from rise.rise_api_types import CacheInterface, JsonPayload, Url
import aiohttp
from rise.rise_edr_share import merge_pages
import redis
from aiohttp import client_exceptions
from datetime import timedelta

HEADERS = {"accept": "application/vnd.api+json"}

LOGGER = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")


async def fetch_url(url: str) -> dict:
    async with aiohttp.ClientSession(headers=HEADERS) as session:
        async with session.get(url, headers=HEADERS) as response:
            try:
                return await response.json()
            except client_exceptions.ContentTypeError as e:
                LOGGER.error(f"{e}: Text: {await response.text()}, URL: {url}")
                raise e


class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class ShelveCache(CacheInterface):
    db: ClassVar[str] = "tests/data/risedb"

    def set(self, url: str, json_data: dict, _ttl: Optional[timedelta] = None):
        with shelve.open(ShelveCache.db, "w") as db:
            db[url] = json_data

    def reset(self):
        with shelve.open(ShelveCache.db, "w") as db:
            for key in db:
                del db[key]

    def clear(self, url: str):
        with shelve.open(ShelveCache.db, "w") as db:
            if url not in db:
                return

            del db[url]

    def contains(self, url: str) -> bool:
        with shelve.open(ShelveCache.db) as db:
            return url in db

    def get(self, url: str):
        with shelve.open(ShelveCache.db) as db:
            return db[url]


class RedisCache(CacheInterface):
    def __init__(self, ttl: timedelta = timedelta(hours=24)):
        self.db = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=False)
        self.ttl = ttl

    def set(self, url: str, json_data: dict, _ttl: Optional[timedelta] = None):
        # Serialize the data before storing it in Redis
        self.db.set(url, json.dumps(json_data))
        ttl = min(_ttl, self.ttl) if _ttl else self.ttl
        self.db.expire(url, time=ttl)

    def reset(self):
        # Delete all keys in the current Redis database
        self.db.flushdb()

    def clear(self, url: str):
        # Delete the specified key from Redis
        self.db.delete(url)

    def contains(self, url: str) -> bool:
        # Check if the key exists in Redis
        return self.db.exists(url) == 1

    def get(self, url: str):
        # Deserialize the data after retrieving it from Redis
        data = self.db.get(url)
        if data is None:
            raise KeyError(f"{url} not found in cache")
        return json.loads(data)  # type: ignore


class RISECache(CacheInterface):
    """
    Generic query class.

    All methods are static or classmethods since we want to enforce
    a singleton pattern. We do not want the client
    making instances of the class
    """

    implementation: Union[ShelveCache, RedisCache]

    def __init__(self, implementation: Literal["shelve", "redis"] = "shelve"):
        match implementation:
            case "shelve":
                self.cache_impl = ShelveCache()
            case "redis":
                self.cache_impl = RedisCache()
            case _:
                assert_never(implementation)

    def set(self, url: str, json_data: dict, _ttl: Optional[timedelta] = None):
        return self.cache_impl.set(url, json_data, _ttl)

    def clear(self, url: str):
        return self.cache_impl.clear(url)

    def reset(self):
        return self.cache_impl.reset()

    def get(self, url: str) -> dict:
        return self.cache_impl.get(url)

    async def get_or_fetch(self, url, force_fetch=False):
        """Send a get request or grab it locally if it already exists in the cache"""

        if not self.contains(url) or force_fetch:
            res = await fetch_url(url)
            self.set(url, res)
            return res

        else:
            return self.get(url)

    def contains(self, url: str) -> bool:
        return self.cache_impl.contains(url)

    def get_or_fetch_all_pages(
        self, url: str, force_fetch=False
    ) -> dict[Url, JsonPayload]:
        # max number of items you can query in RISE
        MAX_ITEMS_PER_PAGE = 100

        # Get the first response that contains the list of pages
        response = asyncio.run(self.get_or_fetch(url))

        NOT_PAGINATED = "meta" not in response
        if NOT_PAGINATED:
            return {url: response}

        total_items = response["meta"]["totalItems"]

        pages_to_complete = math.ceil(total_items / MAX_ITEMS_PER_PAGE)

        # Construct all the urls for the pages
        #  that we will then fetch in parallel
        # to get all the data for the endpoint
        urls = [
            f"{url}?page={page}&itemsPerPage={MAX_ITEMS_PER_PAGE}"
            for page in range(1, int(pages_to_complete) + 1)
        ]

        pages = asyncio.run(self.get_or_fetch_group(urls, force_fetch=force_fetch))

        return pages

    def get_or_fetch_parameters(self, force_fetch=False) -> dict[str, dict]:
        fields = {}

        pages = self.get_or_fetch_all_pages(
            "https://data.usbr.gov/rise/api/parameter",
            force_fetch=force_fetch,
        )
        res = merge_pages(pages)
        for k, v in res.items():
            if k is None or v is None:
                raise ProviderConnectionError("Error fetching parameters")

        # get the value of a dict with one value without
        # needed to know the key name. This is just the
        # merged json payload
        res: dict = next(iter(res.values()))
        if res is None:
            raise ProviderNoDataError

        for item in res["data"]:
            param = item["attributes"]
            # TODO check if this should be a string or a number
            fields[str(param["_id"])] = {
                "type": param["parameterUnit"],
                "title": param["parameterName"],
                "description": param["parameterDescription"],
                "x-ogc-unit": param["parameterUnit"],
            }

        return fields

    async def get_or_fetch_group(self, urls: list[str], force_fetch=False):
        """Send a get request to all urls or grab it locally if it already exists in the cache"""

        urls_not_in_cache = [
            url for url in urls if not self.contains(url) or force_fetch
        ]
        urls_in_cache = [url for url in urls if self.contains(url) and not force_fetch]

        remote_fetch = self.fetch_and_set_url_group(urls_not_in_cache)

        local_fetch: dict[Url, JsonPayload] = {
            url: self.get(url) for url in urls_in_cache
        }

        local_fetch.update(await remote_fetch)

        return local_fetch

    async def fetch_and_set_url_group(
        self,
        urls: list[str],
    ):
        tasks = [asyncio.create_task(fetch_url(url)) for url in urls]

        results = {url: {} for url in urls}

        for coroutine, url in zip(asyncio.as_completed(tasks), urls):
            result = await coroutine
            results[url] = result
            self.set(url, result)

        return results
