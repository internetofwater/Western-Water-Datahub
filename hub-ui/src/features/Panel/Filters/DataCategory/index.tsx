/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Title } from '@mantine/core';
import { Category } from '@/features/Panel/Filters/DataCategory/Category';
import { Dataset } from '@/features/Panel/Filters/DataCategory/Dataset';

const DataCategory: React.FC = () => {
  return (
    <Stack gap={0}>
      <Title order={2} size="h3">
        Filter by Data Category
      </Title>
      <Category />
      <Dataset />
    </Stack>
  );
};

export default DataCategory;
