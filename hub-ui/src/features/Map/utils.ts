/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ExpressionSpecification, LayerSpecification } from "mapbox-gl";
import { LayerType } from "@/components/Map/types";
import { Location } from "@/stores/main/types";

export const getPointLayerDefinition = (
  layerId: string,
  sourceId: string,
  color: string,
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Circle,
    source: sourceId,
    filter: ["==", ["geometry-type"], "Point"],
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
  color: string = "#000",
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Line,
    source: sourceId,
    filter: [
      "any",
      ["==", ["geometry-type"], "Polygon"],
      ["==", ["geometry-type"], "LineString"],
    ],
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
  color: string = "#000",
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Fill,
    source: sourceId,
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: {
      "fill-opacity": 0.7,
      "fill-color": color,
    },
  };
};

export const getSelectedColor = (
  locationIds: Array<Location["id"]>,
  originalColor: string = "#000",
): ExpressionSpecification => {
  return [
    "case",
    ["in", ["id"], ["literal", locationIds]],
    "#FFF",
    originalColor,
  ];
};
