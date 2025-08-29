/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Select, Stack, Title } from '@mantine/core';
import useMainStore from '@/stores/main';

export const Category: React.FC = () => {
  const category = useMainStore((state) => state.category);
  const setCategory = useMainStore((state) => state.setCategory);

  return (
    <Stack gap={0}>
      <Title order={2} size="h3">
        Filter by Data Category
      </Title>
      <Select
        size="xs"
        label="Category"
        placeholder="Select..."
        data={['React', 'Angular', 'Vue', 'Svelte']}
        value={category}
        onChange={setCategory}
        searchable
        clearable
      />
    </Stack>
  );
};
