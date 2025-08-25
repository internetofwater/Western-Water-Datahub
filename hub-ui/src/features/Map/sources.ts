/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { SourceConfig } from '@/components/Map/types';

export enum SourceId {
  Huc02 = 'hu02',
  States = 'states',
  DoiRegions = 'doi-regions',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const makeTileURL = (sourceLayer: string) => {
  const baseUrl = window.location.origin; // e.g., http://localhost:5173

  return `${baseUrl}/api/collections/${sourceLayer}/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`;
};

/**
 * Configurations for sources in the map. Supports GeoJSON, VectorTile, and Esri Feature Service sources
 *
 * @constant
 */
export const sourceConfigs: SourceConfig[] = [];
