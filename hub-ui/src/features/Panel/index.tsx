/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect } from 'react';
import { Paper, Stack } from '@mantine/core';
import { UpdateCollectionsButton } from '@/features/Panel/Button';
import Filters from '@/features/Panel/Filters';
import { Header } from '@/features/Panel/Header';
import styles from '@/features/Panel/Panel.module.css';
import mainManager from '@/managers/Main.init';
import useMainStore from '@/stores/main';

const Panel: React.FC = () => {
  const provider = useMainStore((state) => state.provider);
  const category = useMainStore((state) => state.category);

  useEffect(() => {
    void mainManager.getCollections();
  }, [provider, category]);

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
