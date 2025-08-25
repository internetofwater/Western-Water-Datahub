/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeoJsonProperties } from 'geojson';
import { Series } from '@/components/Charts/types';
import { CoverageCollection, CoverageJSON } from '@/services/edr.service';

export const aggregateProperties = <T extends GeoJsonProperties>(
  series: Series<T>[],
  properties: Array<keyof T>
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
        features.reduce((sum, feature) => sum + Number(feature.properties![property]), 0) /
        features.length;
      aggregatedProperties.push({
        source: _series.name,
        name: String(property),
        value: average,
      });
    });
  });

  return aggregatedProperties;
};

type EChartsSeries = {
  name: string;
  type: 'line';
  stack: string;
  data: number[];
};

const isCoverageCollection = (
  coverage: CoverageCollection | CoverageJSON
): coverage is CoverageCollection => {
  return coverage.type === 'CoverageCollection';
};

export const coverageJSONToSeries = (
  coverage: CoverageCollection | CoverageJSON
): EChartsSeries[] => {
  const ranges = isCoverageCollection(coverage) ? coverage.coverages[0]?.ranges : coverage.ranges;

  const dates = isCoverageCollection(coverage)
    ? coverage.coverages[0]?.domain.axes.t.values
    : coverage.domain.axes.t.values;

  if (!ranges || !dates) {
    throw new Error('Missing ranges or date axis in coverage data');
  }

  const series: EChartsSeries[] = [];

  for (const [parameter, range] of Object.entries(ranges)) {
    if (!range.values || range.values.length !== dates.length) {
      console.warn(`Skipping ${parameter} due to mismatched or missing values`);
      continue;
    }

    series.push({
      name: parameter,
      type: 'line',
      stack: 'Total',
      data: range.values,
    });
  }

  console.log('series', series);

  return series;
};
