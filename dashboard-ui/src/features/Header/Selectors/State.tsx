/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { ComboboxData, Select, Skeleton } from '@mantine/core';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID } from '@/features/Map/consts';
import { useEffect, useState } from 'react';
import styles from '@/features/Header/Header.module.css';

export const State: React.FC = () => {
    const { map } = useMap(MAP_ID);

    // const basin = useMainStore((state) => state.basin);
    // const setBasin = useMainStore((state) => state.setBasin);

    const [stateOptions] = useState<ComboboxData>([
        {
            value: 'all',
            label: 'All States',
        },
    ]);

    useEffect(() => {
        if (!map) {
            return;
        }
    }, [map]);

    return (
        <Skeleton
            height={36} // Default dimensions of select
            width={207}
            visible={false}
            className={styles.skeleton}
        >
            <Select
                id="stateSelector"
                searchable
                data={stateOptions}
                value={'all'}
                aria-label="Select a State"
                placeholder="Select a State"
                onChange={() => {}}
            />
        </Skeleton>
    );
};
