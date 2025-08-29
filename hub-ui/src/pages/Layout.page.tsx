/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Group, Stack } from "@mantine/core";
import Download from "@/features/Download";
import DownloadModal from "@/features/Download/Modal";
import Loading from "@/features/Loading";
import Map from "@/features/Map";
import MapTools from "@/features/Map/Tools";
import Notifications from "@/features/Notifications";
import Panel from "@/features/Panel";
import styles from "@/pages/pages.module.css";

export const LayoutPage: React.FC = () => {
  return (
    <Box className={styles.root}>
      <Stack gap={0} className={styles.contentWrapper}>
        <Group gap={0} align="flex-start" className={styles.primaryWrapper}>
          <Panel />
          <Stack gap={0} className={styles.right}>
            <Download />
            <Map accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN} />
            <Notifications />
          </Stack>
        </Group>
        <Loading desktop />
      </Stack>
      <MapTools />
      <DownloadModal />
    </Box>
  );
};
