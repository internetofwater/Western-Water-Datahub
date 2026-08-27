/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Box, Group, Notification, Stack, Text } from '@mantine/core';
import Controls from '@/features/Controls';
import DownloadModal from '@/features/Download/Modal';
import InfoModal from '@/features/Info/Modal';
import Loading from '@/features/Loading';
import Map from '@/features/Map';
import MapTools from '@/features/Map/Tools';
import Notifications from '@/features/Notifications';
import Panel from '@/features/Panel';
import styles from '@/pages/pages.module.css';

export const LayoutPage: React.FC = () => {
  const [showNotification, setShowNotification] = useState(true);

  const handleClick = () => {
    setShowNotification(!showNotification);
  };

  return (
    <Box className={styles.root}>
      <Stack gap={0} className={styles.contentWrapper}>
        <Group gap={0} align="flex-start" className={styles.primaryWrapper}>
          <Panel />
          <Stack gap={0} className={styles.right}>
            <Controls />
            <Map accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN} />
            {showNotification && (
              <Notification
                className={styles.notification}
                classNames={{
                  description: styles.description,
                }}
                title={
                  <Text size="lg" fw={700}>
                    Application Under Development
                  </Text>
                }
                withCloseButton
                onClick={handleClick}
              >
                <Stack gap="var(--default-spacing)">
                  <Text size="md">
                    Some features may not work as expected and the presentation and availability of
                    data may change.
                  </Text>
                  <Text size="md">
                    For questions or feedback, please contact the Bureau of Reclamation at
                    data@usbr.gov.
                  </Text>
                </Stack>
              </Notification>
            )}
            <Notifications />
            <Loading />
          </Stack>
        </Group>
      </Stack>
      <MapTools />
      <DownloadModal />
      <InfoModal />
    </Box>
  );
};
