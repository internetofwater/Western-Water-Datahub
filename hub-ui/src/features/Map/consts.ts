/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { SourceId } from "@/features/Map/sources";

/**
 *
 * @constant
 */
export const RegionsSource =
  "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/DOI_Unified_Regions/FeatureServer/0";

/**
 *
 * @constant
 */
export const ValidStates = [
  "ND",
  "SD",
  "KS",
  "OK",
  "TX",
  "NM",
  "NE",
  "CO",
  "ID",
  "UT",
  "NV",
  "AZ",
  "MT",
  "CA",
  "OR",
  "WA",
];

export const GeographyFilterSources = [
  SourceId.DoiRegions,
  SourceId.Huc02,
  SourceId.States,
];

export const DEFAULT_RASTER_OPACITY = 0.5;
export const DEFAULT_FILL_OPACITY = 0.7;
export const DEFAULT_BBOX: [number, number, number, number] = [
  -125.375977, 25.799891, -89.077148, 49.582226,
];
