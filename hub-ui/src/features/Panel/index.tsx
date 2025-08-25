/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Paper, Stack } from "@mantine/core";
import { UpdateCollectionsButton } from "@/features/Panel/Button";
import Filters from "@/features/Panel/Filters";
import { Header } from "@/features/Panel/Header";
import styles from "@/features/Panel/Panel.module.css";

const Panel: React.FC = () => {
  return (
    <Paper className={styles.panelWrapper}>
      <Stack gap="lg" px="xl" pb="xl">
        <Header />
        <Filters />
        <UpdateCollectionsButton />
      </Stack>
    </Paper>
  );
};

export default Panel;
