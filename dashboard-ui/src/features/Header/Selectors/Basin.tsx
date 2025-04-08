'use client';

import { Select } from '@mantine/core';
import useMainStore from '@/lib/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID } from '@/features/Map/config';
import { useEffect, useState } from 'react';

export const Basin: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const basin = useMainStore((state) => state.basin);
    const setBasin = useMainStore((state) => state.setBasin);

    useEffect(() => {
        if (!map) {
            return;
        }
    }, [map]);

    return (
        <Select
            id="basinSelector"
            searchable
            data={[{ value: 'all', label: 'All Basins' }]}
            value={basin}
            placeholder="Select a region"
            onChange={(_value) => setBasin(_value as string)}
        />
    );
};
