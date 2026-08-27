/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { TAxes, TCoverageOptions, TValues } from '@/services/coverageJSON/types';
import { CoverageAxesSegments, CoverageAxesValues, CoverageJSON } from '@/services/edr.service';
import { getParameterUnit } from '@/utils/parameters';

export class CoverageService {
  getAxisNames(ranges: CoverageJSON['ranges']) {
    return Object.entries(ranges).map(([parameterId, range]) => {
      return { parameterId, axisNames: range.axisNames };
    });
  }

  getLength({ start, stop, num }: { start: number; stop: number; num: number }): number {
    const length = Math.abs(stop - start) / num;

    return length;
  }

  getRange(coverage: CoverageJSON, options?: TCoverageOptions): TValues {
    const filteredRanges = Object.entries(coverage.ranges).filter(([parameterId]) => {
      if (options?.chosenParameter) {
        const parameterEntry = coverage.parameters[parameterId];
        if (parameterEntry) {
          const parameterLabel = parameterEntry.observedProperty.label.en;
          return parameterLabel === options?.chosenParameter;
        }
      }

      if (options?.chosenUnit) {
        const parameter = coverage.parameters[parameterId];
        const unit = getParameterUnit(parameter);

        return unit === options?.chosenUnit;
      }

      return true;
    });

    const keys: TValues = {};
    let keyValues = filteredRanges.map((entry) => entry[0]);
    if (coverage.parameters) {
      keyValues = Object.keys(coverage.parameters);
    }
    for (const key of keyValues) {
      if (coverage.ranges[key]?.values) {
        keys[key] = coverage.ranges[key].values;
      }
    }
    return keys;
  }

  isSegments(axis: CoverageAxesSegments | CoverageAxesValues): axis is CoverageAxesSegments {
    const a = axis as CoverageAxesSegments;
    return (
      typeof a?.start !== 'undefined' &&
      typeof a?.stop !== 'undefined' &&
      typeof a?.num !== 'undefined' &&
      typeof a.start === 'number' &&
      typeof a.stop === 'number' &&
      typeof a.num === 'number'
    );
  }

  isValues(axis: CoverageAxesSegments | CoverageAxesValues): axis is CoverageAxesValues {
    return Array.isArray((axis as any)?.values);
  }

  getAxes(coverage: CoverageJSON): TAxes {
    return coverage.domain.axes as TAxes;
  }

  getDomainType(coverage: CoverageJSON): string {
    return coverage.domain.domainType ?? coverage?.domainType ?? '';
  }

  getCurrentRangeValueConstructor(count: number, values: TValues, xCount: number, yCount: number) {
    const keys = Object.keys(values);

    return (i: number, j: number): TValues => {
      const currentValues: TValues = {};

      for (const key of keys) {
        const flatValues = values[key];
        currentValues[key] = [];

        for (let k = 0; k < count; k++) {
          const index = k * (xCount * yCount) + j * xCount + i;
          currentValues[key].push(flatValues[index] ?? null);
        }
      }

      return currentValues;
    };
  }
}
