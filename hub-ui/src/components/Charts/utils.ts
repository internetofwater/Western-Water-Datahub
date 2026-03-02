/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeoJsonProperties } from "geojson";
import { EChartsSeries, Series } from "@/components/Charts/types";
import notificationManager from "@/managers/Notification.init";
import { CoverageCollection, CoverageJSON } from "@/services/edr.service";
import { ENotificationType } from "@/stores/session/types";
import { isCoverageCollection } from "@/utils/clarifyObject";
import { getParameterUnit } from "@/utils/parameters";

export const aggregateProperties = <T extends GeoJsonProperties>(
  series: Series<T>[],
  properties: Array<keyof T>,
): { source: string; name: string; value: number }[] => {
  const aggregatedProperties: {
    source: string;
    name: string;
    value: number;
  }[] = [];

  properties.forEach((property) => {
    series.forEach((_series) => {
      const features = _series.data.features;
      const average =
        features.reduce(
          (sum, feature) => sum + Number(feature.properties![property]),
          0,
        ) / features.length;
      aggregatedProperties.push({
        source: _series.name,
        name: String(property),
        value: average,
      });
    });
  });

  return aggregatedProperties;
};

type Options = {
  chosenParameter?: string;
  chosenUnit?: string;
};

const coverageCollectionToSeries = (
  coverage: CoverageCollection,
  options?: Options,
) => {
  const parameters = coverage.parameters as CoverageJSON["parameters"];

  const curryCoverageToSeries = (coverage: CoverageJSON) => {
    return coverageToSeries(coverage, {
      parameters,
      chosenParameter: options?.chosenParameter,
      chosenUnit: options?.chosenUnit,
    });
  };

  return coverage.coverages.flatMap(curryCoverageToSeries);
};

type CoverageOptions = Options & {
  parameters?: CoverageJSON["parameters"];
};

const coverageToSeries = (
  coverage: CoverageJSON,
  options?: CoverageOptions,
) => {
  const dates = (coverage.domain.axes.t as { values: string[] }).values;
  const coverageParameters = coverage.parameters ?? options?.parameters;

  if (!coverage.ranges || !dates) {
    notificationManager.show(
      "Missing ranges or date axis in coverage data",
      ENotificationType.Error,
      10000,
    );
    return [];
  }

  const series: EChartsSeries[] = [];

  const filteredRanges = Object.entries(coverage.ranges).filter(
    ([parameterId]) => {
      if (options?.chosenParameter) {
        return parameterId === options?.chosenParameter;
      }

      if (options?.chosenUnit) {
        const parameter = coverageParameters[parameterId];
        const unit = getParameterUnit(parameter);

        return unit === options?.chosenUnit;
      }

      return true;
    },
  );

  for (const [parameterId, range] of filteredRanges) {
    if (!range.values || range.values.length !== dates.length) {
      console.warn(
        `Skipping ${parameterId} due to mismatched or missing values`,
      );
      continue;
    }

    // TODO: add multi language
    // TODO: switch so that name is the label
    const parameter = coverageParameters[parameterId];

    const unit = getParameterUnit(parameter);

    series.push({
      name: parameterId,
      parameter: parameter.id,
      unit,
      type: "line",
      data: range.values,
    });
  }

  return series;
};

export const coverageJSONToSeries = (
  coverage: CoverageCollection | CoverageJSON,
  options?: Options,
): EChartsSeries[] => {
  if (isCoverageCollection(coverage)) {
    return coverageCollectionToSeries(coverage, options);
  }

  return coverageToSeries(coverage, options);
};
