/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Select, Stack, Title, Tooltip, VisuallyHidden } from '@mantine/core';
import Info from '@/assets/Info';
import styles from '@/features/Panel/Panel.module.css';
import useMainStore from '@/stores/main';

export const Provider: React.FC = () => {
  const provider = useMainStore((state) => state.provider);
  const setProvider = useMainStore((state) => state.setProvider);

  const helpText = 'Data Provider tooltip placeholder';

  return (
    <Stack gap={0}>
      {/* TODO */}
      <Tooltip
        label={helpText}
        transitionProps={{ transition: 'fade-right', duration: 300 }}
        position="top-start"
      >
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={2} size="h3">
            Filter by Data Provider
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Select
        size="sm"
        label="Data Provider"
        placeholder="Select..."
        data={['NOAA', 'USBR', 'USGS', 'USACE', 'USDA']}
        value={provider}
        onChange={setProvider}
        searchable
        clearable
      />
    </Stack>
  );
};
