/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export type Series<T extends GeoJsonProperties> = {
  name: string;
  data: FeatureCollection<Geometry, T>;
};
