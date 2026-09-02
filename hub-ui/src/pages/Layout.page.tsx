/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Anchor, Box, Group, Notification, Stack, Text } from '@mantine/core';
import Controls from '@/features/Controls';
import DownloadModal from '@/features/Download/Modal';
import InfoModal from '@/features/Info/Modal';
import { DATA_USBR_MAILTO } from '@/features/Info/Modal/consts';
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
        <Group gap={0} align="stretch" className={styles.primaryWrapper}>
          <Panel />
          <Stack gap={0} className={styles.right}>
            <Controls />
            <Map accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN} />
            {showNotification && (
              <Notification
                className={styles.notification}
                classNames={{
                  description: styles.description,
                  closeButton: styles.closeButton,
                }}
                title={
                  <Text size="md" fw={700}>
                    Application Under Development
                  </Text>
                }
                closeButtonProps={{
                  size: 'lg',
                }}
                withCloseButton
                onClose={handleClick}
              >
                <Stack gap="var(--default-spacing)">
                  <Text size="sm">
                    Some features may not work as expected and the presentation and availability of
                    data may change.
                  </Text>
                  <Text size="sm">
                    For questions or feedback, please contact the Bureau of Reclamation at{' '}
                    <Anchor href={DATA_USBR_MAILTO} c="blue.8">
                      data@usbr.gov
                    </Anchor>
                    .
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
