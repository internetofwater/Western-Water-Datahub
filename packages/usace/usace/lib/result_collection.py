# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from dataclasses import dataclass, fields
from datetime import datetime

type DateAndValue = tuple[str, float]


@dataclass
class ResultCollection:
    """
    A dataclass representing the results for a single timeseries
    parameter in USACE. It is a dataclass and not a basemodel
    so we don't need to run pydantic validation on a large amount of
    data every time we fetch new data
    """

    key: str
    parameter: str
    unit: str
    unit_long_name: str
    values: list[DateAndValue]

    @classmethod
    def from_dict(cls, data: dict) -> "ResultCollection":
        """
        Construct from the upstream JSON, ignoring any keys we don't model
        so that new fields added to the USACE API don't break parsing
        """
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in known})

    def get_values_as_separate_lists(self) -> tuple[list[datetime], list[float]]:
        """
        Pivot the data so we can get it into two separate lists that covjson needs
        """
        dates: list[datetime] = []
        values: list[float] = []
        for date, value in self.values:
            dates.append(datetime.fromisoformat(date))
            values.append(value)
        return dates, values
