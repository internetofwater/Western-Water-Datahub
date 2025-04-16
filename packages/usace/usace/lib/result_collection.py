from dataclasses import dataclass

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
