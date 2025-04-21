# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from usace.lib.locations_collection import LocationCollection
from pygeoapi.provider.base import ProviderNoDataError


def get_upstream_ids_of_select_properties(
    # A list of properties that a user wants to select
    properties_to_select: list[str],
    # A list of locations that contain the properties with their original tsid
    # This is used for joining against in order to map the tsid to the upstream id
    location_collection: LocationCollection,
) -> list:
    """
    Given a list of properties to select
    """
    labelToParams: dict[str, list[str]] = {}

    for location in location_collection.locations:
        params = location.properties.timeseries
        if not params:
            continue

        for param in params:
            if param.label not in properties_to_select:
                continue
            if param.label not in labelToParams:
                labelToParams[param.label] = []
            labelToParams[param.label].append(param.tsid)

    # return all the properties that the user wants to select as one big list
    result = [item for sublist in labelToParams.values() for item in sublist]
    if result == []:
        raise ProviderNoDataError("No data was found for the requested parameters")
    return result
