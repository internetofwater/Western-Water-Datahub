/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { ComboboxData, MultiSelect, Skeleton } from '@mantine/core';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId, ValidStates } from '@/features/Map/consts';
import { useEffect, useRef, useState } from 'react';
import styles from '@/features/Reservoirs/Reservoirs.module.css';
import { SourceDataEvent } from '@/features/Map/types';
import { isSourceDataLoaded } from '@/features/Map/utils';
import geoconnexService from '@/services/init/geoconnex.init';
import { FeatureCollection, Polygon } from 'geojson';
import { formatOptions } from '@/features/Reservoirs/Filter/Selectors/utils';
import { StateField, StateProperties } from '@/features/Map/types/state';
import useMainStore from '@/stores/main';
import { useLoading } from '@/hooks/useLoading';

export const State: React.FC = () => {
    const state = useMainStore((state) => state.state);
    const setState = useMainStore((state) => state.setState);

    const { map } = useMap(MAP_ID);

    const [loading, setLoading] = useState(true);
    const [stateOptions, setStateOptions] = useState<ComboboxData>([]);

    const { isFetchingReservoirs } = useLoading();

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        if (!map) {
            return;
        }
        // Ensure both map and populating fetch are finished
        const sourceCallback = (e: SourceDataEvent) => {
            if (isSourceDataLoaded(map, SourceId.States, e)) {
                setLoading(false);
                map.off('sourcedata', sourceCallback); //remove event listener
            }
        };

        map.on('sourcedata', sourceCallback);

        return () => {
            map.off('sourcedata', sourceCallback);
        };
    }, [map]);

    const getBasinOptions = async () => {
        try {
            controller.current = new AbortController();

            const stateFeatureCollection = await geoconnexService.getItems<
                FeatureCollection<Polygon, StateProperties>
            >(SourceId.States, {
                params: {
                    bbox: [-125, 24, -96.5, 49],
                    skipGeometry: true,
                },
            });

            if (stateFeatureCollection.features.length) {
                const basinOptions = formatOptions(
                    stateFeatureCollection.features.filter((feature) =>
                        ValidStates.includes(
                            feature.properties[StateField.Acronym]
                        )
                    ),
                    (feature) =>
                        String(feature?.properties?.[StateField.Acronym]),
                    (feature) => String(feature?.properties?.[StateField.Name]),
                    '',
                    '',
                    true
                );

                if (isMounted.current) {
                    setStateOptions(basinOptions);
                }
            }
        } catch (error) {
            if (
                (error as Error)?.name === 'AbortError' ||
                (typeof error === 'string' && error === 'Component unmount')
            ) {
                console.log('Fetch request canceled');
            } else {
                if ((error as Error)?.message) {
                    const _error = error as Error;
                    console.error(_error);
                }
            }
        }
    };

    useEffect(() => {
        isMounted.current = true;
        void getBasinOptions();
        return () => {
            isMounted.current = false;
            if (controller.current) {
                controller.current.abort('Component unmount');
            }
        };
    }, []);

    return (
        <>
            {loading || stateOptions.length === 0 ? (
                <Skeleton
                    height={54} // Default dimensions of select
                    width={155}
                />
            ) : (
                <MultiSelect
                    size="xs"
                    id="stateSelector"
                    className={styles.multiselect}
                    disabled={isFetchingReservoirs}
                    data={stateOptions}
                    value={state}
                    aria-label="Select a State"
                    placeholder="Select a State"
                    label="Filter by State"
                    onChange={(_value) => {
                        if (_value) {
                            setState(_value);
                        } else {
                            setState([]);
                        }
                    }}
                    searchable
                    clearable
                />
            )}
        </>
    );
};
