/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import { Box, Group, Paper, Switch, Text, Stack } from '@mantine/core';
import { GeoJsonProperties } from 'geojson';
import { useState } from 'react';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Info } from '@/features/Reservior/Info/Info';
import { TeacupDiagram } from '@/features/Reservior/TeacupDiagram';
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

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
};

const InfoWrapper: React.FC<Props> = (props) => {
    const { reservoirProperties, config } = props;

    if (!reservoirProperties) {
        return null;
    }

    const [showLabels, setShowLabels] = useState(true);

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

    return (
        <>
            <Group
                align="flex-start"
                justify="space-between"
                className={styles.infoChartGroup}
            >
                <Group align="flex=start" className={styles.graphicPanel}>
                    <Stack align="flex-start" mx="auto">
                        <Switch
                            label="Show Volumes"
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
                    <TeacupDiagram
                        reservoirProperties={reservoirProperties}
                        config={config}
                        showLabels={showLabels}
                    />
                </Group>
                <Info
                    reservoirProperties={reservoirProperties}
                    config={config}
                />
            </Group>
        </>
    );
};

export default InfoWrapper;
