/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

export const chunk = <T>(array: T[], size: number): T[][] => {
  if (array.length === 0 || size === 0) {
    return [];
  }

  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
};
