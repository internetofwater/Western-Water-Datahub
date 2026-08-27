/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { EChartsSeries } from '@/components/Charts/types';
import NotificationManager from '@/managers/Notification.manager';
import { CoverageService } from '@/services/coverageJSON/coverage.service';
import {
  TChartData,
  TCoverageOptions,
  TOptions,
  TValues,
  XAXisOption,
} from '@/services/coverageJSON/types';
import { isTimeAxis } from '@/services/coverageJSON/utils';
import { CoverageAxesValues, CoverageCollection, CoverageJSON } from '@/services/edr.service';
import { ENotificationType } from '@/stores/session/types';
import { isAxesValues, isCoverageCollection } from '@/utils/isTypeObject';
import { getParameterUnit } from '@/utils/parameters';

type CoverageChartServiceDependencies = {
  notificationManager: NotificationManager;
};

export class CoverageChartService extends CoverageService {
  private deps: CoverageChartServiceDependencies;

  constructor(deps: CoverageChartServiceDependencies) {
    super();
    this.deps = deps;
  }

  private associateDataWithTime(
    values: (string | number | null)[],
    times: (string | number)[]
  ): EChartsSeries['data'] {
    return values.map((value, index) => [times[index], value]);
  }

  private addGridValuesConstructor(
    xValues: number[],
    yValues: number[],
    series: EChartsSeries[],
    parameters: CoverageJSON['parameters'],
    times: (string | number)[],
    values: TValues,
    options: TCoverageOptions = {}
  ) {
    const count = times.length;

    const xLength = xValues.length;
    const yLength = yValues.length;

    const getCurrentValues = this.getCurrentRangeValueConstructor(count, values, xLength, yLength);
    let id = 1;

    return (x: number, y: number) => {
      const currentValues = getCurrentValues(x, y);
      if (Object.values(currentValues).every((array) => array.every((value) => value === null))) {
        return;
      }

      const [parameterId, values] = Object.entries(currentValues)[0];

      // This grid entry would have no values to display
      if (Object.values(values).every((value) => value === null)) {
        return;
      }

      let data: EChartsSeries['data'] = values;
      if (isTimeAxis(options)) {
        data = this.associateDataWithTime(values, times);
      }

      const parameter = parameters[parameterId];
      const unit = getParameterUnit(parameter);
      series.push({
        name: `${parameterId} Sub-grid ${id}`,
        parameter: parameterId,
        unit,
        data,
        type: 'line',
      });
      id += 1;
    };
  }

  private processGridValues(
    timesObj: CoverageAxesValues,
    xObj: CoverageAxesValues,
    yObj: CoverageAxesValues,
    coverage: CoverageJSON,
    options?: TCoverageOptions
  ): EChartsSeries[] {
    let values: TValues | null = this.getRange(coverage, options);

    const series: EChartsSeries[] = [];

    const coverageParameters = coverage.parameters;

    const addGrid = this.addGridValuesConstructor(
      xObj.values as number[],
      yObj.values as number[],
      series,
      coverageParameters,
      timesObj.values,
      values,
      options
    );

    for (let y = 0; y < yObj.values.length; y++) {
      for (let x = 0; x < xObj.values.length; x++) {
        addGrid(x, y);
      }
    }
    values = null;

    return series;
  }

  private processGrid(coverage: CoverageJSON, options?: TCoverageOptions) {
    const { t, x: xObj, y: yObj } = this.getAxes(coverage);

    if (this.isSegments(xObj) && this.isSegments(yObj)) {
      if (this.deps.notificationManager) {
        this.deps.notificationManager.show(
          `Domain type ${coverage.domain.domainType}, sub-type segments is not currently supported.`,
          ENotificationType.Error,
          10000
        );
      }
      return [];
    }

    if (this.isValues(xObj) && this.isValues(yObj)) {
      return this.processGridValues(t, xObj, yObj, coverage, options);
    }

    return [];
  }

  private processVerticalProfile(coverage: CoverageJSON, options: TCoverageOptions = {}) {
    const coverageParameters = coverage.parameters ?? options?.parameters;

    if (!coverage.ranges) {
      if (this.deps.notificationManager) {
        this.deps.notificationManager.show(
          'Missing ranges in coverage data',
          ENotificationType.Error,
          10000
        );
      }
      return [];
    }

    const series: EChartsSeries[] = [];

    const filteredRanges = Object.entries(coverage.ranges).filter(([parameterId]) => {
      if (options?.chosenParameter) {
        const parameterEntry = coverageParameters[parameterId];
        if (parameterEntry) {
          const parameterLabel = parameterEntry.observedProperty.label.en;
          return parameterLabel === options?.chosenParameter;
        }
      }

      if (options?.chosenUnit) {
        const parameter = coverageParameters[parameterId];
        const unit = getParameterUnit(parameter);

        return unit === options?.chosenUnit;
      }

      return true;
    });

    for (const [parameterId, range] of filteredRanges) {
      if (!range.values) {
        console.warn(`Skipping ${parameterId} due to mismatched or missing values`);
        continue;
      }

      // TODO: add multi language support
      // TODO: switch so that name is the label
      const parameter = coverageParameters[parameterId];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const unit = getParameterUnit(parameter);

      let data: EChartsSeries['data'] = range.values;
      if (isTimeAxis(options)) {
        const dates = this.extractDates(coverage);

        data = this.associateDataWithTime(range.values, dates);
      }

      series.push({
        name: parameterId,
        parameter: parameter.id,
        unit,
        type: 'line',
        data,
      });
    }

    return series;
  }

  private processSeries(
    coverage: CoverageJSON,
    options: TCoverageOptions = { axisStyle: 'values' }
  ) {
    const dates = (coverage.domain.axes.t as { values: string[] }).values;
    const coverageParameters = coverage.parameters ?? options?.parameters;

    if (!coverage.ranges || Object.keys(coverage.ranges).length === 0 || !dates) {
      if (this.deps.notificationManager) {
        this.deps.notificationManager.show(
          'Missing ranges or date axis in coverage data. There may be no data for this date range.',
          ENotificationType.Error,
          10000
        );
      }
      return [];
    }

    const series: EChartsSeries[] = [];

    const filteredRanges = Object.entries(coverage.ranges).filter(([parameterId]) => {
      if (options?.chosenParameter) {
        return parameterId === options?.chosenParameter;
      }

      if (options?.chosenUnit) {
        const parameter = coverageParameters[parameterId];
        const unit = getParameterUnit(parameter);

        return unit === options?.chosenUnit;
      }

      return true;
    });

    for (const [parameterId, range] of filteredRanges) {
      if (!range.values || range.values.length !== dates.length) {
        console.warn(`Skipping ${parameterId} due to mismatched or missing values`);
        continue;
      }

      // TODO: add multi language support
      // TODO: switch so that name is the label
      const parameter = coverageParameters[parameterId];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const unit = getParameterUnit(parameter);

      let data: EChartsSeries['data'] = range.values;
      if (isTimeAxis(options)) {
        const dates = this.extractDates(coverage);

        data = this.associateDataWithTime(range.values, dates);
      }

      series.push({
        name: parameterId,
        parameter: parameter.id,
        unit,
        type: 'line',
        data,
      });
    }

    return series;
  }
  private addSingletonValuesConstructor(
    xValues: number[],
    yValues: number[],
    series: EChartsSeries[],
    parameters: CoverageJSON['parameters'],
    times: (string | number)[],
    values: TValues,
    options: TCoverageOptions = {}
  ) {
    const count = times.length;

    const xLength = xValues.length;
    const yLength = yValues.length;

    const getCurrentValues = this.getCurrentRangeValueConstructor(count, values, xLength, yLength);
    let id = 1;

    return (x: number, y: number) => {
      const currentValues = getCurrentValues(x, y);
      // Check to determine if the paramater selected has a value.
      if (Object.values(currentValues).every((array) => array.every((value) => value === null))) {
        return;
      }

      const [parameterId, values] = Object.entries(currentValues)[0];

      if (Object.values(values).every((value) => value === null)) {
        return;
      }

      let data: EChartsSeries['data'] = values;
      if (isTimeAxis(options)) {
        data = this.associateDataWithTime(values, times);
      }

      const parameter = parameters[parameterId];
      const unit = getParameterUnit(parameter);
      series.push({
        name: `${parameterId} point ${id}`,
        parameter: parameterId,
        unit,
        data,
        type: 'line',
      });
      id += 1;
    };
  }

  private processSingletonValues(
    timesObj: CoverageAxesValues,
    xObj: CoverageAxesValues,
    yObj: CoverageAxesValues,
    coverage: CoverageJSON,
    options?: TCoverageOptions
  ): EChartsSeries[] {
    let values: TValues | null = this.getRange(coverage, options);

    const series: EChartsSeries[] = [];

    const coverageParameters = coverage.parameters;

    const addPoint = this.addSingletonValuesConstructor(
      xObj.values as number[],
      yObj.values as number[],
      series,
      coverageParameters,
      timesObj.values,
      values
    );

    for (let y = 0; y < yObj.values.length; y++) {
      for (let x = 0; x < xObj.values.length; x++) {
        addPoint(x, y);
      }
    }
    values = null;

    return series;
  }
  private processSingleton(coverage: CoverageJSON, options?: TCoverageOptions) {
    const { t, x: xObj, y: yObj } = this.getAxes(coverage);

    if (!coverage.ranges || Object.keys(coverage.ranges).length === 0) {
      if (this.deps.notificationManager) {
        this.deps.notificationManager.show(
          'Missing ranges in coverage data. There may be no data for this date range.',
          ENotificationType.Error,
          10000
        );
      }
      return [];
    }

    if (this.isSegments(xObj) && this.isSegments(yObj)) {
      if (this.deps.notificationManager) {
        this.deps.notificationManager.show(
          `Domain type ${coverage.domain.domainType}, sub-type segments is not currently supported.`,
          ENotificationType.Error,
          10000
        );
      }
      return [];
    }

    if (this.isValues(xObj) && this.isValues(yObj)) {
      return this.processSingletonValues(t, xObj, yObj, coverage, options);
    }

    return [];
  }

  private coverageCollectionToSeries(coverage: CoverageCollection, options?: TOptions) {
    const parameters = coverage.parameters as CoverageJSON['parameters'];

    const curryCoverageToSeries = (coverage: CoverageJSON) => {
      return this.coverageToSeries(coverage, {
        parameters,
        ...options,
      });
    };

    return coverage.coverages.flatMap(curryCoverageToSeries);
  }

  private coverageToSeries(coverage: CoverageJSON, options?: TCoverageOptions) {
    const domainType = this.getDomainType(coverage);

    if (['PolygonSeries', 'PointSeries'].includes(domainType)) {
      return this.processSeries(coverage, options);
    }

    if (domainType === 'VerticalProfile') {
      return this.processVerticalProfile(coverage, options);
    }

    if (domainType === 'Grid') {
      return this.processGrid(coverage, options);
    }

    if (['Polygon', 'Point'].includes(domainType)) {
      return this.processSingleton(coverage, options);
    }
    if (this.deps.notificationManager) {
      this.deps.notificationManager.show(
        `Domain type ${domainType} is not currently supported.`,
        ENotificationType.Error,
        10000
      );
    }
    return [];
  }

  private extractDates(coverage: CoverageJSON): string[] {
    return isCoverageCollection(coverage)
      ? (coverage.coverages[0]?.domain.axes.t as { values: string[] }).values
      : (coverage.domain.axes.t as { values: string[] }).values;
  }

  private extractMinMax(values: string[] | number[]): { min: string; max: string } {
    const length = values.length;

    if (length === 0) {
      return { min: '', max: '' };
    }
    const min = String(values[0]);
    const max = String(values[length - 1]);

    return { min, max };
  }

  private processXAxis(coverage: CoverageJSON, options: TCoverageOptions = {}): XAXisOption {
    const { axisStyle = 'values' } = options;

    const { ranges } = coverage;

    const organizedAxisNames = this.getAxisNames(ranges);

    const domainType = this.getDomainType(coverage);

    if (organizedAxisNames.length === 1 && organizedAxisNames[0].axisNames.length === 1) {
      const axis = organizedAxisNames[0].axisNames[0];
      const axes = coverage.domain.axes[axis];

      if (!isAxesValues(axes)) {
        console.warn('Unable to process: ', axes);
        return {};
      }

      const values = axes.values;

      if (values.length === 0) {
        console.warn('No values: ', axes);
        return {};
      }

      let name = undefined;
      if (domainType === 'VerticalProfile') {
        const { referencing } = coverage.domain;

        const reference = referencing.find((reference) =>
          reference.coordinates.some((coordinate) => coordinate === axis)
        );

        if (reference) {
          if (reference.system.type === 'VerticalCRS') {
            name = reference.system.id;
          }
        }
      }

      if (axisStyle === 'time') {
        const { min, max } = this.extractMinMax(values);
        return {
          type: 'time',
          min,
          max,
        };
      }

      return {
        type: 'category',
        boundaryGap: false,
        data: values,
        name,
        nameLocation: 'middle',
        nameGap: 25,
      };
    }

    if (['PolygonSeries', 'PointSeries', 'Polygon', 'Point', 'Grid'].includes(domainType)) {
      const dates = this.extractDates(coverage);

      if (axisStyle === 'time') {
        const { min, max } = this.extractMinMax(dates);
        return {
          type: 'time',
          min,
          max,
        };
      }

      return {
        type: 'category',
        boundaryGap: false,
        data: dates,
      };
    }

    return {};
  }

  public coverageJSONToSeries(
    coverage: CoverageCollection | CoverageJSON,
    options?: TCoverageOptions
  ): TChartData {
    if (isCoverageCollection(coverage)) {
      return {
        x: this.processXAxis(coverage.coverages[0], options),
        series: this.coverageCollectionToSeries(coverage, options),
      };
    }

    return {
      x: this.processXAxis(coverage, options),
      series: this.coverageToSeries(coverage, options),
    };
  }
}
