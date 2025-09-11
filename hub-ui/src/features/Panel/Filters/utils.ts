/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { ComboboxItem } from "@mantine/core";

export type ItemWithSource = ComboboxItem & { source?: string };

export const formatOptions = (
  features: Feature<Geometry, GeoJsonProperties>[],
  getValueProperty: (feature: Feature<Geometry, GeoJsonProperties>) => string,
  getLabelProperty: (feature: Feature<Geometry, GeoJsonProperties>) => string,
  source?: string,
): ItemWithSource[] => {
  const options = new Map<string, ItemWithSource>();
  //   options.set('all', { value: defaultValue, label: defaultLabel });
  features.forEach((feature) => {
    if (feature.properties) {
      // Value and label must be a string
      const value = getValueProperty(feature);
      const label = getLabelProperty(feature);

      if (!options.has(value)) {
        options.set(value, {
          value,
          label,
          source,
        });
      }
    }
  });

  return Array.from(options.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
};
