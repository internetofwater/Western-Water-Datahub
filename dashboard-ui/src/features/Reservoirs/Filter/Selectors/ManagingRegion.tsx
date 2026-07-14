/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { MultiSelect, Skeleton } from '@mantine/core';
import useMainStore from '@/stores/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId } from '@/features/Map/consts';
import { useEffect, useRef, useState } from 'react';
import styles from '@/features/Reservoirs/Reservoirs.module.css';
import { formatOptions } from '@/features/Reservoirs/Filter/Selectors/utils';
import { FeatureCollection, Polygon } from 'geojson';
import { SourceDataEvent } from '@/features/Map/types';
import { isSourceDataLoaded } from '@/features/Map/utils';
import { useLoading } from '@/hooks/useLoading';
import wwdhService from '@/services/init/wwdh.init';
import {
    ManagingRegionField,
    ManagingRegionProperties,
} from '@/features/Map/types/managingRegion';

export const ManagingRegion: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const managingRegion = useMainStore((state) => state.managingRegion);
    const setManagingRegion = useMainStore((state) => state.setManagingRegion);
    const managingRegionOptions = useMainStore(
        (state) => state.managingRegionOptions
    );
    const setManagingRegionOptions = useMainStore(
        (state) => state.setManagingRegionOptions
    );

    const [loading, setLoading] = useState(true);

    const { isFetchingReservoirs, isGeneratingReport } = useLoading();

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        if (!map) {
            return;
        }
        // Ensure both map and populating fetch are finished
        const sourceCallback = (e: SourceDataEvent) => {
            if (isSourceDataLoaded(map, SourceId.ManagingRegions, e)) {
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

            const managingRegionCollection = await wwdhService.getItems<
                FeatureCollection<Polygon, ManagingRegionProperties>
            >(SourceId.ManagingRegions, {
                params: {
                    f: 'json',
                },
                signal: controller.current.signal,
            });

            if (managingRegionCollection.features.length) {
                const basinOptions = formatOptions(
                    managingRegionCollection.features,
                    (feature) =>
                        String(
                            feature?.properties?.[
                                ManagingRegionField.RegionAbbreviation
                            ]
                        ),
                    (feature) =>
                        String(feature?.properties?.[ManagingRegionField.Name]),
                    { defaultLabel: '', defaultValue: '', noDefault: true }
                );

                setManagingRegionOptions(basinOptions);

                if (isMounted.current) {
                    setLoading(false);
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

    const isDisabled = isFetchingReservoirs || isGeneratingReport;

    return (
        <>
            {loading || managingRegionOptions.length === 0 ? (
                <Skeleton
                    height={54} // Default dimensions of select
                    width={155}
                />
            ) : (
                <MultiSelect
                    size="xs"
                    id="managingRegionSelector"
                    className={styles.multiselect}
                    disabled={isDisabled}
                    searchable
                    data={managingRegionOptions}
                    value={managingRegion}
                    aria-label="Select a Region"
                    placeholder="Select a region"
                    label="Filter by Region"
                    onChange={(value: string[]) => {
                        if (value) {
                            setManagingRegion(value);
                        } else {
                            setManagingRegion([]);
                        }
                    }}
                    clearable
                />
            )}
        </>
    );
};
