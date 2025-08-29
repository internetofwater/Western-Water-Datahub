/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { Box, Button, Tooltip } from '@mantine/core';
import styles from '@/features/Panel/Panel.module.css';
import loadingManager from '@/managers/Loading.init';
import mainManager from '@/managers/Main.init';
import notificationManager from '@/managers/Notification.init';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { NotificationType } from '@/stores/session/types';

export const UpdateLocationsButton: React.FC = () => {
  const provider = useMainStore((state) => state.provider);
  const collection = useMainStore((state) => state.collection);

  const [isLoadingGeography, setIsLoadingGeography] = useState(false);

  const hasLoadingInstance = useSessionStore((state) => state.hasLoadingInstance);
  const loadingInstances = useSessionStore((state) => state.loadingInstances);

  const addData = async () => {
    const loadingInstance = loadingManager.add('Fetching Locations');
    try {
      await mainManager.getLocations();
      loadingManager.remove(loadingInstance);
      notificationManager.show('Done fetching data', NotificationType.Success);
    } catch (error) {
      if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(`Error: ${_error.message}`, NotificationType.Error, 10000);
      }
      loadingManager.remove(loadingInstance);
    }
  };

  useEffect(() => {
    setIsLoadingGeography(hasLoadingInstance('geography filter'));
  }, [loadingInstances]);

  return (
    <Box className={styles.updateLocationsWrapper}>
      {(provider || collection) && !isLoadingGeography ? (
        <Button onClick={() => void addData()}>Update Locations</Button>
      ) : (
        <Tooltip
          label={
            !(provider || collection)
              ? 'Please select a provider or collection'
              : 'Please wait for geography filter to load'
          }
        >
          <Button data-disabled onClick={(event) => event.preventDefault()}>
            Update Locations
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};
