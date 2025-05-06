/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { ComboboxData, Select, Skeleton } from '@mantine/core';
import useMainStore from '@/lib/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId } from '@/features/Map/config';
import { useEffect, useState } from 'react';
import {
    createOptions,
    shouldLoadOptions,
    SourceDataEvent,
} from '@/features/Header/Selectors/utils';

/**

 * @component
 */
export const Region: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);

    const [regionOptions, setRegionOptions] = useState<ComboboxData>([]);

    useEffect(() => {
        if (!map) {
            return;
        }

        const sourceCallback = (e: SourceDataEvent) => {
            if (shouldLoadOptions(map, SourceId.Regions, e)) {
                const regionOptions = createOptions(
                    map,
                    SourceId.Regions,
                    'REGION',
                    'All Regions'
                );
                setRegionOptions(regionOptions);
                map.off('sourcedata', sourceCallback);
            }
        };

        map.on('sourcedata', sourceCallback);

        return () => {
            map.off('sourcedata', sourceCallback);
        };
    }, [map]);

    return (
        <Skeleton
            height={36} // Default dimensions of select
            width={207}
            visible={regionOptions.length === 0}
        >
            <Select
                id="regionSelector"
                searchable
                data={regionOptions}
                value={region}
                data-testid="region-select"
                aria-label="Select a region"
                placeholder="Select a region"
                onChange={(_value) => setRegion(_value as string)}
            />
        </Skeleton>
    );
};
