/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import { Group, Flex, Text } from '@mantine/core';
import { GeoJsonProperties } from 'geojson';
import { useState } from 'react';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Metrics } from '@/features/Reservior/Info/Metrics';
import { TeacupDiagram } from '@/features/Reservior/TeacupDiagram';
import { Legend } from '@/features/Reservior/Info/Legend';
import { Properties } from '@/components/Map/types';

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

    const handleLabelsChange = (showLabels: boolean) => {
        setShowLabels(showLabels);
    };

    const isDataValid = (
        reservoirProperties: Properties,
        config: ReservoirConfig
    ): boolean => Boolean(reservoirProperties[config.storageProperty]);

    return (
        <>
            <Group
                align="flex-start"
                justify="space-between"
                className={styles.infoChartGroup}
            >
                <Flex className={styles.graphicPanel}>
                    {isDataValid(reservoirProperties, config) ? (
                        <>
                            <Legend
                                showLabels={showLabels}
                                onChange={handleLabelsChange}
                            />
                            <TeacupDiagram
                                reservoirProperties={reservoirProperties}
                                config={config}
                                showLabels={showLabels}
                            />
                        </>
                    ) : (
                        <Text ta={'center'}>
                            This reservoir has no capacity measurement for the
                            selected date.
                        </Text>
                    )}
                </Flex>
                <Metrics
                    reservoirProperties={reservoirProperties}
                    config={config}
                />
            </Group>
        </>
    );
};

export default InfoWrapper;
