/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import { Box, Group, Paper, Switch, Title, Text } from '@mantine/core';
import { GeoJsonProperties } from 'geojson';
import { RefObject, useState } from 'react';
import { Chart as ChartJS } from 'chart.js';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Info } from '@/features/Reservior/Info/Info';
import { TeacupDiagram } from '../TeacupDiagram';
import { capacityFill, storageFill } from '../TeacupDiagram/consts';
import {
    handleStorageEnter,
    handleCapacityEnter,
    handleAverageLineEnter,
    handleStorageLeave,
    handleCapacityLeave,
    handleAverageLineLeave,
} from '../TeacupDiagram/listeners';

type Props = {
    accessToken: string;
    reservoirProperties: GeoJsonProperties;
    center: [number, number] | null;
    chartRef: RefObject<ChartJS<
        'line',
        Array<{ x: string; y: number }>
    > | null>;
    config: ReservoirConfig;
};

const InfoWrapper: React.FC<Props> = (props) => {
    const { accessToken, reservoirProperties, center, chartRef, config } =
        props;

    if (!reservoirProperties) {
        return null;
    }

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

    return (
        <Paper
            shadow="xs"
            p="xs"
            className={styles.infoContainer}
            data-testid="reservoir-info"
        >
            <Group justify="space-between" mb="xs">
                <Title order={2} size={'h3'}>
                    {reservoirProperties[config.labelProperty]}
                </Title>
                <Group>
                    <Paper bg="#fff">
                        <Group p={8} data-testid="graphic-legend">
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
                        </Group>
                    </Paper>
                    <Switch
                        label="Show Labels"
                        checked={showLabels}
                        onClick={() => handleShowLabels(!showLabels)}
                    />
                </Group>
            </Group>
            <Group
                align="center"
                justify="space-between"
                className={styles.infoChartGroup}
            >
                <Info
                    reservoirProperties={reservoirProperties}
                    accessToken={accessToken}
                    center={center}
                    chartRef={chartRef}
                    config={config}
                />
                <TeacupDiagram
                    reservoirProperties={reservoirProperties}
                    config={config}
                    showLabels={showLabels}
                />
            </Group>
        </Paper>
    );
};

export default InfoWrapper;
