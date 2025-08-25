/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { SourceId } from "./sources";

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
