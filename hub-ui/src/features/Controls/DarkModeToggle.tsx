/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect } from "react";
import {
  Box,
  Switch,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import Moon from "@/assets/Moon";
import Sun from "@/assets/Sun";
import styles from "@/features/Controls/Controls.module.css";
import useSessionStore from "@/stores/session";

const DarkModeToggle: React.FC = () => {
  const preferredColorScheme = useColorScheme();
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useSessionStore((state) => state.colorScheme);
  const setAppColorScheme = useSessionStore((state) => state.setColorScheme);
  const computedColorScheme = useComputedColorScheme(preferredColorScheme);

  useEffect(() => {
    if (!computedColorScheme) {
      return;
    }
    setAppColorScheme(computedColorScheme);
  }, [computedColorScheme]);

  const checked = colorScheme ? colorScheme === "dark" : undefined;

  const handleChange = () => {
    setColorScheme(colorScheme === "light" ? "dark" : "light");
  };

  return (
    <Switch
      size="lg"
      color="dark.4"
      title="Toggle dark and light mode"
      checked={checked}
      onChange={handleChange}
      onLabel={
        <Box
          component="span"
          className={styles.darkModeIcon}
          style={{
            fill: "#d0a02a",
          }}
        >
          <Sun />
        </Box>
      }
      offLabel={
        <Box
          component="span"
          className={styles.darkModeIcon}
          style={{
            fill: "#1c638e",
          }}
        >
          <Moon />
        </Box>
      }
    />
  );
};

export default DarkModeToggle;
