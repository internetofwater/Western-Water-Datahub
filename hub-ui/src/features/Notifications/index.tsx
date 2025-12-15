/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box, Notification, Stack } from '@mantine/core';
import styles from '@/features/Notifications/Notifications.module.css';
import notificationManager from '@/managers/Notification.init';
import useSessionStore from '@/stores/session';
import { ENotificationType } from '@/stores/session/types';

const Notifications: React.FC = () => {
  const notifications = useSessionStore((state) => state.notifications);

  const getColor = (type: ENotificationType) => {
    switch (type) {
      case ENotificationType.Error:
        return 'red';
      case ENotificationType.Success:
        return 'green';
      case ENotificationType.Info:
      default:
        return undefined;
    }
  };

  return (
    <Box className={styles.notificationsWrapper}>
      <Stack>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            color={getColor(notification.type)}
            onClose={() => notificationManager.hide(notification.id)}
            onMouseEnter={() => notificationManager.pause(notification.id)}
            onMouseLeave={() => notificationManager.resume(notification.id)}
          >
            {notification.message}
          </Notification>
        ))}
      </Stack>
    </Box>
  );
};

export default Notifications;
