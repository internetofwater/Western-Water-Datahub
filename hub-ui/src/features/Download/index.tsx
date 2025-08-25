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
  const setDownloadModalOpen = useSessionStore((state) => state.setDownloadModalOpen);

  const hasLocations = locations.length > 0;

  return (
    <Box className={styles.downloadButtonWrapper}>
      <>
        {hasLocations && (
          <Button onClick={() => setDownloadModalOpen(true)}>
            Download {locations.length} Site(s)
          </Button>
        )}
      </>
    </Box>
  );
};

export default Download;
