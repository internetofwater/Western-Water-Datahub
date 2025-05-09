/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { ComboboxData, Select, Skeleton } from '@mantine/core';
import useMainStore from '@/lib/main';
import {
    ReservoirRegionConnectorField,
    ReservoirLabelField,
    ReservoirIdentifierField,
    MAP_ID,
    SourceId,
} from '@/features/Map/consts';
import { useEffect, useRef, useState } from 'react';
import { formatOptions } from '@/features/Header/Selectors/utils';
import { useReservoirData } from '@/app/hooks/useReservoirData';
import { useMap } from '@/contexts/MapContexts';
import { isSourceDataLoaded } from '@/features/Map/utils';
import { SourceDataEvent } from '@/features/Map/types';

/**

 * @component
 */
export const Reservoir: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);

    const [reservoirOptions, setReservoirOptions] = useState<ComboboxData>([]);
    const [loading, setLoading] = useState(true);

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);

    const { map } = useMap(MAP_ID);

    const { reservoirCollection } = useReservoirData();

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (controller.current) {
                controller.current.abort('Component unmount');
            }
        };
    }, []);

    useEffect(() => {
        if (!map) {
            return;
        }

        // Ensure both map and populating fetch are finished
        const sourceCallback = (e: SourceDataEvent) => {
            if (isSourceDataLoaded(map, SourceId.Reservoirs, e)) {
                setLoading(false);
                map.off('sourcedata', sourceCallback); //remove event listener
            }
        };

        map.on('sourcedata', sourceCallback);

        return () => {
            map.off('sourcedata', sourceCallback);
        };
    }, [map]);

    useEffect(() => {
        if (!reservoirCollection) {
            return;
        }

        if (reservoirCollection.features.length) {
            const reservoirOptions = formatOptions(
                reservoirCollection.features,
                (feature) => String(feature?.id),
                (feature) => String(feature?.properties?.[ReservoirLabelField]),
                'All Reservoirs'
            );

            setReservoirOptions(reservoirOptions);
        }
    }, [reservoirCollection]);

    useEffect(() => {
        if (!reservoirCollection) {
            return;
        }

        if (region && region !== 'all') {
            const features = reservoirCollection.features.filter(
                (feature) =>
                    feature.properties[ReservoirRegionConnectorField]?.[0] ===
                    region
            );

            const reservoirOptions = formatOptions(
                features,
                (feature) => String(feature?.id),
                (feature) => String(feature?.properties?.[ReservoirLabelField]),
                'All Reservoirs'
            );

            setReservoirOptions(reservoirOptions);
        } else {
            const reservoirOptions = formatOptions(
                reservoirCollection.features,
                (feature) => String(feature?.id),
                (feature) => String(feature?.properties?.[ReservoirLabelField]),
                'All Reservoirs'
            );

            setReservoirOptions(reservoirOptions);
        }
    }, [region]);

    const handleChange = (value: string | null) => {
        if (!value) {
            return;
        }

        const reservoidId = Number(value);
        if (reservoirCollection) {
            const features = reservoirCollection.features.filter(
                (feature) =>
                    feature.properties[ReservoirIdentifierField] === reservoidId
            );
            if (features.length) {
                const feature = features[0];
                const locationRegionNames =
                    feature.properties[ReservoirRegionConnectorField];

                if (locationRegionNames.length === 1) {
                    const region = locationRegionNames[0];
                    if (isMounted.current) {
                        setRegion(region);
                    }
                }
            }
        }

        setReservoir(reservoidId);
    };

    return (
        <Skeleton
            height={36} // Default dimensions of select
            width={207}
            visible={loading || reservoirOptions.length === 0}
        >
            <Select
                id="reservoirSelector"
                searchable
                data={reservoirOptions}
                value={String(reservoir)}
                data-testid="reservoir-select"
                aria-label="Select a Reservior"
                placeholder="Select a Reservior"
                onChange={(_value) => handleChange(_value)}
            />
        </Skeleton>
    );
};
