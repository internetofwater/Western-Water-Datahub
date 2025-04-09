'use client';

import { ComboboxData, Select, Skeleton } from '@mantine/core';
import useMainStore from '@/lib/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId } from '@/features/Map/config';
import { useEffect, useState } from 'react';
import {
    createFilteredOptions,
    createOptions,
    shouldLoadOptions,
} from './utils';

export const Reservoir: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);

    const [reservoirOptions, setReservoirOptions] = useState<ComboboxData>([]);

    useEffect(() => {
        if (!map) {
            return;
        }

        map.on('sourcedata', function sourceCallback(e) {
            if (shouldLoadOptions(map, SourceId.Reservoirs, e)) {
                const _reservoirOptions = createOptions(
                    map,
                    SourceId.Reservoirs,
                    'locName',
                    'All Reservoirs'
                );
                setReservoirOptions(_reservoirOptions);
                map.off('sourcedata', sourceCallback); //remove event listener
            }
        });
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
        } else {
            const _reservoirOptions = createOptions(
                map,
                SourceId.Reservoirs,
                'locName',
                'All Reservoirs'
            );
            setReservoirOptions(_reservoirOptions);
        }
    }, [region]);

    const handleChange = (value: string | null) => {
        if (!value || !map) {
            return;
        }

        const features = map.querySourceFeatures(SourceId.Reservoirs, {
            sourceLayer: SourceId.Reservoirs,
            filter: ['==', ['get', 'locName'], value],
        });
        if (features && features.length > 0) {
            const feature = features[0];

            if (feature && feature.properties) {
                const region = feature.properties.region as string;

                setRegion(region);
            }
        }

        setReservoir(value);
    };

    return (
        <Skeleton
            height={36} // Default dimensions of select
            width={207}
            visible={reservoirOptions.length === 0}
        >
            <Select
                id="reservoirSelector"
                searchable
                data={reservoirOptions}
                value={reservoir}
                defaultValue={reservoir}
                aria-label="Select a Reservior"
                placeholder="Select a Reservior"
                onChange={(_value) => handleChange(_value)}
            />
        </Skeleton>
    );
};
