/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export const DEFAULT_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

export const getDefaultGeoJSON = <
  T extends Geometry = Geometry,
  V extends GeoJsonProperties = GeoJsonProperties,
>() => {
  const DEFAULT_GEOJSON: FeatureCollection<T, V> = {
    type: 'FeatureCollection',
    features: [],
  };

  return DEFAULT_GEOJSON;
};
