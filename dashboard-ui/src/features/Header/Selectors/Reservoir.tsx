'use client';

import { ComboboxData, Loader, Select } from '@mantine/core';
import useMainStore from '@/lib/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId } from '@/features/Map/config';
import { useEffect, useState } from 'react';
import { createFilteredOptions, createOptions } from './utils';

export const Reservoir: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const region = useMainStore((state) => state.region);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);

    const [reservoirOptions, setReservoirOptions] = useState<ComboboxData>([]);
    useEffect(() => {
        if (!map) {
            return;
        }

        const reservoirOptions = createOptions(
            map,
            SourceId.Reservoirs,
            'locName',
            'All Reservoirs'
        );
        setReservoirOptions(reservoirOptions);
    }, [map]);

    useEffect(() => {
        if (!map) {
            return;
        }

        if (region !== 'all') {
            const reservoirOptions = createFilteredOptions(
                map,
                SourceId.Reservoirs,
                ['==', ['get', 'region'], region],
                'locName',
                'All Reservoirs'
            );
            setReservoirOptions(reservoirOptions);
        }
    }, [region]);

    return (
        <>
            {reservoirOptions.length > 0 ? (
                <Select
                    id="reservoirSelector"
                    searchable
                    data={reservoirOptions}
                    value={reservoir}
                    defaultValue={reservoir}
                    placeholder="Select a Reservior"
                    onChange={(_value) => setReservoir(_value as string)}
                />
            ) : (
                <Loader color="#c8942b" type="dots" />
            )}
        </>
    );
};
