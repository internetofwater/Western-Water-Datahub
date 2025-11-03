/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group } from '@mantine/core';
import styles from '@/features/Panel/Controls/Controls.module.css';
import { Reset } from './ClearAllData';
import { ShowLocations } from './ShowLocations';

const Controls: React.FC = () => {
  return (
    <Group className={styles.controlsWrapper} grow gap="sm">
      <ShowLocations />
      <Reset />
    </Group>
  );
};

export default Controls;
