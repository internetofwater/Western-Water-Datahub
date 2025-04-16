from dataclasses import dataclass

type DateAndValue = tuple[str, float]


@dataclass
class ResultCollection:
    key: str
    parameter: str
    unit: str
    unit_long_name: str
    values: list[DateAndValue]
