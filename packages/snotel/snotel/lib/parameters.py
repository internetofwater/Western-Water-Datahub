# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from com.cache import RedisCache
from com.helpers import EDRField, await_
from snotel.lib.types import ReferenceDataDTO


class ParametersCollection:
    parameters: ReferenceDataDTO

    def __init__(self) -> None:
        self.cache = RedisCache()
        result = await_(
            self.cache.get_or_fetch(
                "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/reference-data"
            )
        )
        self.parameters = ReferenceDataDTO.model_validate(result)

    def get_fields(self) -> dict[str, EDRField]:
        fields: dict[str, EDRField] = {}
        assert self.parameters.elements
        for parameter in self.parameters.elements:
            assert parameter.code
            assert parameter.name
            description = parameter.description or parameter.physicalElementName
            assert description
            assert parameter.storedUnitCode
            fields[parameter.code] = {
                "title": parameter.name,
                "type": "string",
                "description": description,
                "x-ogc-unit": parameter.storedUnitCode,
            }

        return fields
