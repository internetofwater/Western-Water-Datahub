/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box, Button } from '@mantine/core';
import styles from '@/features/Download/Download.module.css';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';

const Download: React.FC = () => {
  const locations = useMainStore((state) => state.locations);
  const setLocations = useMainStore((state) => state.setLocations);
  const setDownloadModalOpen = useSessionStore((state) => state.setDownloadModalOpen);

  const hasLocations = locations.length > 0;

  return (
    <Box className={styles.downloadButtonWrapper}>
      {hasLocations && (
        <>
          <Button onClick={() => setDownloadModalOpen(true)}>
            Download {locations.length} Location{locations.length !== 1 ? 's' : ''}
          </Button>
          <Button onClick={() => setLocations([])} color="red-rocks">
            Clear selection
          </Button>
        </>
      )}
    </Box>
  );
};

export default Download;
