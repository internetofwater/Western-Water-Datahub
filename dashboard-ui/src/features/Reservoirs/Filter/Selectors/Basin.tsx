/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { MultiSelect, Skeleton } from '@mantine/core';
import useMainStore from '@/stores/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId, ValidBasins } from '@/features/Map/consts';
import { useEffect, useState } from 'react';
import styles from '@/features/Reservoirs/Reservoirs.module.css';
import geoconnexService from '@/services/init/geoconnex.init';
import { formatOptions } from '@/features/Reservoirs/Filter/Selectors/utils';
import { FeatureCollection, Polygon } from 'geojson';
import {
    Huc02BasinField,
    Huc06BasinProperties,
} from '@/features/Map/types/basin';
import { SourceDataEvent } from '@/features/Map/types';
import { isSourceDataLoaded } from '@/features/Map/utils';
import { useLoading } from '@/hooks/useLoading';

export const Basin: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const basin = useMainStore((state) => state.basin);
    const setBasin = useMainStore((state) => state.setBasin);
    const basinOptions = useMainStore((state) => state.basinOptions);
    const setBasinOptions = useMainStore((state) => state.setBasinOptions);

    const [loading, setLoading] = useState(true);

    const { isFetchingReservoirs, isGeneratingReport } = useLoading();

    useEffect(() => {
        if (!map) {
            return;
        }
        // Ensure both map and populating fetch are finished
        const sourceCallback = (e: SourceDataEvent) => {
            if (isSourceDataLoaded(map, SourceId.Basins, e)) {
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
            .getItems<FeatureCollection<Polygon, Huc06BasinProperties>>(
                SourceId.Basins,
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
                    const basinOptions = formatOptions(
                        featureCollection.features.filter((feature) =>
                            ValidBasins.includes(String(feature.id))
                        ),
                        (feature) => String(feature.id),
                        (feature) =>
                            String(feature?.properties?.[Huc02BasinField.Name]),
                        { defaultLabel: '', defaultValue: '', noDefault: true }
                    );

                    if (isMounted) {
                        setBasinOptions(basinOptions);
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
            {loading || basinOptions.length === 0 ? (
                <Skeleton
                    height={54} // Default dimensions of select
                    width={155}
                />
            ) : (
                <MultiSelect
                    size="xs"
                    id="basinSelector"
                    className={styles.multiselect}
                    disabled={isDisabled}
                    data={basinOptions}
                    value={basin}
                    aria-label="Select a Basin"
                    placeholder="Select a basin"
                    label="Filter by Geography"
                    onChange={setBasin}
                    searchable
                    clearable
                />
            )}
        </>
    );
};
