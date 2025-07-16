/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { GeoJsonProperties } from 'geojson';
import { ReservoirConfig } from '@/features/Map/types';
import { Card, Title, Text, Group } from '@mantine/core';
import styles from '@/features/Popups/Popups.module.css';
import { TextBlock } from '@/components/TextBlock';
import { Graphic } from '@/features/Reservior/TeacupDiagram/Graphic';
import useMainStore from '@/lib/main';

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

    // TODO: replace the division by 2 when possible
    const storage = Number(reservoirProperties[config.storageProperty]) / 2;
    const capacity = Number(reservoirProperties[config.capacityProperty]);
    // TODO: replace the average when available
    const average = Math.round(storage * 1.3);
    const percentFull = ((storage / capacity) * 100).toFixed(1);
    const percentOfAverage = ((storage / average) * 100).toFixed(1);

    const today = new Date();
    const lastUpdateDate = `${String(today.getMonth() + 1).padStart(
        2,
        '0'
    )}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    return (
        <Card
            shadow="sm"
            padding="sm"
            radius="md"
            withBorder
            className={styles.reservoirPopup}
        >
            <Group>
                <Title order={4}>
                    {reservoirProperties[config.labelProperty]}
                </Title>
                <Text size="xs" ml="auto">
                    Last Updated: {lastUpdateDate}
                </Text>
            </Group>

            <Group justify="space-between" wrap="nowrap">
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
            </Group>
            <Text mx="auto">Click to Learn More</Text>
        </Card>
    );
};
