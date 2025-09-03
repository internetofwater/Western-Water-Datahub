/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { Button, Tooltip } from '@mantine/core';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID } from '@/features/Map/config';
import loadingManager from '@/managers/Loading.init';
import mainManager from '@/managers/Main.init';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { LoadingType } from '@/stores/session/types';

export const ClearAllData: React.FC = () => {
  const hasGeographyFilter = useMainStore((state) => state.hasGeographyFilter);

  const loadingInstances = useSessionStore((state) => state.loadingInstances);

  const [isLoadingGeography, setIsLoadingGeography] = useState(false);
  const [isFetchingCollections, setIsFetchingCollections] = useState(false);
  const [hasLocationsLoaded, setHasLocationsLoaded] = useState(false);

  const { map } = useMap(MAP_ID);

  useEffect(() => {
    setIsFetchingCollections(loadingManager.has({ type: LoadingType.Collections }));
    setIsLoadingGeography(loadingManager.has({ type: LoadingType.Geography }));
  }, [loadingInstances]);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.on('styledata', () => {
      const collections = useMainStore.getState().collections;
      const layers = map.getStyle().layers;
      setHasLocationsLoaded(
        layers.some((layer) =>
          collections.some(
            (collection) => mainManager.getLocationsLayerId(collection.id) === layer.id
          )
        )
      );
    });
  }, [map]);

  const getLabel = () => {
    if (isLoadingGeography) {
      return 'Please wait for geography filter to load';
    }

    if (isFetchingCollections) {
      return 'Please wait for collections request to complete';
    }

    if (!hasLocationsLoaded && !hasGeographyFilter()) {
      return 'No locations or geography to clear';
    }
  };

  return (
    <>
      {!isFetchingCollections &&
      !isLoadingGeography &&
      (hasLocationsLoaded || hasGeographyFilter()) ? (
        <Button onClick={() => mainManager.clearAllData()} color="red">
          Clear
        </Button>
      ) : (
        <Tooltip label={getLabel()}>
          <Button data-disabled onClick={(event) => event.preventDefault()} color="red">
            Clear
          </Button>
        </Tooltip>
      )}
    </>
  );
};
