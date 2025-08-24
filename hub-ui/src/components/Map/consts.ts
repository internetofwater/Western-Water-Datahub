/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { BasemapId, Basemaps } from '@/components/Map/types';

export const basemaps: Basemaps = {
  [BasemapId.Standard]: 'mapbox://styles/mapbox/standard',
  [BasemapId.StandardSatellite]: 'mapbox://styles/mapbox/standard-satellite',
  [BasemapId.Streets]: 'mapbox://styles/mapbox/streets-v12',
  [BasemapId.Outdoors]: 'mapbox://styles/mapbox/outdoors-v12',
  [BasemapId.Light]: 'mapbox://styles/mapbox/light-v11',
  [BasemapId.Dark]: 'mapbox://styles/mapbox/dark-v11',
  [BasemapId.Satellite]: 'mapbox://styles/mapbox/satellite-v9',
  [BasemapId.SatelliteStreets]: 'mapbox://styles/mapbox/satellite-streets-v12',
  [BasemapId.NavigationDay]: 'mapbox://styles/mapbox/navigation-day-v1',
  [BasemapId.NavigationNight]: 'mapbox://styles/mapbox/navigation-night-v1',
};
