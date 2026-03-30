/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Box, Button } from "@mantine/core";
import Tooltip from "@/components/Tooltip";
import { useMap } from "@/contexts/MapContexts";
import { MAP_ID } from "@/features/Map/config";
import { useLoading } from "@/hooks/useLoading";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";

export const Reset: React.FC = () => {
  const hasGeographyFilter = useMainStore((state) => state.hasGeographyFilter);

  const [hasLocationsLoaded, setHasLocationsLoaded] = useState(false);

  const { isLoadingGeography, isFetchingCollections, isFetchingLocations } =
    useLoading();

  const { map, persistentPopup } = useMap(MAP_ID);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.on("styledata", () => {
      const collections = useMainStore.getState().collections;
      const layers = map.getStyle().layers;
      setHasLocationsLoaded(
        layers.some((layer) =>
          collections.some((collection) =>
            Object.values(
              mainManager.getLocationsLayerIds(collection.id),
            ).includes(layer.id),
          ),
        ),
      );
    });
  }, [map]);

  const getLabel = () => {
    if (isLoadingGeography) {
      return "Please wait for geography filter to load";
    }

    if (isFetchingCollections) {
      return "Please wait for data sources request to complete";
    }

    if (isFetchingLocations) {
      return "Please wait for locations request to complete";
    }

    if (!hasLocationsLoaded && !hasGeographyFilter()) {
      return "No locations or geography to clear";
    }

    return "Clear all map data and selections in the side panel.";
  };

  const isDisabled =
    isFetchingCollections ||
    isFetchingLocations ||
    isLoadingGeography ||
    !(hasLocationsLoaded || hasGeographyFilter());

  const handleClick = () => {
    // User has a popup open that may not be relevant any longer
    if (persistentPopup && persistentPopup.isOpen()) {
      persistentPopup.remove();
    }

    mainManager.clearAllData();
  };

  return (
    <Box mt="auto">
      <Tooltip label={getLabel()}>
        <Button
          disabled={isDisabled}
          data-disabled={isDisabled}
          onClick={handleClick}
          color="red-rocks"
        >
          Reset
        </Button>
      </Tooltip>
    </Box>
  );
};
