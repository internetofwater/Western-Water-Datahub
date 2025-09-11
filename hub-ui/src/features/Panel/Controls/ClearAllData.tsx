/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Button, Tooltip } from "@mantine/core";
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

  const { map } = useMap(MAP_ID);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.on("styledata", () => {
      const collections = useMainStore.getState().collections;
      const layers = map.getStyle().layers;
      setHasLocationsLoaded(
        layers.some((layer) =>
          collections.some(
            (collection) =>
              mainManager.getLocationsLayerId(collection.id) === layer.id,
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
      return "Please wait for collections request to complete";
    }

    if (isFetchingLocations) {
      return "Please wait for locations request to complete";
    }

    if (!hasLocationsLoaded && !hasGeographyFilter()) {
      return "No locations or geography to clear";
    }
  };

  return (
    <>
      {!isFetchingCollections &&
      !isFetchingLocations &&
      !isLoadingGeography &&
      (hasLocationsLoaded || hasGeographyFilter()) ? (
        <Button onClick={() => mainManager.clearAllData()} color="red-rocks">
          Reset
        </Button>
      ) : (
        <Tooltip label={getLabel()}>
          <Button
            data-disabled
            onClick={(event) => event.preventDefault()}
            color="red-rocks"
          >
            Reset
          </Button>
        </Tooltip>
      )}
    </>
  );
};
