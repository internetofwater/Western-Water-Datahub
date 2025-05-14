/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Switch } from '@mantine/core';
import styles from '@/features/Header/Header.module.css';
import { useEffect, useState } from 'react';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, ReservoirConfigs } from '@/features/Map/consts';
import { getReservoirIconImageExpression } from '@/features/Map/utils';

export const Filters: React.FC = () => {
    const [showTeacups, setShowTeacups] = useState(true);

    const { map } = useMap(MAP_ID);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (showTeacups) {
            ReservoirConfigs.forEach((config) =>
                config.connectedLayers.forEach((layerId) =>
                    map.setLayoutProperty(
                        layerId,
                        'icon-image',
                        getReservoirIconImageExpression(config)
                    )
                )
            );
        } else {
            ReservoirConfigs.forEach((config) =>
                config.connectedLayers.forEach((layerId) =>
                    map.setLayoutProperty(layerId, 'icon-image', 'default')
                )
            );
        }
    }, [showTeacups]);

    return (
        <Group className={styles.filterGroupContainer}>
            <Switch
                label="Show Teacups"
                checked={showTeacups}
                onClick={() => setShowTeacups(!showTeacups)}
            />
            <Switch label="Show Streamflow Gages" />
            <Switch label="Show Weather" />
            <Switch label="Flag Low Storage" />
        </Group>
    );
};
