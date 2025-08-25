/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature, FeatureCollection, Polygon } from 'geojson';
import { Properties } from '@/components/Map/types';

export type ColorValueHex = `#${string}`;

enum SpatialSelectionType {
  Drawn = 'custom-drawn-polygon',
  Selected = 'select-existing-polygons',
  Upload = 'custom-upload-shape',
}

interface SpatialSelectionBase {
  type: SpatialSelectionType;
}

interface SpatialSelectionDrawn extends SpatialSelectionBase {
  type: SpatialSelectionType.Drawn;
  shapes: FeatureCollection<Polygon, Properties>[];
}

interface SpatialSelectionUpload extends SpatialSelectionBase {
  type: SpatialSelectionType.Upload;
  shapes: FeatureCollection<Polygon, Properties>[];
}

interface SpatialSelectionSelected extends SpatialSelectionBase {
  type: SpatialSelectionType.Selected;
  locations: string[]; // location IDs
}

// Discriminated union for all spatial selection types
export type SpatialSelection =
  | SpatialSelectionDrawn
  | SpatialSelectionUpload
  | SpatialSelectionSelected;

export enum DatasourceType {
  Point = 'point',
  Line = 'line',
  Polygon = 'polygon',
  Raster = 'raster',
}

export type Collection = {
  id: string;
  provider: string;
  category: string;
  dataset: string;
  time?: string;
};

export type Layer = {
  id: string; // uuid
  collectionId: Collection['id'];
};

export type Location = {
  id: string | number; // location/{this}
  collectionId: Collection['id'];
};

export type GeographyFilter = {
  itemId: string;
  collectionId: Collection['id'];
  feature: Feature<Polygon>;
};

export interface MainState {
  provider: string | null;
  setProvider: (provider: MainState['provider']) => void;
  category: string | null;
  setCategory: (category: MainState['category']) => void;
  dataset: string | null;
  setDataset: (dataset: MainState['dataset']) => void;
  geographyFilter: GeographyFilter | null;
  setGeographyFilter: (geographyFilter: MainState['geographyFilter']) => void;
  hasGeographyFilter: () => boolean;
  collections: Collection[];
  setCollections: (collections: MainState['collections']) => void;
  addCollection: (collection: Collection) => void;
  hasCollection: (collectionId: Collection['id']) => boolean;
  locations: Location[];
  setLocations: (locations: MainState['locations']) => void;
  addLocation: (location: Location) => void;
  hasLocation: (locationId: Location['id']) => boolean;
  removeLocation: (locationId: Location['id']) => void;
}
