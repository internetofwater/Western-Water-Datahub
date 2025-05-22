/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Paper, Stack, Title, Text, Group } from '@mantine/core';
import PDF from '@/features/Reservior/PDF';
import { ReservoirConfig } from '@/features/Map/types';
import { Chart as ChartJS } from 'chart.js';
import { RefObject } from 'react';
import styles from '@/features/Reservior/Reservoir.module.css';
import { GeoJsonProperties } from 'geojson';

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

/**
 *
 * @component
 */
export const Info: React.FC<Props> = (props) => {
    const { accessToken, reservoirProperties, center, chartRef, config } =
        props;

    if (!reservoirProperties) {
        return null;
    }

    // TODO: replace the division by 2 when data is available
    const storage = Number(reservoirProperties[config.storageProperty]) / 2;
    const capacity = Number(reservoirProperties[config.capacityProperty]);
    // TODO: replace the average when available
    const average = Math.round(storage * 1.3);
    const percentFull = ((storage / capacity) * 100).toFixed(1);
    const percentOfAverage = ((storage / average) * 100).toFixed(1);
    const region = String(
        Array.isArray(reservoirProperties[config.regionConnectorProperty])
            ? (
                  reservoirProperties[config.regionConnectorProperty] as
                      | string[]
                      | number[]
              )?.[0]
            : reservoirProperties[config.regionConnectorProperty]
    );

    return (
        <Paper
            shadow="xs"
            p="xs"
            className={styles.infoContainer}
            data-testid="reservoir-info"
        >
            <Stack justify="space-between" align="flex-start">
                <Title order={2} size={'h3'}>
                    {reservoirProperties.locationName}
                </Title>
                <Group justify="start" w="100%" gap="xs">
                    <Stack mr="xl" gap="xs">
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Storage:</Text>
                            <Text>
                                {storage.toLocaleString('en-US')}&nbsp;acre-feet
                            </Text>
                        </Group>
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Capacity:</Text>
                            <Text>
                                {capacity.toLocaleString('en-US')}
                                &nbsp;acre-feet
                            </Text>
                        </Group>
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Percent Full:</Text>
                            <Text>{percentFull}%</Text>
                        </Group>
                    </Stack>
                    <Stack gap="xs">
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Percent of Average:</Text>
                            <Text>{percentOfAverage}%</Text>
                        </Group>
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Region:</Text>
                            <Text>{region}</Text>
                        </Group>
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Basin:</Text>
                            <Text>Unknown Basin</Text>
                        </Group>
                    </Stack>
                </Group>
                <PDF
                    reservoirProperties={reservoirProperties}
                    accessToken={accessToken}
                    center={center}
                    chartRef={chartRef}
                />
            </Stack>
        </Paper>
    );
};
