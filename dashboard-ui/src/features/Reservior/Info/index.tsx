/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import { Group, Flex } from '@mantine/core';
import { GeoJsonProperties } from 'geojson';
import { useState } from 'react';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Info } from '@/features/Reservior/Info/Metrics';
import { TeacupDiagram } from '@/features/Reservior/TeacupDiagram';
import { Legend } from '@/features/Reservior/Info/Legend';

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

    return (
        <>
            <Group
                align="flex-start"
                justify="space-between"
                className={styles.infoChartGroup}
            >
                <Flex className={styles.graphicPanel}>
                    <Legend
                        showLabels={showLabels}
                        onChange={handleLabelsChange}
                    />
                    <TeacupDiagram
                        reservoirProperties={reservoirProperties}
                        config={config}
                        showLabels={showLabels}
                    />
                </Flex>
                <Info
                    reservoirProperties={reservoirProperties}
                    config={config}
                />
            </Group>
        </>
    );
};

export default InfoWrapper;
