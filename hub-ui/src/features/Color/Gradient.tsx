/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Text } from '@mantine/core';
import styles from '@/features/Panel/Panel.module.css';

type Props = {
  label: string;
  colors: string[];
  left: string | number;
  right: string | number;
};

export const Gradient: React.FC<Props> = (props) => {
  const { label, colors, left, right } = props;

  const stepLength = 100 / colors.length;
  const coloration = colors.map(
    (color, index) => `${color} ${stepLength * index}% ${stepLength * (index + 1)}%`
  );

  return (
    <Box className={styles.gradientContainer}>
      <Text size="sm">{label}</Text>
      <Box
        className={styles.gradient}
        style={{
          background: `linear-gradient(to right, ${coloration.join(', ')})`,
        }}
      />
      <Box className={styles.gradientLabelContainer}>
        <Text size="xs">{left}</Text>
        <Text size="xs">{right}</Text>
      </Box>
    </Box>
  );
};
