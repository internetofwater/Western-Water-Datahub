/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Button, Tooltip } from '@mantine/core';
import loadingManager from '@/managers/Loading.init';
import mainManager from '@/managers/Main.init';
import notificationManager from '@/managers/Notification.init';
import useMainStore from '@/stores/main';
import { NotificationType } from '@/stores/session/types';

export const UpdateCollectionsButton: React.FC = () => {
  const provider = useMainStore((state) => state.provider);

  const addData = async () => {
    const instance = loadingManager.add('Fetching Collections');

    mainManager.getLocations();
    loadingManager.remove(instance);
    notificationManager.show('Done fetching data', NotificationType.Success);
  };

  return provider ? (
    <Button onClick={() => void addData()}>Update Data</Button>
  ) : (
    <Tooltip label="Please select a provider">
      <Button data-disabled onClick={(event) => event.preventDefault()}>
        Update Data
      </Button>
    </Tooltip>
  );
};
