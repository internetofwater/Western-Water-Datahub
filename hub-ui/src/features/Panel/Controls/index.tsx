/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group } from "@mantine/core";
import { Reset } from "@/features/Panel/Controls/ClearAllData";
import styles from "@/features/Panel/Controls/Controls.module.css";
import { ShowLocations } from "@/features/Panel/Controls/ShowLocations";

const Controls: React.FC = () => {
  return (
    <Group
      className={styles.controlsWrapper}
      grow
      gap="sm"
      mt="calc(var(--default-spacing) * 2)"
    >
      <ShowLocations />
      <Reset />
    </Group>
  );
};

export default Controls;
