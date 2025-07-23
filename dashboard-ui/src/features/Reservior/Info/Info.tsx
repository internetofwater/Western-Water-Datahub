/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Text, Group, Box } from '@mantine/core';
import PDF from '@/features/Reservior/PDF';
import { ReservoirConfig } from '@/features/Map/types';
import { Chart as ChartJS } from 'chart.js';
import { RefObject } from 'react';
import styles from '@/features/Reservior/Reservoir.module.css';
import { GeoJsonProperties } from 'geojson';
import { TextBlock } from '@/components/TextBlock';

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

    const storage = Number(reservoirProperties[config.storageProperty]);
    const capacity = Number(reservoirProperties[config.capacityProperty]);
    // TODO: replace the average when available
    const average = Number(
        reservoirProperties[config.thirtyYearAverageProperty]
    );
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

    const today = new Date();
    const lastUpdateDate = `${String(today.getMonth() + 1).padStart(
        2,
        '0'
    )}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    return (
        <Stack
            justify="space-between"
            align="flex-start"
            gap="xs"
            className={styles.infoPanel}
        >
            <Stack gap="xs" w="100%" className={styles.infoGroup}>
                <Box>
                    <Text>Last Updated: {lastUpdateDate}</Text>
                    <TextBlock w="100%">
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Storage:</Text>
                            <Text>
                                {storage.toLocaleString('en-US')}&nbsp;acre-feet
                            </Text>
                        </Group>
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Percent Full:</Text>
                            <Text>{percentFull}%</Text>
                        </Group>
                        <Group gap="xs" justify="flex-start">
                            <Text fw={700}>Percent of Average:</Text>
                            <Text>{percentOfAverage}%</Text>
                        </Group>
                    </TextBlock>
                </Box>
                <TextBlock>
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>Capacity:</Text>
                        <Text>
                            {capacity.toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>Region:</Text>
                        <Text>{region}</Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>Basin:</Text>
                        <Text>Unknown Basin</Text>
                    </Group>
                </TextBlock>
                <PDF
                    reservoirProperties={reservoirProperties}
                    accessToken={accessToken}
                    center={center}
                    chartRef={chartRef}
                    config={config}
                />
            </Stack>
        </Stack>
    );
};
