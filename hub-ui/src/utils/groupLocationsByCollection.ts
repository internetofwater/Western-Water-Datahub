/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Location } from "@/stores/main/types";

export const groupLocationIdsByCollection = (
  locations: Location[],
): Record<Location["collectionId"], Array<Location["id"]>> => {
  return locations.reduce(
    (acc, location) => {
      const { collectionId, id } = location;
      if (!acc[collectionId]) {
        acc[collectionId] = [];
      }
      acc[collectionId].push(id);
      return acc;
    },
    {} as Record<Location["collectionId"], Array<Location["id"]>>,
  );
};
