/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { ActionIcon, Box, Divider, Image, Stack, Text, Title } from '@mantine/core';
import X from '@/assets/X';
import styles from '@/features/Panel/Panel.module.css';
import useSessionStore from '@/stores/session';

export const Header: React.FC = () => {
  const setOverlay = useSessionStore((state) => state.setOverlay);

  return (
    <Box className={styles.header}>
      <ActionIcon
        size="sm"
        variant="transparent"
        onClick={() => setOverlay(null)}
        className={styles.mobileClose}
      >
        <X />
      </ActionIcon>
      <Stack gap="var(--default-spacing)" align="center">
        <Image
          darkHidden
          src="/BofR-logo-dark.png"
          alt="United States Bureau of Reclamation Logo"
          h={60}
          style={{
            maxHeight: '60px',
            height: 'auto',
            width: 'auto',
          }}
          fit="contain"
        />
        <Image
          lightHidden
          src="/BofR-logo-white.png"
          alt="United States Bureau of Reclamation Logo"
          h={60}
          style={{
            maxHeight: '60px',
            height: 'auto',
            width: 'auto',
          }}
          fit="contain"
        />

        <Title order={1} size="h2" className={styles.title}>
          Western Water Data Hub
        </Title>
        <Text size="sm">Application in Development</Text>
        <Divider size="md" w="100%" />
      </Stack>
    </Box>
  );
};
