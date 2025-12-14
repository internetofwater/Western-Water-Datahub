/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export type Series<T extends GeoJsonProperties> = {
  name: string;
  data: FeatureCollection<Geometry, T>;
};

export type PrettyLabel = { parameter: string; label: string };

// TODO: consilidate, make generic?
export type EChartsSeries = {
  name: string;
  type: 'line';
  stack: string;
  data: number[];
};
