/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { ComboboxData, Select, Skeleton } from '@mantine/core';
import useMainStore from '@/lib/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID } from '@/features/Map/config';
import { useEffect, useState } from 'react';

export const Basin: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const basin = useMainStore((state) => state.basin);
    const setBasin = useMainStore((state) => state.setBasin);

    const [basinOptions] = useState<ComboboxData>([
        { value: 'all', label: 'All Basins' },
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
            visible={basinOptions.length === 0}
        >
            <Select
                id="basinSelector"
                searchable
                data={basinOptions}
                value={basin}
                aria-label="Select a Basin"
                placeholder="Select a basin"
                onChange={(_value) => setBasin(_value as string)}
            />
        </Skeleton>
    );
};
