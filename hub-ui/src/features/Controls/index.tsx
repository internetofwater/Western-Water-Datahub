/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ActionIcon, Group, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Menu from "@/assets/Menu";
import styles from "@/features/Controls/Controls.module.css";
import DarkModeToggle from "@/features/Controls/DarkModeToggle";
import Download from "@/features/Download";
import Info from "@/features/Info";
import Label from "@/features/Label";
import Legend from "@/features/Legend";
import Order from "@/features/Order";
import Search from "@/features/Search";
import Time from "@/features/Time";
import useSessionStore from "@/stores/session";
import { EOverlay } from "@/stores/session/types";

const Controls: React.FC = () => {
  const overlay = useSessionStore((state) => state.overlay);
  const setOverlay = useSessionStore((state) => state.setOverlay);

  const mobile = useMediaQuery("(max-width: 899px)");

  const handleMenuClick = () => {
    setOverlay(overlay !== EOverlay.Controls ? EOverlay.Controls : null);
  };

  return (
    <>
      <Group
        justify="flex-start"
        align="flex-start"
        gap="var(--default-spacing)"
        className={styles.left}
      >
        <Stack gap="var(--default-spacing)">
          {mobile && (
            <ActionIcon
              aria-label="Use the application menu to find data"
              size="lg"
              onClick={() => handleMenuClick()}
              className={styles.menuButton}
            >
              <Menu />
            </ActionIcon>
          )}
          <Info />
          <Time />
          <Order />
          <Search />
          <Label />
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
