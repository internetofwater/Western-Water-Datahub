/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { bbox, bboxPolygon, point } from '@turf/turf';
import { BBox, FeatureCollection, Point, Polygon } from 'geojson';
import { getDefaultGeoJSON } from '@/consts/geojson';
import {
  CoverageAxesSegments,
  CoverageAxesValues,
  CoverageCollection,
  CoverageJSON,
  ICollection,
} from '@/services/edr.service';
import wwdhService from '@/services/init/wwdh.init';
import { isCoverageJSON } from '@/utils/isTypeObject';
import { getDatetime } from '@/utils/url';

export const DATES_PROPERTY = 'times';

type Values = Record<string, (number | null)[]>;
type Axes = {
  t: { values: string[] };
  x: { start: number; stop: number; num: number };
  y: { start: number; stop: number; num: number };
};

export class CoverageGridService {
  private getLength({ start, stop, num }: { start: number; stop: number; num: number }): number {
    const length = Math.abs(stop - start) / num;

    return length;
  }

  private getValues(coverage: CoverageJSON): Values {
    const keys: Values = {};
    let keyValues = Object.keys(coverage.ranges);
    if (coverage.parameters) {
      keyValues = Object.keys(coverage.parameters);
    }
    for (const key of keyValues) {
      keys[key] = coverage.ranges[key].values;
    }
    return keys;
  }

  private isSegments(
    axis: CoverageAxesSegments | CoverageAxesValues
  ): axis is CoverageAxesSegments {
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

  private isValues(axis: CoverageAxesSegments | CoverageAxesValues): axis is CoverageAxesValues {
    return Array.isArray((axis as any)?.values);
  }

  private getAxes(coverage: CoverageJSON): Axes {
    return coverage.domain.axes as Axes;
  }

  private getCurrentValuesConstructor(
    count: number,
    values: Values,
    xCount: number,
    yCount: number
  ) {
    const keys = Object.keys(values);

    return (i: number, j: number): Values => {
      const currentValues: Values = {};

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

  private addGridValuesConstructor(
    xValues: number[],
    yValues: number[],
    featureCollection: FeatureCollection<Polygon>,
    times: (string | number)[],
    values: Values,
    currentId?: number
  ) {
    const count = times.length;

    const xLength = xValues.length;
    const yLength = yValues.length;

    const getCurrentValues = this.getCurrentValuesConstructor(count, values, xLength, yLength);
    let id = 1;

    return (x: number, y: number) => {
      const currentValues = getCurrentValues(x, y);

      // This grid entry would have no values to display
      if (Object.values(currentValues).every((array) => array.every((value) => value === null))) {
        return;
      }
      const startY = yValues[y];
      const endY = yValues[y + 1];

      const startX = xValues[x];
      const endX = xValues[x + 1];

      const grid = bboxPolygon([startX, startY, endX, endY], {
        id: currentId ?? id,
        properties: {
          [DATES_PROPERTY]: times,
          gridIdentifier: `${startX}_${startY}_${endX}_${endY}`,
          ...currentValues,
        },
      });
      featureCollection.features.push(grid);
      id += 1;
    };
  }

  private createGridValues(
    timesObj: CoverageAxesValues,
    xObj: CoverageAxesValues,
    yObj: CoverageAxesValues,
    coverage: CoverageJSON,
    currentId?: number
  ): FeatureCollection<Polygon> {
    let values: Values | null = this.getValues(coverage);

    const featureCollection = getDefaultGeoJSON<Polygon>();

    const addGrid = this.addGridValuesConstructor(
      xObj.values as number[],
      yObj.values as number[],
      featureCollection as FeatureCollection<Polygon>,
      timesObj.values,
      values,
      currentId
    );

    for (let y = 0; y < yObj.values.length - 1; y++) {
      for (let x = 0; x < xObj.values.length - 1; x++) {
        addGrid(x, y);
      }
    }
    values = null;

    return featureCollection;
  }

  private addGridSegmentConstructor(
    xStart: number,
    yStart: number,
    xLength: number,
    yLength: number,
    xCount: number,
    yCount: number,
    featureCollection: FeatureCollection<Polygon>,
    times: (string | number)[],
    values: Values,
    currentId?: number
  ) {
    const count = times.length;

    const getCurrentValues = this.getCurrentValuesConstructor(count, values, xCount, yCount);

    let id = 1;

    return (x: number, y: number) => {
      const currentValues = getCurrentValues(x, y);

      // This grid entry would have no values to display
      if (Object.values(currentValues).every((array) => array.every((value) => value === null))) {
        return;
      }
      const startY = yStart - yLength * y;
      const endY = yStart - yLength * (y + 1);

      const startX = xStart + xLength * x;
      const endX = xStart + xLength * (x + 1);

      const grid = bboxPolygon([startX, startY, endX, endY], {
        id: currentId ?? id,
        properties: {
          [DATES_PROPERTY]: times,
          gridIdentifier: `${startX}_${startY}_${endX}_${endY}`,
          ...currentValues,
        },
      });
      featureCollection.features.push(grid);
      id += 1;
    };
  }

  private createGridSegments(
    timesObj: CoverageAxesValues,
    xObj: CoverageAxesSegments,
    yObj: CoverageAxesSegments,
    coverage: CoverageJSON,
    currentId?: number
  ): FeatureCollection<Polygon> {
    const xLength = this.getLength(xObj);
    const yLength = this.getLength(yObj);

    let values: Values | null = this.getValues(coverage);

    const featureCollection = getDefaultGeoJSON<Polygon>();

    const addGrid = this.addGridSegmentConstructor(
      xObj.start,
      yObj.start,
      xLength,
      yLength,
      xObj.num,
      yObj.num,
      featureCollection as FeatureCollection<Polygon>,
      timesObj.values,
      values,
      currentId
    );

    for (let y = 0; y < yObj.num; y++) {
      for (let x = 0; x < xObj.num; x++) {
        addGrid(x, y);
      }
    }
    values = null;

    return featureCollection;
  }

  private createGridCollection(
    coverage: CoverageJSON,
    id?: number
  ): FeatureCollection<Point | Polygon> {
    if (coverage.domain.domainType === 'Grid') {
      const { t, x: xObj, y: yObj } = this.getAxes(coverage);

      if (this.isSegments(xObj) && this.isSegments(yObj)) {
        return this.createGridSegments(t, xObj, yObj, coverage, id);
      }

      if (this.isValues(xObj) && this.isValues(yObj)) {
        return this.createGridValues(t, xObj, yObj, coverage, id);
      }

      throw new Error(
        'Mixed axis types are not supported (x and y must both be segments or both be values).'
      );
    }
    if (coverage.domain.domainType === 'PointSeries') {
      const { t, x: xObj, y: yObj } = this.getAxes(coverage);

      if (this.isValues(xObj) && this.isValues(yObj)) {
        return this.createPoint(t, xObj, yObj, coverage, id);
      }
    }

    throw new Error(`Unsupported coverage type`);
  }

  private addPointsConstructor(
    xValues: number[],
    yValues: number[],
    featureCollection: FeatureCollection<Point>,
    times: (string | number)[],
    values: Values,
    currentId?: number
  ) {
    const count = times.length;

    const xLength = xValues.length;
    const yLength = yValues.length;

    const getCurrentValues = this.getCurrentValuesConstructor(count, values, xLength, yLength);
    let id = 1;

    return (x: number, y: number) => {
      const currentValues = getCurrentValues(x, y);

      // This point entry would have no values to display
      if (Object.values(currentValues).every((array) => array.every((value) => value === null))) {
        return;
      }
      const yValue = yValues[y];

      const xValue = xValues[x];

      const pointFeature = point(
        [xValue, yValue],
        {
          [DATES_PROPERTY]: times,
          pointIdentifier: `${xValue}_${yValue}`,
          ...currentValues,
        },
        { id: currentId ?? id }
      );
      const pointBBox = bbox(pointFeature);
      pointFeature.bbox = pointBBox;
      featureCollection.features.push(pointFeature);
      id += 1;
    };
  }

  private createPoint(
    timesObj: CoverageAxesValues,
    xObj: CoverageAxesValues,
    yObj: CoverageAxesValues,
    coverage: CoverageJSON,
    id?: number
  ): FeatureCollection<Point> {
    let values: Values | null = this.getValues(coverage);

    const featureCollection = getDefaultGeoJSON<Point>();

    const addPoint = this.addPointsConstructor(
      xObj.values as number[],
      yObj.values as number[],
      featureCollection as FeatureCollection<Point>,
      timesObj.values,
      values,
      id
    );

    for (let y = 0; y < yObj.values.length; y++) {
      for (let x = 0; x < xObj.values.length; x++) {
        addPoint(x, y);
      }
    }
    values = null;

    return featureCollection;
  }

  private createCollection(collection: CoverageCollection): FeatureCollection<Point | Polygon> {
    const featureCollection = getDefaultGeoJSON<Point | Polygon>();

    let id = 1;
    for (const coverage of collection.coverages) {
      if (coverage.domain.domainType === 'PointSeries') {
        const { t, x: xObj, y: yObj } = this.getAxes(coverage);
        if (this.isValues(xObj) && this.isValues(yObj)) {
          const pointCollection = this.createPoint(t, xObj, yObj, coverage, id);
          featureCollection.features.push(...pointCollection.features);
        }
      } else if (coverage.domain.domainType === 'Grid') {
        const gridCollection = this.createGridCollection(coverage, id);
        featureCollection.features.push(...gridCollection.features);
      }
      id += 1;
    }

    return featureCollection;
  }

  public async createGrid(
    collectionId: ICollection['id'],
    bbox: BBox,
    from?: string | null,
    to?: string | null,
    parameterNames?: string[],
    signal?: AbortSignal
  ): Promise<FeatureCollection<Point | Polygon>> {
    const datetime = getDatetime(from, to);

    const coverage = await wwdhService.getCube<CoverageJSON | CoverageCollection>(collectionId, {
      signal,
      params: {
        bbox,
        ...(parameterNames && parameterNames.length > 0
          ? { 'parameter-name': parameterNames.join(',') }
          : {}),
        ...(datetime ? { datetime } : {}),
        // TODO: remove this when support added for content-type headers
        f: 'json',
      },
    });

    if (!coverage) {
      throw new Error(`No data found. Try a different date range or parameter.`);
    }

    if (isCoverageJSON(coverage)) {
      return this.createGridCollection(coverage);
    }

    return this.createCollection(coverage);
  }
}
