/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box, Group, Stack, Title } from "@mantine/core";
import Filter from "@/assets/Filter";
import { Category } from "@/features/Panel/Filters/Category";
import { Provider } from "@/features/Panel/Filters/Provider";
import styles from "@/features/Panel/Panel.module.css";

const Filters: React.FC = () => {
  return (
    <Stack gap="var(--default-spacing)">
      <Group gap="var(--default-spacing)" justify="space-between">
        <Title order={3} size="h4">
          Filters
        </Title>
        <Box component="span" className={styles.filterIcon}>
          <Filter />
        </Box>
      </Group>
      <Group gap="var(--default-spacing)" align="flex-start">
        <Provider />
        <Category />
      </Group>
    </Stack>
  );
};

export default Filters;
