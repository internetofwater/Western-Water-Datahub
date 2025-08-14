/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { GeoJsonProperties } from 'geojson';
import { ReservoirConfig } from '@/features/Map/types';
import { Card, Title, Text, Group, Stack } from '@mantine/core';
import styles from '@/features/Popups/Popups.module.css';
import { TextBlock } from '@/components/TextBlock';
import { Graphic } from '@/features/Reservior/TeacupDiagram/Graphic';
import useMainStore from '@/lib/main';
import dayjs from 'dayjs';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
};

export const ReservoirPopup: React.FC<Props> = (props) => {
    const { reservoirProperties, config } = props;

    const colorScheme = useMainStore((state) => state.colorScheme);

    if (!reservoirProperties) {
        return null;
    }

    const storage = Number(reservoirProperties[config.storageProperty]);
    const capacity = Number(reservoirProperties[config.capacityProperty]);
    const average = Number(
        reservoirProperties[config.thirtyYearAverageProperty]
    );
    const percentFull = ((storage / capacity) * 100).toFixed(1);
    const percentOfAverage = ((storage / average) * 100).toFixed(1);

    return (
        <Card
            shadow="sm"
            padding="sm"
            radius="md"
            withBorder
            className={styles.reservoirPopup}
        >
            <Stack align="center" gap="xs">
                <Title order={4} size="h5">
                    {reservoirProperties[config.labelProperty]}
                </Title>
                <Text size="xs">
                    Last Updated:{' '}
                    {dayjs(
                        reservoirProperties[
                            config.storageDateProperty
                        ] as string
                    ).format('MM/DD/YYYY')}
                </Text>
                <Graphic
                    reservoirProperties={reservoirProperties}
                    config={config}
                    showLabels={false}
                    labels={false}
                    listeners={false}
                    colorScheme={colorScheme}
                />
                <Text size="sm">Click to Learn More</Text>
            </Stack>

            {/* <Group justify="space-between" wrap="nowrap">
                <Graphic
                    reservoirProperties={reservoirProperties}
                    config={config}
                    showLabels={false}
                    labels={false}
                    listeners={false}
                    colorScheme={colorScheme}
                />
                <TextBlock>
                    <Group gap="xs" justify="flex-start">
                        <Text size="sm" fw={700}>
                            Capacity:
                        </Text>
                        <Text size="sm">
                            {capacity.toLocaleString('en-US')}&nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text size="sm" fw={700}>
                            Storage:
                        </Text>
                        <Text size="sm">
                            {storage.toLocaleString('en-US')}&nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text size="sm" fw={700}>
                            Average:
                        </Text>
                        <Text size="sm">
                            {average.toLocaleString('en-US')}&nbsp;acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text size="sm" fw={700}>
                            Percent Full:
                        </Text>
                        <Text size="sm">{percentFull}%</Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text size="sm" fw={700}>
                            Percent of Average:
                        </Text>
                        <Text size="sm">{percentOfAverage}%</Text>
                    </Group>
                </TextBlock>
            </Group> 
            <Text size="sm" mx="auto">
                Click to Learn More
            </Text>*/}
        </Card>
    );
};
