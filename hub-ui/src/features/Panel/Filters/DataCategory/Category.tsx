/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Select } from "@mantine/core";

export const Category: React.FC = () => {
  return (
    <Select
      size="xs"
      label="Category"
      placeholder="Select..."
      data={["React", "Angular", "Vue", "Svelte"]}
      searchable
    />
  );
};
