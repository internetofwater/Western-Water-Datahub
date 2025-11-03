/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Button, Text, Tooltip } from '@mantine/core';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { Modal as ModalEnum } from '@/stores/session/types';

const Download: React.FC = () => {
  const locations = useMainStore((state) => state.locations);
  const setLocations = useMainStore((state) => state.setLocations);
  const setOpenModal = useSessionStore((state) => state.setOpenModal);

  const hasLocations = locations.length > 0;

  const helpDownloadText = (
    <>
      <Text size="sm">Curate data requests for selected requests.</Text>
      <br />
      <Text size="sm">
        Select parameters and an optional timeframe for locations across all displayed collections.
      </Text>
    </>
  );

  return (
    <>
      {hasLocations && (
        <>
          <Tooltip label={helpDownloadText}>
            <Button onClick={() => setOpenModal(ModalEnum.Download)}>
              Explore {locations.length} selected Location
              {locations.length !== 1 ? 's' : ''}
            </Button>
          </Tooltip>
          <Tooltip label="Deselect all selected locations">
            <Button onClick={() => setLocations([])} color="red-rocks">
              Clear selection
            </Button>
          </Tooltip>
        </>
      )}
    </>
  );
};

export default Download;
