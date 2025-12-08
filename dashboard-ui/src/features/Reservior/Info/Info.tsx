/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Text, Group, Box, Divider } from '@mantine/core';
import { ReservoirConfig } from '@/features/Map/types';
import styles from '@/features/Reservior/Reservoir.module.css';
import { GeoJsonProperties } from 'geojson';
import dayjs from 'dayjs';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
};

/**
 *
 * @component
 */
export const Info: React.FC<Props> = (props) => {
    const { reservoirProperties, config } = props;

    if (!reservoirProperties) {
        return null;
    }

    const storage = Number(reservoirProperties[config.storageProperty]);
    const capacity = Number(reservoirProperties[config.capacityProperty]);
    const average = Number(
        reservoirProperties[config.thirtyYearAverageProperty]
    );
    const ninetiethPercentile = Number(
        reservoirProperties[config.ninetiethPercentileProperty]
    );
    const tenthPercentile = Number(
        reservoirProperties[config.tenthPercentileProperty]
    );

    const percentFull = ((storage / capacity) * 100).toFixed(1);
    const percentOfAverage = ((storage / average) * 100).toFixed(1);

    return (
        <Stack justify="space-between" align="flex-start" gap="xs">
            <Stack gap="xs" w="100%" className={styles.infoGroup}>
                <Box>
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
                </Box>
                <Divider />
                <Box>
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>Capacity:</Text>
                        <Text>
                            {capacity.toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>30-year Average:</Text>
                        <Text>
                            {Math.round(average).toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>
                            (High) 90<sup>th</sup> Percentile:
                        </Text>
                        <Text>
                            {ninetiethPercentile.toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>
                            (Low) 10<sup>th</sup> Percentile:
                        </Text>
                        <Text>
                            {tenthPercentile.toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                </Box>
                <Text size="xs">
                    Data as of:{' '}
                    {dayjs(
                        reservoirProperties[
                            config.storageDateProperty
                        ] as string
                    ).format('MM/DD/YYYY')}
                </Text>
            </Stack>
        </Stack>
    );
};
