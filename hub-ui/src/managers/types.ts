/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILink } from "@ogcapi-js/shared";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";
import { TLayer } from "@/stores/main/types";

export type SourceOptions = {
  filterFeatures?: Feature<Polygon | MultiPolygon>[];
  signal?: AbortSignal;
  parameterNames?: string[];
  from?: string | null;
  to?: string | null;
  noFetch?: boolean;
  paletteDefinition?: TLayer["paletteDefinition"];
  includeGeography?: boolean;
};

export type StyleOptions<T extends GeoJsonProperties> = {
  features?: Feature<Geometry, T>[];
  signal?: AbortSignal;
  updateStore?: boolean;
};

export type ExtendedFeatureCollection<
  T extends Geometry = Geometry,
  V extends GeoJsonProperties = GeoJsonProperties,
> = FeatureCollection<T, V> & {
  links?: ILink[];
  numberMatched?: number;
  numberReturned?: number;
  timeStamp?: string;
};
