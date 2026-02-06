/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Group, Stack, Text } from "@mantine/core";
import Circle from "@/assets/Circle";
import Line from "@/assets/Line";
import Square from "@/assets/Square";
import styles from "@/features/Legend/Legend.module.css";
import { TLayer } from "@/stores/main/types";
import { LegendEntry } from "@/stores/session/types";

type Props = {
  color: LegendEntry["color"];
  geometryTypes: TLayer["geometryTypes"];
};

export const Shapes: React.FC<Props> = (props) => {
  const { color, geometryTypes } = props;

  const includesPoints =
    geometryTypes.includes("Point") || geometryTypes.includes("MultiPoint");
  const includesLines =
    geometryTypes.includes("LineString") ||
    geometryTypes.includes("MultiLineString");
  const includesPolygons =
    geometryTypes.includes("Polygon") || geometryTypes.includes("MultiPolygon");

  return (
    <Group gap="xs" justify="flex-start" align="flex-start">
      <Stack className={styles.legendContrast} gap="xs">
        {includesPoints && <Circle fill={color} />}
        {includesLines && <Line color={color} />}
        {includesPolygons && <Square fill={color} />}
        <Circle fill={color} stroke="#fff" />
      </Stack>
      <Stack gap={10} pt="var(--default-spacing)" mt={0} align="flex-start">
        {includesPoints && <Text size="xs">Point Locations</Text>}
        {includesLines && <Text size="xs">Line Locations</Text>}
        {includesPolygons && <Text size="xs">Polygon Locations</Text>}

        <Stack gap={0}>
          <Text size="xs">Selected Locations</Text>
          <Text size="xs">(all shapes)</Text>
        </Stack>
      </Stack>
    </Group>
  );
};
