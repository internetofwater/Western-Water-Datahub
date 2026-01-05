/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Group, Stack, Text } from "@mantine/core";
import Circle from "@/assets/Circle";
import Line from "@/assets/Line";
import Square from "@/assets/Square";
import styles from "@/features/Legend/Legend.module.css";
import { LegendEntry } from "@/stores/session/types";

type Props = {
  color: LegendEntry["color"];
};

export const Shapes: React.FC<Props> = (props) => {
  const { color } = props;

  return (
    <Group gap="xs" justify="flex-start" align="flex-start">
      <Stack className={styles.legendContrast} gap="xs">
        <Circle fill={color} />
        <Line color={color} />
        <Square fill={color} />
        <Circle fill={color} stroke="#fff" />
      </Stack>
      <Stack gap={10} pt="var(--default-spacing)" mt={0} align="flex-start">
        <Text size="xs">Point Locations</Text>
        <Text size="xs">Line Locations</Text>
        <Text size="xs">Polygon Locations</Text>
        <Stack gap={0}>
          <Text size="xs">Selected Locations</Text>
          <Text size="xs">(all shapes)</Text>
        </Stack>
      </Stack>
    </Group>
  );
};
