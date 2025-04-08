'use client';

import { ComboboxData, Loader, Select } from '@mantine/core';
import useMainStore from '@/lib/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId } from '@/features/Map/config';
import { useEffect, useState } from 'react';
import { createOptions } from './utils';

export const Region: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);

    const [regionOptions, setRegionOptions] = useState<ComboboxData>([]);

    useEffect(() => {
        if (!map) {
            return;
        }

        const regionOptions = createOptions(
            map,
            SourceId.Regions,
            'REGION',
            'All Regions'
        );
        setRegionOptions(regionOptions);
    }, [map]);

    return (
        <>
            {regionOptions.length > 0 ? (
                <Select
                    id="regionSelector"
                    searchable
                    data={regionOptions}
                    value={region}
                    placeholder="Select a region"
                    onChange={(_value) => setRegion(_value as string)}
                />
            ) : (
                <Loader color="#c8942b" type="dots" />
            )}
        </>
    );
};
