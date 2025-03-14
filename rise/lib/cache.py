# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import asyncio
import logging
import math
from urllib.parse import urlparse
import redis.asyncio as redis
from rise.custom_types import JsonPayload, Url
import aiohttp
from aiohttp import client_exceptions
from datetime import timedelta
from rise.env import REDIS_HOST, REDIS_PORT, TRACER
from rise.lib.helpers import merge_pages
import orjson

HEADERS = {"accept": "application/vnd.api+json"}

LOGGER = logging.getLogger(__name__)


async def fetch_url(url: str) -> dict:
    async with aiohttp.ClientSession(headers=HEADERS) as session:
        async with session.get(url, headers=HEADERS) as response:
            try:
                return await response.json()
            except client_exceptions.ContentTypeError as e:
                LOGGER.error(f"{e}: Text: {await response.text()}, URL: {url}")
                raise e


class RISECache:
    """A cache implementation using Redis with ttl support"""

    def __init__(self, ttl: timedelta = timedelta(hours=72)):
        self.db = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=False)
        self.ttl = ttl

    async def set(self, url: str, json_data: dict):
        """Associate a url key with json data in the cache"""
        # Serialize the data before storing it in Redis
        await self.db.set(name=url, value=orjson.dumps(json_data))
        await self.db.expire(name=url, time=self.ttl)

    async def reset(self):
        """Delete all keys in the current Redis database"""
        await self.db.flushdb()

    async def clear(self, url: str):
        """Delete a specific key in the redis db"""
        await self.db.delete(url)

    async def contains(self, url: str) -> bool:
        # Check if the key exists in Redis
        return await self.db.exists(url) == 1

    async def get(self, url: str) -> dict:
        """Get an individual item in the redis db"""
        with TRACER.start_span("cache_retrieval") as s:
            s.set_attribute("cache_retrieval.url", url)

            # Deserialize the data after retrieving it from Redis
            data = await self.db.get(url)
            if data is None:
                raise KeyError(f"{url} not found in cache")
            return orjson.loads(data)

    async def get_or_fetch(self, url, force_fetch=False) -> dict:
        """Send a get request or grab it locally if it already exists in the cache"""

        if not await self.contains(url) or force_fetch:
            res = await fetch_url(url)
            await self.set(url, res)
            return res

        else:
            LOGGER.debug(f"Got {url} from cache")
            return await self.get(url)

    async def get_or_fetch_all_pages(
        self, base_url: str, force_fetch=False
    ) -> dict[Url, JsonPayload]:
        # max number of items you can query in RISE
        MAX_ITEMS_PER_PAGE = 100

        # Get the first response that contains the list of pages
        response = await self.get_or_fetch(base_url)

        NOT_PAGINATED = "meta" not in response
        if NOT_PAGINATED:
            return {base_url: response}

        total_items = response["meta"]["totalItems"]

        pages_to_complete = math.ceil(total_items / MAX_ITEMS_PER_PAGE)

        urls = []

        assert not base_url.endswith("&"), (
            "The base url should not end with an ampersand since it makes it ambiguous to paginate"
        )
        assert not base_url.endswith("?")
        # Construct all the urls for the pages
        #  that we will then fetch in parallel
        # to get all the data for the endpoint
        for page in range(1, int(pages_to_complete) + 1):
            hasQueryParams = bool(urlparse(base_url).query)
            if hasQueryParams:
                urls.append(f"{base_url}&page={page}&itemsPerPage={MAX_ITEMS_PER_PAGE}")
            elif not hasQueryParams:
                urls.append(f"{base_url}?page={page}&itemsPerPage={MAX_ITEMS_PER_PAGE}")

        pages = await self.get_or_fetch_group(urls, force_fetch=force_fetch)
        # found = {}
        # for base_url in pages:
        #     for location in pages[base_url]["data"]:
        #         id = location["attributes"]["_id"]

        #         if id in found:
        #             data = found[id]
        #             raise RuntimeError(
        #                 f"{id} previously had {data} but now has {base_url}"
        #             )

        #         found[id] = {
        #             "url": base_url,
        #             "data": location["attributes"]["_id"],
        #         }

        return pages

    async def get_or_fetch_parameters(self, force_fetch=False) -> dict[str, dict]:
        fields = {}

        pages = await self.get_or_fetch_all_pages(
            "https://data.usbr.gov/rise/api/parameter",
            force_fetch=force_fetch,
        )
        res = merge_pages(pages)

        assert None not in res.values()
        assert None not in res.keys()

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

    async def get_or_fetch_group(
        self, urls: list[str], force_fetch=False
    ) -> dict[str, dict]:
        """Send a GET request to all URLs or grab it locally if it already exists in the cache."""

        urls_not_in_cache, urls_in_cache = [], []
        for url in urls:
            if not await self.contains(url) or force_fetch:
                urls_not_in_cache.append(url)
            else:
                urls_in_cache.append(url)

        assert set(urls_in_cache).isdisjoint(set(urls_not_in_cache))

        # Fetch from remote API
        urls_not_in_cache_coroutine = self._fetch_and_set_url_group(urls_not_in_cache)

        # Fetch from local cache
        with TRACER.start_span("mget"):
            cache_fetch = self.db.mget(urls_in_cache)
            cache_results = await cache_fetch
            urlToResult = {}
            for url, data in zip(urls_in_cache, cache_results):
                urlToResult[url] = orjson.loads(data)

        remote_results = await urls_not_in_cache_coroutine
        urlToResult.update(remote_results)
        return urlToResult

    async def _fetch_and_set_url_group(
        self,
        urls: list[str],
    ):
        tasks = [asyncio.create_task(fetch_url(url)) for url in urls]

        results = {url: {} for url in urls}

        for coroutine, url in zip(asyncio.as_completed(tasks), urls):
            result = await coroutine
            results[url] = result
            await self.set(url, result)

        return results
