/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { Divider, Image, Stack, Title } from '@mantine/core';
import styles from '@/features/Panel/Panel.module.css';

export const Header: React.FC = () => {
  return (
    <Stack p="lg">
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
      <Divider />
      <Title order={1} size="h3" className={styles.title}>
        Western Water Data Hub
      </Title>
    </Stack>
  );
};
