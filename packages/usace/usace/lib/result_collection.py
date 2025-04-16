# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from dataclasses import dataclass
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
