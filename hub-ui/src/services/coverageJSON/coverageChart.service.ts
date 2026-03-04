/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { EChartsSeries } from "@/components/Charts/types";
import notificationManager from "@/managers/Notification.init";
import { CoverageService } from "@/services/coverageJSON/coverage.service";
import { TCoverageOptions, TOptions } from "@/services/coverageJSON/types";
import { CoverageCollection, CoverageJSON } from "@/services/edr.service";
import { ENotificationType } from "@/stores/session/types";
import { isCoverageCollection } from "@/utils/clarifyObject";
import { getParameterUnit } from "@/utils/parameters";

export class CoverageChartService extends CoverageService {
  private coverageCollectionToSeries = (
    coverage: CoverageCollection,
    options?: TOptions,
  ) => {
    const parameters = coverage.parameters as CoverageJSON["parameters"];

    const curryCoverageToSeries = (coverage: CoverageJSON) => {
      return this.coverageToSeries(coverage, {
        parameters,
        chosenParameter: options?.chosenParameter,
        chosenUnit: options?.chosenUnit,
      });
    };

    return coverage.coverages.flatMap(curryCoverageToSeries);
  };

  private coverageToSeries = (
    coverage: CoverageJSON,
    options?: TCoverageOptions,
  ) => {
    if (coverage.domain.domainType !== "PointSeries") {
      notificationManager.show(
        `Domain type ${coverage.domain.domainType} is not currently supported.`,
        ENotificationType.Error,
        10000,
      );
      return [];
    }

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

      // TODO: add multi language support
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

  public coverageJSONToSeries = (
    coverage: CoverageCollection | CoverageJSON,
    options?: TOptions,
  ): EChartsSeries[] => {
    if (isCoverageCollection(coverage)) {
      return this.coverageCollectionToSeries(coverage, options);
    }

    return this.coverageToSeries(coverage, options);
  };
}
