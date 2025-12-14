/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { TLocation } from "@/stores/main/types";

export const groupLocationIdsByCollection = (
  locations: TLocation[],
): Record<TLocation["collectionId"], Array<TLocation["id"]>> => {
  return locations.reduce(
    (acc, location) => {
      const { collectionId, id } = location;
      if (!acc[collectionId]) {
        acc[collectionId] = [];
      }
      acc[collectionId].push(id);
      return acc;
    },
    {} as Record<TLocation["collectionId"], Array<TLocation["id"]>>,
  );
};
