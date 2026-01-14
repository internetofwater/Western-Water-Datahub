/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
  ComboboxData,
  Group,
  MultiSelect,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import Info from "@/assets/Info";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Panel/Panel.module.css";
import useMainStore from "@/stores/main";

const options: ComboboxData = [
  {
    label: "(DOA) Department of Administration",
    value: "DOA",
  },
  {
    label: "(DOI) Department of the Interior",
    value: "DOI",
  },
  {
    label: "(NDMC) National Drought Mitigation Center",
    value: "NDMC",
  },
  {
    label: "(NOAA) National Oceanic and Atmospheric Administration",
    value: "NOAA",
  },
  {
    label: "(NOHRSC) National Operational Hydrologic Remote Sensing Center",
    value: "NOHRSC",
  },
  {
    label: "(NRCS) Natural Resources Conservation Service",
    value: "NRCS",
  },
  {
    label: "(USACE) U.S. Army Corps of Engineers",
    value: "USACE",
  },
  {
    label: "(USBR) U.S. Bureau of Reclamation",
    value: "USBR",
  },
  {
    label: "(USDA) U.S. Department of Agriculture",
    value: "USDA",
  },
  {
    label: "(USGS) U.S. Geological Survey",
    value: "USGS",
  },
  {
    label: "(WPC) Weather Prediction Center",
    value: "WPC",
  },
];

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
          <Title order={3} size="h4">
            Filter by Data Provider
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <MultiSelect
        size="sm"
        label="Data Provider"
        placeholder="Select..."
        data={options}
        value={provider}
        onChange={setProvider}
        searchable
        clearable
      />
    </Stack>
  );
};
