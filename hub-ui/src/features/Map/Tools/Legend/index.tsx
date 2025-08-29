/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Card, CardSection, CloseButton, Group, Title } from '@mantine/core';
import Legend from '@/features/Legend';
import styles from '@/features/Map/Tools/Tools.module.css';
import useSessionStore from '@/stores/session';
import { Tools } from '@/stores/session/types';

/**
 *
 * @component
 */
const LegendTool: React.FC = () => {
  const setOpenTools = useSessionStore((state) => state.setOpenTools);

  return (
    <Card withBorder shadow="sm" radius="md" padding="md" className={styles.legendContainer}>
      <CardSection withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title order={3} className={styles.mapToolTitle}>
            Legend
          </Title>
          <CloseButton
            onClick={() => setOpenTools(Tools.Legend, false)}
            aria-label="Close Legend"
          />
        </Group>
      </CardSection>
      <CardSection inheritPadding py="md" className={styles.toolContent}>
        <Legend />
      </CardSection>
    </Card>
  );
};

export default LegendTool;
