/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { FeatureCollection } from 'geojson';
import {
  CoverageAxesSegments,
  CoverageAxesValues,
  CoverageCollection,
  CoverageJSON,
} from '@/services/edr.service';

export const isCoverageCollection = (
  object: CoverageCollection | CoverageJSON | FeatureCollection
): object is CoverageCollection => {
  return object?.type === 'CoverageCollection';
};

export const isCoverageJSON = (
  object: CoverageCollection | CoverageJSON | FeatureCollection
): object is CoverageJSON => {
  return Boolean(object?.type) && object.type === 'Coverage';
};

export const isAxesValues = (
  object: CoverageAxesSegments | CoverageAxesValues
): object is CoverageAxesValues => {
  return object && 'values' in object && Array.isArray(object.values);
};

export const isFeatureCollection = (
  object: CoverageCollection | CoverageJSON | FeatureCollection
): object is CoverageJSON => {
  return Boolean(object?.type) && object.type === 'FeatureCollection';
};
