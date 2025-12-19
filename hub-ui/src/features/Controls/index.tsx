/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Stack } from "@mantine/core";
import styles from "@/features/Controls/Controls.module.css";
import DarkModeToggle from "@/features/Controls/DarkModeToggle";
import Download from "@/features/Download";
import Info from "@/features/Info";
import Legend from "@/features/Legend";
import Order from "@/features/Order";
import Search from "@/features/Search";
import Time from "@/features/Time";

const Controls: React.FC = () => {
  return (
    <>
      <Group
        justify="flex-start"
        align="flex-start"
        gap="var(--default-spacing)"
        className={styles.left}
      >
        <Stack gap="var(--default-spacing)">
          <Info />
          <Time />
          <Order />
          <Search />
        </Stack>
        <Download />
      </Group>
      <Group justify="flex-start" align="flex-end" className={styles.right}>
        <Legend />
        <DarkModeToggle />
      </Group>
    </>
  );
};

export default Controls;
