/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeoJsonProperties } from 'geojson';
import { Series } from '@/components/Charts/types';
import notificationManager from '@/managers/Notification.init';
import { CoverageCollection, CoverageJSON } from '@/services/edr.service';
import { ENotificationType } from '@/stores/session/types';
import { isCoverageCollection } from '@/utils/clarifyObject';

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

export const coverageJSONToSeries = (
  coverage: CoverageCollection | CoverageJSON
): EChartsSeries[] => {
  const ranges = isCoverageCollection(coverage) ? coverage.coverages[0]?.ranges : coverage.ranges;

  const dates = isCoverageCollection(coverage)
    ? (coverage.coverages[0]?.domain.axes.t as { values: string[] }).values
    : (coverage.domain.axes.t as { values: string[] }).values;

  if (!ranges || !dates) {
    notificationManager.show(
      'Missing ranges or date axis in coverage data',
      ENotificationType.Error,
      10000
    );
    return [];
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

  return series;
};
