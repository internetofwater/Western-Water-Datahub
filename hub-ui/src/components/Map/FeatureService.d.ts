/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

// @types/hansdo__mapbox-gl-arcgis-featureserver/index.d.ts

declare module '@hansdo/mapbox-gl-arcgis-featureserver' {
  import { Map } from 'mapbox-gl';

  export interface FeatureServiceOptions {
    url: string;
    simplifyFactor?: number;
  }

  class FeatureService {
    _map: Map;
    constructor(id: string, map: Map, options: FeatureServiceOptions);
    _setAttribution() {}
  }

  export default FeatureService;
}
