/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export const getProviderLabel = (length: number): string => {
  if (length === 1) {
    return "provider";
  }

  return "providers";
};

export const getCategoryLabel = (length: number): string => {
  if (length === 1) {
    return "category";
  }

  return "categories";
};
