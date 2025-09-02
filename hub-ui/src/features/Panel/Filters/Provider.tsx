/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Select, Stack, Title } from "@mantine/core";
import useMainStore from "@/stores/main";

export const Provider: React.FC = () => {
  const provider = useMainStore((state) => state.provider);
  const setProvider = useMainStore((state) => state.setProvider);

  return (
    <Stack gap={0}>
      <Title order={2} size="h3">
        Filter by Data Provider
      </Title>
      <Select
        size="sm"
        label="Data Provider"
        placeholder="Select..."
        data={["NOAA", "USBR", "USGS", "USACE", "USDA"]}
        value={provider}
        onChange={setProvider}
        searchable
        clearable
      />
    </Stack>
  );
};
