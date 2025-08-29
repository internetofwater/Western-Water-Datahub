/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Select, Stack, Title } from '@mantine/core';
import useMainStore from '@/stores/main';

export const Dataset: React.FC = () => {
  const dataset = useMainStore((state) => state.dataset);
  const setDataset = useMainStore((state) => state.setDataset);

  return (
    <Stack gap={0}>
      <Title order={2} size="h3">
        Filter by Dataset
      </Title>
      <Select
        size="xs"
        label="Dataset"
        placeholder="Select..."
        data={['React', 'Angular', 'Vue', 'Svelte']}
        value={dataset}
        onChange={setDataset}
        searchable
      />
    </Stack>
  );
};
