# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from typing import Literal, Optional
from pydantic import BaseModel, field_validator


class ResultAttributes(BaseModel):
    """These are attributes for a single result call in RISE"""

    itemId: int
    locationId: int
    result: Optional[float]
    parameterId: str

    @field_validator("parameterId", check_fields=True, mode="before")
    @classmethod
    def ensure_str(cls, parameterId):
        """Ensure parameterId is standardized as a str since in covjson it must be a str"""
        if not isinstance(parameterId, str):
            return str(parameterId)
        return parameterId

    dateTime: Optional[str]


class ResultMetadataAttributes(BaseModel):
    """These are metadata attributes for a single result call in RISE;
    i.e. not the directly timeseries result but the metadata that goes with it"""

    resultType: Literal["modelled"] | str | None
    timeStep: Literal["day"] | str | None


class ResultData(BaseModel):
    attributes: ResultAttributes
    metadata: ResultMetadataAttributes | None = None


class ResultResponse(BaseModel):
    data: list[ResultData]

    def get_parameter_id(self):
        """We can assume that there is only one parameter in the response since it would not make sense to combine results from different parameters"""
        param = None
        for d in self.data:
            if not param:
                param = d.attributes.parameterId
            elif param != d.attributes.parameterId:
                raise Exception("Multiple parameters in response")

        return self.data[0].attributes.parameterId

    def get_results(self):
        return [d.attributes.result for d in self.data]

    def get_dates(self):
        return [d.attributes.dateTime for d in self.data]

    def is_modeled(self) -> bool:
        """
        Check if a result represents data which is modeled
        This checks just the first result since it is assumed that
        this class contains all the result responses for a particular
        catalogItem (i.e. something which represents a single study/scenario)
        and thus would not mix both modelled and non-modelled results in the
        same response
        """
        metadata = self.data[0].metadata
        if not metadata:
            return False
        return metadata.resultType == "modelled"
