/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import DashedLine from '@/icons/DashedLine';
import Square from '@/icons/Square';
import { Stack, Text, Image, Group, Box, Tooltip, Title } from '@mantine/core';
import {
    capacityFill,
    storageFill,
} from '@/features/Reservior/TeacupDiagram/consts';
import styles from '@/features/MapTools/Legend/Legend.module.css';
import Info from '@/icons/Info';
import { getTooltipContent } from './utils';

export const Teacups: React.FC = () => {
    return (
        <Stack>
            <Title order={4}>Reservoirs</Title>
            <Group>
                <Image
                    src="/map-icons/teacup-65-50.png"
                    alt="Reservoir Teacup Icon"
                    h={60}
                    w="auto"
                    fit="contain"
                />
                <Stack>
                    <Tooltip
                        label={getTooltipContent('capacity')}
                        position="top-start"
                    >
                        <Group gap="xs" className={styles.teacupLegend}>
                            <Square
                                fill={capacityFill}
                                width={20}
                                height={20}
                            />
                            <Text size="sm">Capacity</Text>
                            <Box
                                component="span"
                                className={styles.listItemIconWrapper}
                            >
                                <Info />
                            </Box>
                        </Group>
                    </Tooltip>
                    <Tooltip
                        label={getTooltipContent('storage')}
                        position="top-start"
                    >
                        <Group gap="xs" className={styles.teacupLegend}>
                            <Square fill={storageFill} width={20} height={20} />
                            <Text size="sm">Storage</Text>
                            <Box
                                component="span"
                                className={styles.listItemIconWrapper}
                            >
                                <Info />
                            </Box>
                        </Group>
                    </Tooltip>
                    <Tooltip
                        label={getTooltipContent('average')}
                        position="top-start"
                    >
                        <Group
                            gap="xs"
                            className={styles.thirtyYearAverageLegend}
                        >
                            <DashedLine />
                            <Text size="sm">30-year Average</Text>
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
