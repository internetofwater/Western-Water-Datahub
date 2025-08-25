/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Title } from "@mantine/core";
import { Category } from "./Category";
import { Dataset } from "./Dataset";

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
