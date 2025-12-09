/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Text, Group, Box, Divider, Flex } from '@mantine/core';
import { ReservoirConfig } from '@/features/Map/types';
import styles from '@/features/Reservior/Reservoir.module.css';
import { GeoJsonProperties } from 'geojson';
import dayjs from 'dayjs';
import { useMediaQuery } from '@mantine/hooks';

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

    const verticalDivider = useMediaQuery(
        '(min-width: 664px) and (max-width: 866px)'
    );

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

    const text = {
        size: 'lg',
    };

    return (
        <Stack className={styles.metricsWrapper}>
            <Text size="sm">
                Data as of:{' '}
                {dayjs(
                    reservoirProperties[config.storageDateProperty] as string
                ).format('MM/DD/YYYY')}
            </Text>
            <Flex gap="var(--default-spacing)" className={styles.metrics}>
                <Box className={styles.metricsGroup}>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            Storage:
                        </Text>
                        <Text {...text}>
                            {storage.toLocaleString('en-US')}&nbsp;acre-feet
                        </Text>
                    </Group>

                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            Percent Full:
                        </Text>
                        <Text {...text}>{percentFull}%</Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            Percent of Average:
                        </Text>
                        <Text {...text}>{percentOfAverage}%</Text>
                    </Group>
                </Box>
                {verticalDivider ? (
                    <Divider orientation="vertical" />
                ) : (
                    <Divider w="100%" />
                )}

                <Box className={styles.metricsGroup}>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            Capacity:
                        </Text>
                        <Text {...text}>
                            {capacity.toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            30-year Average:
                        </Text>
                        <Text {...text}>
                            {Math.round(average).toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            (High) 90<sup>th</sup> Percentile:
                        </Text>
                        <Text {...text}>
                            {ninetiethPercentile.toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            (Low) 10<sup>th</sup> Percentile:
                        </Text>
                        <Text {...text}>
                            {tenthPercentile.toLocaleString('en-US')}
                            &nbsp;acre-feet
                        </Text>
                    </Group>
                </Box>
            </Flex>
        </Stack>
    );
};
