# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///

# this is a script for genering the static data dump of all USACE dams

import os
import aiohttp
import aiohttp.client_exceptions
import requests
from rise.lib.cache import RISECache
import asyncio
import json

"""
Script to generate a static data dump of all the metadata for the 
USACE dams. This does not include all the dams
in the NID since that would be over 90k; this script only generates
the dams for the dams in our API mappings
"""


async def main() -> None:
    url_for_our_usace_mapping = (
        "https://water.sec.usace.army.mil/cda/reporting/providers/projects?fmt=geojson"
    )
    response = requests.get(url_for_our_usace_mapping)
    response.raise_for_status()
    data = response.json()

    # Use set for unique NIDIDs
    nidids = set()

    for feature in data:  # Directly iterate over the list
        nidid = feature["properties"]["aliases"].get("NIDID")
        if nidid:
            if nidid in nidids:
                raise Exception(f"Duplicate NIDID: {nidid}")

            nidids.add(nidid)

    allMetadata = {}
    cache = RISECache()
    for i, nidid in enumerate(nidids):
        metadataUrl = f"https://nid.sec.usace.army.mil/api/dams/{nidid}/inventory"
        print(f"Fetching {metadataUrl}, {i + 1}/{len(nidids)}")
        try:
            metadataResponse = await cache.get_or_fetch_json(
                metadataUrl, force_fetch=False
            )
        except aiohttp.client_exceptions.ClientResponseError as e:
            print(f"Failed to fetch {metadataUrl}: {e}")
            continue
        allMetadata[nidid] = metadataResponse

    current_dir = os.path.dirname(os.path.abspath(__file__))
    output = os.path.join(current_dir, "usace", "usace_metadata.json")
    with open(output, "w") as f:
        json.dump(allMetadata, f, indent=2)

    # assert it can be read in correctly
    with open(output, "r") as f:
        json.load(f)


if __name__ == "__main__":
    asyncio.run(main())
