/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import DashedLine from '@/icons/DashedLine';
import Square from '@/icons/Square';
import { Stack, Text, Image, Group, Box, Tooltip } from '@mantine/core';
import {
    capacityFill,
    storageFill,
} from '@/features/Reservior/TeacupDiagram/consts';
import styles from '@/features/Legend/Legend.module.css';
import Info from '@/icons/Info';

export const Teacups: React.FC = () => {
    return (
        <Stack>
            <Text size="xl" fw={700}>
                Reservoirs
            </Text>
            <Group>
                <Image
                    src="/map-icons/teacup-65-50.png"
                    alt="Reservoir Teacup Icon"
                    h={75}
                    w="auto"
                    fit="contain"
                />
                <Stack>
                    <Tooltip
                        label="Potential water storage"
                        position="top-start"
                    >
                        <Group gap="xs" className={styles.teacupLegend}>
                            <Square
                                fill={capacityFill}
                                width={20}
                                height={20}
                            />
                            <Text>Capacity</Text>
                            <Box
                                component="span"
                                className={styles.listItemIconWrapper}
                            >
                                <Info />
                            </Box>
                        </Group>
                    </Tooltip>
                    <Tooltip label="Current water storage" position="top-start">
                        <Group gap="xs" className={styles.teacupLegend}>
                            <Square fill={storageFill} width={20} height={20} />
                            <Text>Storage</Text>
                            <Box
                                component="span"
                                className={styles.listItemIconWrapper}
                            >
                                <Info />
                            </Box>
                        </Group>
                    </Tooltip>
                    <Tooltip
                        label="Average water storage on this date"
                        position="top-start"
                    >
                        <Group
                            gap="xs"
                            className={styles.thirtyYearAverageLegend}
                        >
                            <DashedLine />
                            <Text>30 year Average</Text>
                            <Box
                                component="span"
                                className={styles.listItemIconWrapper}
                            >
                                <Info />
                            </Box>
                        </Group>
                    </Tooltip>
                </Stack>
            </Group>
        </Stack>
    );
};
