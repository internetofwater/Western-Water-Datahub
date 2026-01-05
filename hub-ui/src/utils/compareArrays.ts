/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

export const isSameArray = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  const sorted1 = [...a].sort();
  const sorted2 = [...b].sort();

  return sorted1.every((val, index) => val === sorted2[index]);
};
