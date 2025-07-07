# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from datetime import datetime, timezone
from typing import Optional, cast
from awdb_forecasts.lib.forecasts import ForecastResultCollection
from com.helpers import EDRFieldsMapping
from com.protocols.covjson import CovjsonBuilderProtocol
from covjson_pydantic.coverage import Coverage, CoverageCollection
from covjson_pydantic.parameter import Parameter, Parameters
from covjson_pydantic.unit import Unit
from covjson_pydantic.observed_property import ObservedProperty
from covjson_pydantic.domain import Domain, Axes, ValuesAxis, DomainType
from covjson_pydantic.ndarray import NdArrayFloat
from covjson_pydantic.reference_system import (
    ReferenceSystemConnectionObject,
    ReferenceSystem,
)
from awdb_com.types import ForecastDataDTO
from com.covjson import CoverageCollectionDict


class CovjsonBuilder(CovjsonBuilderProtocol):
    """
    A helper class for constructing a coveragejson response for EDR queries
    """

    coverages: list[Coverage]
    parameters: dict[str, Parameter] = {}
    triplesToData: dict[str, list[ForecastDataDTO]]

    def __init__(
        self,
        station_triples: list[str],
        triplesToGeometry: dict[str, tuple[float, float]],
        fieldsMapper: EDRFieldsMapping,
        datetime_: Optional[str] = None,
        select_properties: Optional[list[str]] = None,
    ):
        """Initialize the builder object and fetch the necessary timeseries data"""
        self.triplesToData = ForecastResultCollection().fetch_all_data(
            station_triples, datetime_filter=datetime_
        )
        self.triplesToGeometry = triplesToGeometry
        self.fieldsMapper = fieldsMapper
        self.select_properties = select_properties

    def _generate_coverage_and_parameter(
        self, triple: str, datastream: ForecastDataDTO
    ) -> tuple[Coverage, Parameter]:
        """Given a datastream generate a covjson coverage for the timeseries data"""

        assert datastream.forecastValues
        assert datastream.issueDate
        times = [
            datetime.fromisoformat(datastream.issueDate).replace(tzinfo=timezone.utc)
        ]

        longitude, latitude = self.triplesToGeometry[triple]
        assert datastream.elementCode
        edr_field = self.fieldsMapper[datastream.elementCode]
        parameterName = f"{edr_field['title']} {datastream.forecastPeriod}"

        probabilities = list(datastream.forecastValues.keys())
        values = list(datastream.forecastValues.values())

        cov = Coverage(
            type="Coverage",
            domain=Domain(
                type="Domain",
                domainType=DomainType.vertical_profile,
                axes=Axes(
                    t=ValuesAxis(values=times),
                    z=ValuesAxis(
                        dataType="float", values=[float(prob) for prob in probabilities]
                    ),
                    x=ValuesAxis(values=[longitude]),
                    y=ValuesAxis(values=[latitude]),
                ),
                referencing=[
                    ReferenceSystemConnectionObject(
                        coordinates=["x", "y"],
                        system=ReferenceSystem(
                            type="GeographicCRS",
                            id="http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                        ),
                    ),
                    ReferenceSystemConnectionObject(
                        coordinates=["z"],
                        system=ReferenceSystem(type="VerticalCRS", id="Probability"),
                    ),
                    ReferenceSystemConnectionObject(
                        coordinates=["t"],
                        system=ReferenceSystem(
                            type="TemporalRS",
                            id="http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                            calendar="Gregorian",
                        ),
                    ),
                ],
            ),
            ranges={
                parameterName: NdArrayFloat(
                    shape=[len(probabilities)],
                    values=list[float | None](values),
                    axisNames=["z"],
                ),
            },
        )

        param = Parameter(
            type="Parameter",
            unit=Unit(symbol=datastream.unitCode),
            id=parameterName,
            observedProperty=ObservedProperty(
                label={"en": datastream.elementCode},
                id=parameterName,
                description={"en": edr_field["description"]},
            ),
        )

        return (cov, param)

    def render(self):
        """Build the covjson and return it as a dictionary"""
        coverages: list[Coverage] = []
        parameters: dict[str, Parameter] = {}

        for triple, result in self.triplesToData.items():
            assert result
            for datastream in result:
                assert datastream.elementCode
                id = datastream.elementCode
                if self.select_properties and id not in self.select_properties:
                    continue
                cov, param = self._generate_coverage_and_parameter(triple, datastream)
                coverages.append(cov)
                assert param.id
                parameters[param.id] = param

                assert len(cov.ranges) == 1

        covCol = CoverageCollection(
            coverages=coverages,
            domainType=DomainType.point_series,
            parameters=Parameters(root=parameters),
        )
        return cast(
            CoverageCollectionDict, covCol.model_dump(by_alias=True, exclude_none=True)
        )  # pydantic covjson must dump with exclude none
