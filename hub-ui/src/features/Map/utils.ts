/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ExpressionSpecification, LayerSpecification } from "mapbox-gl";
import { Location } from "@/stores/main/types";

export const getPointLayerDefinition = (
  layerId: string,
  sourceId: string,
): LayerSpecification => {
  return {
    id: layerId,
    source: sourceId,
    type: "circle",
    paint: {
      "circle-radius": 6,
      "circle-color": "#B42222",
      "circle-stroke-width": 2,
      "circle-stroke-color": getCircleStrokeColor([]),
    },
  };
};

export const getCircleStrokeColor = (
  locationIds: Array<Location["id"]>,
): ExpressionSpecification => {
  return ["case", ["in", ["id"], ["literal", locationIds]], "#FFF", "#000"];
};
