/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import styles from '@/features/MapTools/Legend/Legend.module.css';
import { Box, Group, Text } from '@mantine/core';

type Props = {
    colors: string[];
    from: string | number;
    to: string | number;
};

export const Gradient: React.FC<Props> = (props) => {
    const { colors, from, to } = props;
    const stepLength = 100 / colors.length;
    const coloration = colors.map(
        (color, index) =>
            `${color} ${stepLength * index}% ${stepLength * (index + 1)}%`
    );

    return (
        <Box className={styles.gradientContainer}>
            <Box
                className={styles.gradient}
                style={{
                    background: `linear-gradient(to right, ${coloration.join(
                        ', '
                    )})`,
                }}
            ></Box>
            <Group justify="space-between">
                <Text size="sm">{from}</Text>
                <Text size="sm">{to}</Text>
            </Group>
        </Box>
    );
};
