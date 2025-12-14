/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { TLocation } from '@/stores/main/types';

export const groupLocationIdsByLayer = (
  locations: TLocation[]
): Record<TLocation['layerId'], Array<TLocation['id']>> => {
  return locations.reduce(
    (acc, location) => {
      const { layerId, id } = location;
      if (!acc[layerId]) {
        acc[layerId] = [];
      }
      acc[layerId].push(id);
      return acc;
    },
    {} as Record<TLocation['layerId'], Array<TLocation['id']>>
  );
};
