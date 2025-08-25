/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { MapComponentProps } from '@/components/Map/types';

// Dynamic load causes a double render even without strict mode
const ClientSideMap = lazy(() => import('./ClientSide'));

/**
 * This component renders the map component using a lazy load.
 *
 * The map component initializes and renders a Mapbox GL map with specified sources, layers, and controls.
 * It handles map loading, style changes, and cleanup on component unmount. Once the map is initialized
 * it the map object is stored into the map context provider to allow referencing across the application.
 *
 * Props:
 * - accessToken: string - The access token for the Mapbox service.
 * - id: string - The unique identifier for the map component.
 * - sources: SourceConfig[] - Array of source configurations for the map.
 * - layers: MainLayerDefinition[] - Array of layer definitions for the map.
 * - options: Omit<MapOptions, 'container'> - Map options excluding the container property.
 *   Container is defined by this component.
 * - controls?: {
 *     navigationControl?: NavigationControlOptions | boolean;
 *     scaleControl?: ScaleControlOptions | boolean;
 *     fullscreenControl?: FullscreenControlOptions | boolean;
 * } - Optional map controls configuration.
 * - persist?: boolean - Optional boolean to not remove this map instance. WARNING: the map instance must
 *  be removed manually to prevent memory leak.
 *
 * @component
 */
const Map: React.FC<MapComponentProps> = (props) => {
  return (
    <>
      <Suspense>
        <ClientSideMap {...props} />
      </Suspense>
    </>
  );
};

export default Map;
