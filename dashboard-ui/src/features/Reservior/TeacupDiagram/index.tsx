/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import {
    Box,
    Group,
    Paper,
    Stack,
    Switch,
    Title,
    Text,
    useMantineColorScheme,
} from '@mantine/core';
import styles from '@/features/Reservior/Reservoir.module.css';
import { useState } from 'react';
import { GeoJsonProperties } from 'geojson';
import {
    capacityFill,
    storageFill,
} from '@/features/Reservior/TeacupDiagram/consts';
import {
    handleStorageEnter,
    handleCapacityEnter,
    handleAverageLineEnter,
    handleStorageLeave,
    handleCapacityLeave,
    handleAverageLineLeave,
} from '@/features/Reservior/TeacupDiagram/listeners';
import { Graphic } from '@/features/Reservior/TeacupDiagram/Graphic';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
};

export const TeacupDiagram: React.FC<Props> = (props) => {
    const { reservoirProperties, config } = props;

    const [showLabels, setShowLabels] = useState(false);

    const handleShowLabels = (showLabels: boolean) => {
        if (showLabels) {
            handleStorageEnter();
            handleCapacityEnter();
            handleAverageLineEnter();
        } else {
            handleStorageLeave(false);
            handleCapacityLeave(false);
            handleAverageLineLeave(false);
        }

        setShowLabels(showLabels);
    };

    const { colorScheme } = useMantineColorScheme();

    return (
        <Paper
            shadow="xs"
            p="xs"
            className={`${styles.infoContainer} ${styles.graphicContainer}`}
        >
            <Stack align="space-between" h="100%">
                <Title order={3} size="h5">
                    Current Storage Levels
                </Title>
                <Group
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                    style={{ flexGrow: 1 }}
                >
                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Graphic
                            reservoirProperties={reservoirProperties}
                            config={config}
                            showLabels={showLabels}
                            listeners
                            colorScheme={colorScheme}
                        />
                    </Box>
                    <Stack
                        align="space-between"
                        justify="flex-start"
                        h="100%"
                        w="132px"
                        pt={15}
                    >
                        <Switch
                            label="Show Labels"
                            checked={showLabels}
                            onClick={() => handleShowLabels(!showLabels)}
                        />
                        <Paper bg="#fff">
                            <Stack p={8} data-testid="graphic-legend">
                                <Group
                                    gap={5}
                                    onMouseEnter={handleCapacityEnter}
                                    onMouseLeave={() =>
                                        handleCapacityLeave(showLabels)
                                    }
                                >
                                    <Box
                                        style={{
                                            backgroundColor: capacityFill,
                                        }}
                                        className={styles.graphicLegendColor}
                                    ></Box>
                                    <Text
                                        size="sm"
                                        c="#000"
                                        fw={700}
                                        className={styles.graphicLegendText}
                                    >
                                        Capacity
                                    </Text>
                                </Group>
                                <Group
                                    gap={5}
                                    onMouseEnter={handleStorageEnter}
                                    onMouseLeave={() =>
                                        handleStorageLeave(showLabels)
                                    }
                                >
                                    <Box
                                        style={{ backgroundColor: storageFill }}
                                        className={styles.graphicLegendColor}
                                    ></Box>
                                    <Text
                                        size="sm"
                                        c="#000"
                                        fw={700}
                                        className={styles.graphicLegendText}
                                    >
                                        Storage
                                    </Text>
                                </Group>
                            </Stack>
                        </Paper>
                    </Stack>
                </Group>
            </Stack>
        </Paper>
    );
};
