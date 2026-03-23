/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import { Group, Flex, Text } from '@mantine/core';
import { GeoJsonProperties } from 'geojson';
import { useEffect, useState } from 'react';
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

    const [showLabels, setShowLabels] = useState(true);
    const [excludedEntries, setExcludedEntries] = useState<string[]>([]);

    useEffect(() => {
        if (!reservoirProperties) {
            return;
        }

        const highPercentile = reservoirProperties[
            config.ninetiethPercentileProperty
        ] as number | undefined;
        const average = reservoirProperties[
            config.thirtyYearAverageProperty
        ] as number | undefined;
        const lowPercentile = reservoirProperties[
            config.tenthPercentileProperty
        ] as number | undefined;

        const excludedEntries: string[] = [];
        if (!highPercentile) {
            excludedEntries.push('high-percentile');
        }
        if (!average) {
            excludedEntries.push('average');
        }
        if (!lowPercentile) {
            excludedEntries.push('low-percentile');
        }

        setExcludedEntries(excludedEntries);
    }, [reservoirProperties, config]);

    const handleLabelsChange = (showLabels: boolean) => {
        setShowLabels(showLabels);
    };

    const isDataValid = (
        reservoirProperties: Properties,
        config: ReservoirConfig
    ): boolean => Boolean(reservoirProperties[config.storageProperty]);

    if (!reservoirProperties) {
        return null;
    }

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
                                excludeEntries={excludedEntries}
                            />
                            <TeacupDiagram
                                reservoirProperties={reservoirProperties}
                                config={config}
                                showLabels={showLabels}
                            />
                        </>
                    ) : (
                        <Text ta={'center'}>
                            This reservoir has no storage measurement for the
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
