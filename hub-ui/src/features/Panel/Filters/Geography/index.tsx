/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Stack, Title, VisuallyHidden } from '@mantine/core';
import Info from '@/assets/Info';
import Tooltip from '@/components/Tooltip';
import { Basin } from '@/features/Panel/Filters/Geography/Basin';
import { Region } from '@/features/Panel/Filters/Geography/Region';
import { State } from '@/features/Panel/Filters/Geography/State';
import styles from '@/features/Panel/Panel.module.css';

const Geography: React.FC = () => {
  const helpText =
    'Add a geographic filter to limit locations to a designated region, basin, or state.';

  return (
    <Stack gap="xs" mb="xl">
      <Tooltip multiline label={helpText}>
        <Group className={styles.filterTitleWrapper} gap="xs" mb={-8}>
          <Title order={2} size="h3">
            Filter by Geography
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Region />
      <Basin />
      <State />
    </Stack>
  );
};

export default Geography;
