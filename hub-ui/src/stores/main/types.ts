/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature, FeatureCollection, Polygon } from 'geojson';
import { ColorSpecification, PropertyValueSpecification } from 'mapbox-gl';
import { Properties } from '@/components/Map/types';
import { ICollection } from '@/services/edr.service';
import { PaletteDefinition } from '@/utils/colors/types';
import { ICollectionSlice } from './slices/collections';
import { ILayerSlice } from './slices/layers';
import { ILocationSlice } from './slices/locations';
import { IParameterSlice } from './slices/parameters';

export type ColorValueHex = `#${string}`;

enum ESpatialSelectionType {
  Drawn = 'custom-drawn-polygon',
  Selected = 'select-existing-polygons',
  Upload = 'custom-upload-shape',
}

interface ISpatialSelectionBase {
  type: ESpatialSelectionType;
}

interface ISpatialSelectionDrawn extends ISpatialSelectionBase {
  type: ESpatialSelectionType.Drawn;
  shapes: FeatureCollection<Polygon, Properties>[];
}

interface ISpatialSelectionUpload extends ISpatialSelectionBase {
  type: ESpatialSelectionType.Upload;
  shapes: FeatureCollection<Polygon, Properties>[];
}

interface ISpatialSelectionSelected extends ISpatialSelectionBase {
  type: ESpatialSelectionType.Selected;
  locations: string[]; // location IDs
}

// Discriminated union for all spatial selection types
export type TSpatialSelection =
  | ISpatialSelectionDrawn
  | ISpatialSelectionUpload
  | ISpatialSelectionSelected;

export enum EDatasourceType {
  Point = 'point',
  Line = 'line',
  Polygon = 'polygon',
  Raster = 'raster',
}

// Allows for basic string colors (hex, rgba etc) or an expression
export type TColor = PropertyValueSpecification<ColorSpecification>;

export type TLayer = {
  id: string; // uuid
  collectionId: ICollection['id'];
  color: TColor;
  parameters: string[];
  from: string | null;
  to: string | null;
  visible: boolean; // visible ? 'visible' : 'none'
  opacity: number;
  position: number; // The order this layer is drawn relative to other user layers
  paletteDefinition: PaletteDefinition | null;
  loaded: boolean;
};

export type TLocation = {
  id: string; // location/{this}
  collectionId: ICollection['id'];
};

export type TGeographyFilter = {
  itemId: string;
  collectionId: ICollection['id'];
  feature: Feature<Polygon>;
};

export type TCategory = {
  value: string;
  label: string;
};

export type TParameter = {
  collectionId: ICollection['id'];
  parameters: string[];
};

export type MainState = {
  provider: string | null;
  setProvider: (provider: MainState['provider']) => void;
  category: TCategory | null;
  setCategory: (category: MainState['category']) => void;
  selectedCollections: string[];
  setSelectedCollections: (collection: MainState['selectedCollections']) => void;
  geographyFilter: TGeographyFilter | null;
  setGeographyFilter: (geographyFilter: MainState['geographyFilter']) => void;
  hasGeographyFilter: () => boolean;
} & ICollectionSlice &
  ILayerSlice &
  ILocationSlice &
  IParameterSlice;
