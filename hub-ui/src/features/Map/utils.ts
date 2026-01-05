/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
  ExpressionSpecification,
  FilterSpecification,
  LayerSpecification,
} from "mapbox-gl";
import { LayerType } from "@/components/Map/types";
import { idStoreProperty } from "@/consts/collections";
import { DEFAULT_FILL_OPACITY } from "@/features/Map/consts";
import { TLayer, TLocation } from "@/stores/main/types";

export const getDefaultFilter = (
  type: LayerType,
): FilterSpecification | undefined => {
  switch (type) {
    case LayerType.Circle:
      return ["==", ["geometry-type"], "Point"];
    case LayerType.Line:
      return [
        "any",
        ["==", ["geometry-type"], "Polygon"],
        ["==", ["geometry-type"], "LineString"],
      ];
    case LayerType.Fill:
      return ["==", ["geometry-type"], "Polygon"];
  }
};

export const getPointLayerDefinition = (
  layerId: string,
  sourceId: string,
  color: TLayer["color"],
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Circle,
    source: sourceId,
    filter: getDefaultFilter(LayerType.Circle),
    paint: {
      "circle-radius": 6,
      "circle-color": color,
      "circle-stroke-width": 2,
      "circle-stroke-color": getSelectedColor([]),
    },
  };
};
export const getLineLayerDefinition = (
  layerId: string,
  sourceId: string,
  color: TLayer["color"] = "#000",
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Line,
    source: sourceId,
    filter: getDefaultFilter(LayerType.Line),
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },

    paint: {
      "line-opacity": 1,
      "line-color": color,
      "line-width": 4,
    },
  };
};
export const getFillLayerDefinition = (
  layerId: string,
  sourceId: string,
  color: TLayer["color"] = "#000",
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Fill,
    source: sourceId,
    filter: getDefaultFilter(LayerType.Fill),
    paint: {
      "fill-opacity": DEFAULT_FILL_OPACITY,
      "fill-color": color,
    },
  };
};

export const getSelectedColor = (
  locationIds: Array<TLocation["id"]>,
  originalColor: TLayer["color"] = "#000",
): ExpressionSpecification => {
  return [
    "case",
    [
      "in",
      ["to-string", ["coalesce", ["get", idStoreProperty], ["id"]]],
      ["literal", locationIds],
    ],
    "#FFF",
    originalColor,
  ];
};

export const getFilter = (
  locationIds: Array<TLocation["id"]>,
  type: LayerType,
): ExpressionSpecification => {
  return [
    "all",
    getDefaultFilter(type),
    [
      "in",
      ["to-string", ["coalesce", ["get", idStoreProperty], ["id"]]],
      ["literal", locationIds],
    ],
  ];
};

export const getSortKey = (
  locationIds: Array<TLocation["id"]>,
): ExpressionSpecification => {
  return [
    "case",
    [
      "in",
      ["to-string", ["coalesce", ["get", idStoreProperty], ["id"]]],
      ["literal", locationIds],
    ],
    1,
    0,
  ];
};
