/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature, FeatureCollection, Polygon } from "geojson";
import { Properties } from "@/components/Map/types";
import { ICollection } from "@/services/edr.service";
import { ICollectionSlice } from "./slices/collections";
import { ILocationSlice } from "./slices/locations";
import { IParameterSlice } from "./slices/parameters";

export type ColorValueHex = `#${string}`;

enum ESpatialSelectionType {
  Drawn = "custom-drawn-polygon",
  Selected = "select-existing-polygons",
  Upload = "custom-upload-shape",
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
  Point = "point",
  Line = "line",
  Polygon = "polygon",
  Raster = "raster",
}

export type TLayer = {
  id: string; // uuid
  collectionId: ICollection["id"];
};

export type TLocation = {
  id: string; // location/{this}
  collectionId: ICollection["id"];
};

export type TGeographyFilter = {
  itemId: string;
  collectionId: ICollection["id"];
  feature: Feature<Polygon>;
};

export type TCategory = {
  value: string;
  label: string;
};

export type TParameter = {
  collectionId: ICollection["id"];
  parameters: string[];
};

export type MainState = {
  provider: string | null;
  setProvider: (provider: MainState["provider"]) => void;
  category: TCategory | null;
  setCategory: (category: MainState["category"]) => void;
  selectedCollections: string[];
  setSelectedCollections: (
    collection: MainState["selectedCollections"],
  ) => void;
  geographyFilter: TGeographyFilter | null;
  setGeographyFilter: (geographyFilter: MainState["geographyFilter"]) => void;
  hasGeographyFilter: () => boolean;
} & ICollectionSlice &
  ILocationSlice &
  IParameterSlice;
