/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { GeoJsonProperties } from 'geojson';
import { ReservoirConfig } from '@/features/Map/types';
import { Card, Title, Text, Stack } from '@mantine/core';
import styles from '@/features/Popups/Popups.module.css';
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
                    Data as of:{' '}
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
        </Card>
    );
};
