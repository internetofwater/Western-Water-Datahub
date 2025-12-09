/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group } from "@mantine/core";
import styles from "@/features/Controls/Controls.module.css";
import Download from "@/features/Download";
import Info from "@/features/Info";

const Controls: React.FC = () => {
  return (
    <Group
      justify="flex-start"
      align="center"
      grow={false}
      className={styles.controlsWrapper}
    >
      <Info />
      <Download />
    </Group>
  );
};

export default Controls;
