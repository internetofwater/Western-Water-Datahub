/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { TAxes, TValues } from "@/services/coverageJSON/types";
import {
  CoverageAxesSegments,
  CoverageAxesValues,
  CoverageJSON,
} from "@/services/edr.service";

export class CoverageService {
  getLength({
    start,
    stop,
    num,
  }: {
    start: number;
    stop: number;
    num: number;
  }): number {
    const length = Math.abs(stop - start) / num;

    return length;
  }

  getValues(coverage: CoverageJSON): TValues {
    const keys: TValues = {};
    let keyValues = Object.keys(coverage.ranges);
    if (coverage.parameters) {
      keyValues = Object.keys(coverage.parameters);
    }
    for (const key of keyValues) {
      keys[key] = coverage.ranges[key].values;
    }
    return keys;
  }

  isSegments(
    axis: CoverageAxesSegments | CoverageAxesValues,
  ): axis is CoverageAxesSegments {
    const a = axis as CoverageAxesSegments;
    return (
      typeof a?.start !== "undefined" &&
      typeof a?.stop !== "undefined" &&
      typeof a?.num !== "undefined" &&
      typeof a.start === "number" &&
      typeof a.stop === "number" &&
      typeof a.num === "number"
    );
  }

  isValues(
    axis: CoverageAxesSegments | CoverageAxesValues,
  ): axis is CoverageAxesValues {
    return Array.isArray((axis as any)?.values);
  }

  getAxes(coverage: CoverageJSON): TAxes {
    return coverage.domain.axes as TAxes;
  }

  getCurrentValuesConstructor(
    count: number,
    values: TValues,
    xCount: number,
    yCount: number,
  ) {
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
