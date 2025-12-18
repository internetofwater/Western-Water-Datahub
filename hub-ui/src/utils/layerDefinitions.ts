/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CircleLayerSpecification,
  ExpressionSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  RasterLayerSpecification,
} from "mapbox-gl";
import { LayerType } from "@/components/Map/types";
import {
  DEFAULT_FILL_OPACITY,
  DEFAULT_RASTER_OPACITY,
} from "@/features/Map/consts";
import { TColor, TLocation } from "@/stores/main/types";

export const getPointLayerDefinition = (
  layerId: string,
  sourceId: string,
  color: TColor,
): CircleLayerSpecification => {
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
  color: TColor = "#000",
): LineLayerSpecification => {
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
  color: TColor = "#000",
): FillLayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Fill,
    source: sourceId,
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: {
      "fill-opacity": DEFAULT_FILL_OPACITY,
      "fill-color": color,
    },
  };
};
export const getRasterLayerSpecification = (
  layerId: string,
  sourceId: string,
): RasterLayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Raster,
    source: sourceId,
    paint: {
      "raster-opacity": DEFAULT_RASTER_OPACITY,
    },
  };
};

export const getSelectedColor = (
  locationIds: Array<TLocation["id"]>,
  originalColor: TColor = "#000",
): ExpressionSpecification => {
  return [
    "case",
    ["in", ["id"], ["literal", locationIds]],
    "#FFF",
    originalColor,
  ];
};
