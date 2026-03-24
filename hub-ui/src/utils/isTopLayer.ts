/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Map, Point } from "mapbox-gl";
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";

export const isTopLayer = (
  collectionId: ICollection["id"],
  map: Map,
  point: Point,
) => {
  // As layers can be added in any order, and reordered, perform manual check to ensure popup shows
  // for top layer in visual order
  const { pointLayerId, fillLayerId, lineLayerId } =
    mainManager.getLocationsLayerIds(collectionId);

  const layersToQuery = useMainStore.getState().layers.flatMap((layer) => {
    const layers = [];
    const { pointLayerId, fillLayerId, lineLayerId } =
      mainManager.getLocationsLayerIds(layer.collectionId);

    // queryRenderedFeatures errors if the layer is not present
    if (map.getLayer(pointLayerId)) {
      layers.push(pointLayerId);
    }

    if (map.getLayer(fillLayerId)) {
      layers.push(fillLayerId);
    }

    if (map.getLayer(lineLayerId)) {
      layers.push(lineLayerId);
    }

    return layers;
  });

  const renderedFeatures = map.queryRenderedFeatures(point, {
    layers: layersToQuery,
  });

  if (!renderedFeatures.length) {
    return false;
  }

  // This layer is on top of visual order
  const topLayerId = renderedFeatures[0]?.layer?.id ?? "";

  return [pointLayerId, fillLayerId, lineLayerId].includes(topLayerId);
};
