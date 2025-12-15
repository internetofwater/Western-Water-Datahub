/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useRef } from 'react';
import { Button, Text } from '@mantine/core';
import Tooltip from '@/components/Tooltip';
import { useLoading } from '@/hooks/useLoading';
import loadingManager from '@/managers/Loading.init';
import mainManager from '@/managers/Main.init';
import notificationManager from '@/managers/Notification.init';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { LoadingType, NotificationType, Tool } from '@/stores/session/types';

export const ShowLocations: React.FC = () => {
  const provider = useMainStore((state) => state.provider);
  const selectedCollections = useMainStore((state) => state.selectedCollections);
  const setOpenTools = useSessionStore((state) => state.setOpenTools);

  const { isLoadingGeography, isFetchingCollections, isFetchingLocations } = useLoading();

  const isFirstTime = useRef(true);

  const addData = async () => {
    const loadingInstance = loadingManager.add('Fetching Locations', LoadingType.Locations);
    try {
      await mainManager.createLayer();
      loadingManager.remove(loadingInstance);
      if (isFirstTime.current) {
        isFirstTime.current = false;
        setOpenTools(Tool.Legend, true);
      }
      notificationManager.show('Done fetching data', NotificationType.Success);
    } catch (error) {
      if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(`Error: ${_error.message}`, NotificationType.Error, 10000);
      }
      loadingManager.remove(loadingInstance);
    }
  };

  const getLabel = () => {
    if (isLoadingGeography) {
      return 'Please wait for geography filter to load';
    }

    if (isFetchingCollections) {
      return 'Please wait for collections request to complete';
    }

    if (isFetchingLocations) {
      return 'Please wait for locations request to complete';
    }

    if (!(provider || selectedCollections.length > 0)) {
      return 'Please select a provider or collection';
    }

    return (
      <>
        <Text size="sm">Show locations for all selected collections.</Text>
        <br />
        <Text size="sm">
          Access scientific measurements, place names, and other data points through location shapes
          on the map.
        </Text>
      </>
    );

    ('');
  };

  const isDisabled =
    isLoadingGeography ||
    isFetchingCollections ||
    isFetchingLocations ||
    !(provider || selectedCollections.length > 0);

  return (
    <Tooltip multiline label={getLabel()}>
      <Button disabled={isDisabled} data-disabled={isDisabled} onClick={() => void addData()}>
        Show Locations
      </Button>
    </Tooltip>
  );
};
