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
    createFilteredOptions,
    createOptions,
    shouldLoadOptions,
    SourceDataEvent,
} from '@/features/Header/Selectors/utils';
import {
    ReservoirIdentifierField,
    ReservoirRegionConnectorField,
} from '@/features/Map/types';
import { parseReservoirProperties } from '@/features/Map/utils';

/**

 * @component
 */
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

        const sourceCallback = (e: SourceDataEvent) => {
            if (shouldLoadOptions(map, SourceId.Reservoirs, e)) {
                const _reservoirOptions = createOptions(
                    map,
                    SourceId.Reservoirs,
                    'name',
                    'All Reservoirs'
                );
                setReservoirOptions(_reservoirOptions);
                map.off('sourcedata', sourceCallback); //remove event listener
            }
        };

        map.on('sourcedata', sourceCallback);

        return () => {
            map.off('sourcedata', sourceCallback);
        };
    }, [map]);

    useEffect(() => {
        if (!map) {
            return;
        }

        if (region && region !== 'all') {
            const reservoirOptions = createFilteredOptions(
                map,
                SourceId.Reservoirs,
                ['all', ['in', region, ['get', ReservoirRegionConnectorField]]],
                'name',
                'All Reservoirs'
            );
            setReservoirOptions(reservoirOptions);
        } else {
            const _reservoirOptions = createOptions(
                map,
                SourceId.Reservoirs,
                'name',
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
            filter: ['==', ['get', ReservoirIdentifierField], value],
        });
        if (features && features.length > 0) {
            const feature = features[0];

            if (feature && feature.properties) {
                const value = feature.properties[
                    ReservoirRegionConnectorField
                ] as string;
                const locationRegionNames = parseReservoirProperties(
                    ReservoirRegionConnectorField,
                    value
                );

                if (locationRegionNames.length === 1) {
                    const region = locationRegionNames[0];
                    setRegion(region);
                }
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
                data-testid="reservoir-select"
                aria-label="Select a Reservior"
                placeholder="Select a Reservior"
                onChange={(_value) => handleChange(_value)}
            />
        </Skeleton>
    );
};
