/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
  Group,
  Select,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import Info from "@/assets/Info";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Panel/Panel.module.css";
import useMainStore from "@/stores/main";

export const Provider: React.FC = () => {
  const provider = useMainStore((state) => state.provider);
  const setProvider = useMainStore((state) => state.setProvider);

  const helpText = (
    <>
      <Text size="sm">
        Select a data provider to explore the categories and collections they've
        published.
      </Text>
      <br />
      <Text size="sm">
        This filters results based on the source of the data.
      </Text>
    </>
  );

  return (
    <Stack gap={0}>
      {/* TODO */}
      <Tooltip multiline label={helpText}>
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={2} size="h3">
            Filter by Data Provider
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Select
        size="sm"
        label="Data Provider"
        placeholder="Select..."
        data={["USBR", "USGS", "USACE", "USDA"]}
        value={provider}
        onChange={setProvider}
        searchable
        clearable
      />
    </Stack>
  );
};
