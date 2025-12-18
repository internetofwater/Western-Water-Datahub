/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Stack } from "@mantine/core";
import styles from "@/features/Controls/Controls.module.css";
import Download from "@/features/Download";
import Info from "@/features/Info";
import useMainStore from "@/stores/main";
import Order from "../Order";
import Search from "../Search";
import Time from "../Time";

const Controls: React.FC = () => {
  const paletteLayers = useMainStore((state) => state.layers).filter(
    (layer) => layer.paletteDefinition && layer.paletteDefinition !== null,
  );

  return (
    <Group
      justify="flex-start"
      align="flex-start"
      grow={false}
      className={styles.controlsWrapper}
    >
      <Stack>
        <Info />
        {paletteLayers.length > 0 && <Time layers={paletteLayers} />}
        <Order />
        <Search />
      </Stack>
      <Download />
    </Group>
  );
};

export default Controls;
