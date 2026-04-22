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
import {
    displayPercentage,
    displayVolumeWithUnits,
} from '@/utils/reservoirDataDisplay';
import { SourceId } from '@/features/Map/consts';
import { TeacupReservoirField } from '@/features/Map/types/reservoir/teacup';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
};

/**
 *
 * @component
 */
export const Metrics: React.FC<Props> = (props) => {
    const { reservoirProperties, config } = props;

    const verticalDivider = useMediaQuery(
        '(min-width: 664px) and (max-width: 866px)'
    );

    if (!reservoirProperties) {
        return null;
    }

    const getLabel = (label: string) => {
        if (config.id === SourceId.TeacupEDRReservoirs) {
            const totalOrActive = String(
                reservoirProperties[
                    TeacupReservoirField.UseTotalOrActiveStorage
                ]
            );
            return `${label} (${totalOrActive})`;
        }

        return label;
    };

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

    const percentFull = (storage / capacity) * 100;
    const percentOfAverage = (storage / average) * 100;

    const text = {
        size: 'lg',
    };

    return (
        <Stack className={styles.metricsWrapper}>
            <Text size="sm">
                Data as of:{' '}
                {reservoirProperties[config.storageDateProperty]
                    ? dayjs(
                          reservoirProperties[
                              config.storageDateProperty
                          ] as string
                      ).format('MM/DD/YYYY')
                    : 'N/A'}
            </Text>
            <Flex gap="var(--default-spacing)" className={styles.metrics}>
                <Box className={styles.metricsGroup}>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            {getLabel('Storage')}:
                        </Text>
                        <Text {...text}>{displayVolumeWithUnits(storage)}</Text>
                    </Group>

                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            Percent Full:
                        </Text>
                        <Text {...text}>{displayPercentage(percentFull)}</Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            Percent of Average:
                        </Text>
                        <Text {...text}>
                            {displayPercentage(percentOfAverage)}
                        </Text>
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
                            {getLabel('Capacity')}:
                        </Text>
                        <Text {...text}>
                            {displayVolumeWithUnits(capacity)}
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            30-year Average:
                        </Text>
                        <Text {...text}>{displayVolumeWithUnits(average)}</Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            High (90<sup>th</sup> Percentile):
                        </Text>
                        <Text {...text}>
                            {displayVolumeWithUnits(ninetiethPercentile)}
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text {...text} fw={700}>
                            Low (10<sup>th</sup> Percentile):
                        </Text>
                        <Text {...text}>
                            {displayVolumeWithUnits(tenthPercentile)}
                        </Text>
                    </Group>
                </Box>
            </Flex>
        </Stack>
    );
};
