/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

export const getUnitShorthand = (unit: string) => {
  const lowercaseUnit = unit.toLowerCase();

  switch (lowercaseUnit) {
    case 'miles':
      return 'mi';
    case 'feet':
      return 'ft';
    case 'kilometers':
      return 'km';
    default:
      return unit;
  }
};
