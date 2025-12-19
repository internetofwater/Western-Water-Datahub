/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature } from "geojson";
import { GeoJSONFeature, Map } from "mapbox-gl";
import mainManager from "@/managers/Main.init";
import { DATES_PROPERTY } from "@/services/coverageGrid.service";
import { ICollection } from "@/services/edr.service";

const getDatesFromProperties = (
  feature: GeoJSONFeature | Feature,
): string[] => {
  if (feature.properties) {
    const dates = feature.properties[DATES_PROPERTY] as string[] | string;

    if (Array.isArray(dates)) {
      return dates;
    } else if (typeof dates === "string") {
      const parsedDates = JSON.parse(dates) as string[];
      return parsedDates;
    }
  }

  throw new Error("No properties found on this feature.");
};

export const getDates = async (
  map: Map,
  collectionId: ICollection["id"],
): Promise<string[]> => {
  const { pointLayerId, lineLayerId, fillLayerId } =
    mainManager.getLocationsLayerIds(collectionId);

  // For speed of access, check map first
  const features = map.queryRenderedFeatures({
    layers: [pointLayerId, lineLayerId, fillLayerId],
  });

  if (features.length > 0) {
    const feature = features[0];
    return getDatesFromProperties(feature);
  }

  // Fallback to more costly potential fetch
  const featureCollection = await mainManager.getFeatures(collectionId);
  if (featureCollection.features.length > 0) {
    const feature = featureCollection.features[0];

    return getDatesFromProperties(feature);
  }

  throw new Error("No features found.");
};
