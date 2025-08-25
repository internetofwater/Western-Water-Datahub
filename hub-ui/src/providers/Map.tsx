/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { PropsWithChildren } from 'react';
import { MapProvider } from '@/contexts/MapContexts';
import { MAP_ID } from '@/features/Map/config';

// import { MAP_ID } from '@/features/Map/consts';

/**
 * Provides Map Context to allow accessing maps across application
 *
 * @component
 */
export const Map: React.FC<PropsWithChildren> = ({ children }) => {
  const mapIds: string[] = [MAP_ID];

  return <MapProvider mapIds={mapIds}>{children}</MapProvider>;
};
