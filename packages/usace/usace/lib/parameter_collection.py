# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from com.cache import RedisCache
from com.helpers import EDRFieldsMapping, await_
import usace.lib.types as types
import msgspec


class ParameterCollection:
    parameters: list[types.Parameter]

    def __init__(self) -> None:
        url = "https://cwms-data.usace.army.mil/cwms-data/parameters"
        res = await_(
            RedisCache().get_or_fetch_response_text(
                url, headers={"accept": "application/json;version=2"}
            )
        )
        self.parameters = msgspec.json.decode(res, type=list[types.Parameter])

    def get_fields(self) -> EDRFieldsMapping:
        fields: EDRFieldsMapping = {}
        assert self.parameters
        for parameter in self.parameters:
            assert parameter.name and parameter.db_unit_id
            fields[parameter.name] = {
                "title": parameter.sub_parameter_description or parameter.name,
                "type": "string",
                "description": f"{parameter.unit_description}",
                "x-ogc-unit": parameter.db_unit_id,
            }

        return fields
