/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Image, Group, Title, Text, Box } from '@mantine/core';
import { Legend } from '@/features/Reservior/Info/Legend';
import styles from '@/features/MapTools/Legend/Legend.module.css';

export const Teacups: React.FC = () => {
    return (
        <Stack gap="var(--default-spacing)">
            <Title order={4} size="h5">
                Reservoirs
            </Title>
            <Group gap="calc(var(--default-spacing) / 2)">
                <Image
                    src="/map-icons/teacup-65-50.png"
                    alt="Reservoir Teacup Icon"
                    h={60}
                    w="auto"
                    fit="contain"
                />
                <Legend
                    showSwitch={false}
                    excludeEntries={['high-percentile', 'low-percentile']}
                    textSize="xs"
                />
            </Group>
            <Group gap="calc(var(--default-spacing) / 2)">
                <Box className={styles.iconBackground}>
                    <Image
                        src="/map-icons/default.png"
                        alt="Reservoir default Icon"
                        h={30}
                        w="auto"
                        fit="contain"
                    />
                </Box>
                <Text size="xs">Zoom in to view this reservoir</Text>
            </Group>
            <Group gap="calc(var(--default-spacing) / 2)">
                <Box className={styles.iconBackground}>
                    <Image
                        src="/map-icons/no-data.png"
                        alt="Reservoir default Icon"
                        h={30}
                        w="auto"
                        fit="contain"
                    />
                </Box>
                <Text size="xs">This reservoir is missing data</Text>
            </Group>
        </Stack>
    );
};
