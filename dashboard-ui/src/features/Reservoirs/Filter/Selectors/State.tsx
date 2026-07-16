/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { MultiSelect, Skeleton } from '@mantine/core';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId, ValidStates } from '@/features/Map/consts';
import { useEffect, useState } from 'react';
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
    const stateOptions = useMainStore((state) => state.stateOptions);
    const setStateOptions = useMainStore((state) => state.setStateOptions);

    const { map } = useMap(MAP_ID);

    const [loading, setLoading] = useState(true);

    const { isFetchingReservoirs, isGeneratingReport } = useLoading();

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

    useEffect(() => {
        let isMounted = true;

        const controller = new AbortController();

        geoconnexService
            .getItems<FeatureCollection<Polygon, StateProperties>>(
                SourceId.States,
                {
                    params: {
                        bbox: [-125, 24, -96.5, 49],
                        skipGeometry: true,
                    },
                    signal: controller.signal,
                }
            )
            .then((featureCollection) => {
                if (featureCollection.features.length > 0) {
                    const stateOptions = formatOptions(
                        featureCollection.features.filter((feature) =>
                            ValidStates.includes(
                                feature.properties[StateField.Acronym]
                            )
                        ),
                        (feature) =>
                            String(feature?.properties?.[StateField.Uri]),
                        (feature) =>
                            String(feature?.properties?.[StateField.Name]),
                        { defaultLabel: '', defaultValue: '', noDefault: true }
                    );

                    if (isMounted) {
                        setStateOptions(stateOptions);
                    }
                }
            })
            .catch((error) => {
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
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
            if (controller) {
                controller.abort('Component unmount');
            }
        };
    }, []);

    const isDisabled = isFetchingReservoirs || isGeneratingReport;

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
                    disabled={isDisabled}
                    data={stateOptions}
                    value={state}
                    aria-label="Select a State"
                    placeholder="Select a State"
                    label="Filter by State"
                    onChange={setState}
                    searchable
                    clearable
                />
            )}
        </>
    );
};
