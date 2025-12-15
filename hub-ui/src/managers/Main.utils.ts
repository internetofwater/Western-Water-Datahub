/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExtendedFeatureCollection } from '@/managers/types';

export const getNextLink = (featureCollection: ExtendedFeatureCollection): string | undefined => {
  if (!featureCollection?.links?.length) {
    return;
  }

  const nextLink = featureCollection.links.find((link) => link.rel === 'next')?.href;

  return nextLink;
};
