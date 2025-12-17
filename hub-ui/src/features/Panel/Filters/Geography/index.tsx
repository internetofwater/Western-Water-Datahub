/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'react';
import { Box, Group, Stack, Title, VisuallyHidden } from '@mantine/core';
import Info from '@/assets/Info';
import Tooltip from '@/components/Tooltip';
import { Basin } from '@/features/Panel/Filters/Geography/Basin';
import { Region } from '@/features/Panel/Filters/Geography/Region';
import { State } from '@/features/Panel/Filters/Geography/State';
import styles from '@/features/Panel/Panel.module.css';
import mainManager from '@/managers/Main.init';
import { GeographySelector } from './GeographySelector';

type Geography = 'region' | 'basin' | 'state';

const Geography: React.FC = () => {
  const [geography, setGeography] = useState<Geography>('region');

  const helpText =
    'Add a geographic filter to limit locations to a designated region, basin, or state.';

  const handleChange = (value: string) => {
    if (['region', 'basin', 'state'].includes(value)) {
      setGeography(value as Geography);
      mainManager.removeGeographyFilter();
    }
  };

  return (
    <Stack gap="xs">
      <Tooltip multiline label={helpText}>
        <Group className={styles.filterTitleWrapper} gap="xs" mb={-8}>
          <Title order={2} size="h4">
            Filter by Geography
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Box component="span" style={{ display: geography === 'region' ? 'block' : 'none' }}>
        <Region />
      </Box>
      <Box component="span" style={{ display: geography === 'basin' ? 'block' : 'none' }}>
        <Basin />
      </Box>
      <Box component="span" style={{ display: geography === 'state' ? 'block' : 'none' }}>
        <State />
      </Box>
      <GeographySelector geography={geography} onChange={handleChange} />
    </Stack>
  );
};

export default Geography;
