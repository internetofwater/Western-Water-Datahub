/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature } from 'geojson';
import { idStoreProperty } from '@/consts/collections';

export const getIdStore = (feature: Feature): string | undefined => {
  if (feature.properties && feature.properties[idStoreProperty]) {
    return feature.properties[idStoreProperty];
  }
};
