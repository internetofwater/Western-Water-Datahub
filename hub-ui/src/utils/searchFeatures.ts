/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Feature, GeoJsonProperties } from "geojson";

export const searchFeatures = (
  searchTerm: string,
  features: Feature[],
): Feature[] => {
  if (searchTerm.length === 0) {
    return features;
  }

  const lower = searchTerm.toLowerCase();

  return features.filter((feature) => hasSearchTerm(lower, feature, true));
};

export const searchProperties = (
  searchTerm: string,
  properties: GeoJsonProperties,
): GeoJsonProperties => {
  if (searchTerm.length === 0) {
    return properties;
  }

  const lower = searchTerm.toLowerCase();

  return Object.entries(properties ?? {}).filter(
    ([key, value]) =>
      key.toLowerCase().includes(lower) ||
      String(value).toLowerCase().includes(lower),
  );
};

export const hasSearchTerm = (
  searchTerm: string,
  feature: Feature,
  isLower: boolean = false,
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }
  const { properties } = feature;

  if (!properties) {
    return false;
  }

  const lower = isLower ? searchTerm : searchTerm.toLowerCase();

  return Object.entries(properties ?? {}).some(
    ([key, value]) =>
      key.toLowerCase().includes(lower) ||
      String(value).toLowerCase().includes(lower),
  );
};
