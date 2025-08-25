/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Select, Stack, Title } from '@mantine/core';

const Time: React.FC = () => {
  return (
    <Stack gap={0}>
      <Title order={2} size="h3">
        Filter by Time
      </Title>
      <Select
        size="xs"
        label="Sites with Data in the Last:"
        placeholder="Select..."
        data={['React', 'Angular', 'Vue', 'Svelte']}
        searchable
      />
    </Stack>
  );
};

export default Time;
