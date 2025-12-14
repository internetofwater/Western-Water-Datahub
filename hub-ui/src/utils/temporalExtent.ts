/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICollection } from '@/services/edr.service';

const hasTemporalExtent = (collection: ICollection) => {
  return (
    collection.extent &&
    collection.extent.temporal &&
    collection.extent.temporal.interval &&
    collection.extent.temporal.interval.length === 1 &&
    collection.extent.temporal.interval[0].length === 2
  );
};

export const getTemporalExtent = (
  collection: ICollection
): { min: string | null; max: string | null } | null => {
  if (hasTemporalExtent(collection)) {
    const [min, max] = collection!.extent!.temporal!.interval[0];

    return {
      min,
      max,
    };
  }
  return null;
};
