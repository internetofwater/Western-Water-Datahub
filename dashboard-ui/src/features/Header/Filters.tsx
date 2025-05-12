/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Switch } from '@mantine/core';
import styles from '@/features/Header/Header.module.css';
import { useEffect, useState } from 'react';
import { useMap } from '@/contexts/MapContexts';
import {
    LayerId,
    MAP_ID,
    ReserviorIconImageExpression,
} from '@/features/Map/consts';

export const Filters: React.FC = () => {
    const [showTeacups, setShowTeacups] = useState(false);

    const { map } = useMap(MAP_ID);

    useEffect(() => {
        if (!map) {
            return;
        }

        const iconImage = map.getLayoutProperty(
            LayerId.Reservoirs,
            'icon-image'
        );

        setShowTeacups(iconImage !== 'default');
    }, [map]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (showTeacups) {
            map.setLayoutProperty(
                LayerId.Reservoirs,
                'icon-image',
                ReserviorIconImageExpression
            );
        } else {
            map.setLayoutProperty(LayerId.Reservoirs, 'icon-image', 'default');
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
