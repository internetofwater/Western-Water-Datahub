/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { ComboboxData, Select, Skeleton } from '@mantine/core';
import useMainStore from '@/lib/main';
import { useEffect, useRef, useState } from 'react';
import { formatOptions } from '@/features/Header/Selectors/utils';
import esriService from '@/services/init/esri.init';
import { MAP_ID, SourceId } from '@/features/Map/consts';
import { isSourceDataLoaded } from '@/features/Map/utils';
import { SourceDataEvent } from '@/features/Map/types';
import { useMap } from '@/contexts/MapContexts';
import styles from '@/features/Header/Header.module.css';
import { RegionField } from '@/features/Map/types/region';
import { RegionDefault } from '@/lib/consts';

/**

 * @component
 */
export const Region: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);

    const [regionOptions, setRegionOptions] = useState<ComboboxData>([]);
    const [loading, setLoading] = useState(true);

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);

    const { map } = useMap(MAP_ID);

    useEffect(() => {
        if (!map) {
            return;
        }

        // Ensure both map and populating fetch are finished
        const sourceCallback = (e: SourceDataEvent) => {
            if (isSourceDataLoaded(map, SourceId.Regions, e)) {
                setLoading(false);
                map.off('sourcedata', sourceCallback); //remove event listener
            }
        };

        map.on('sourcedata', sourceCallback);

        return () => {
            map.off('sourcedata', sourceCallback);
        };
    }, [map]);

    const getRegionOptions = async () => {
        try {
            controller.current = new AbortController();

            const regionFeatureCollection = await esriService.getFeatures(
                controller.current.signal
            );

            if (regionFeatureCollection.features.length) {
                const regionOptions = formatOptions(
                    regionFeatureCollection.features.filter((feature) =>
                        [5, 6, 7, 8, 9, 10].includes(
                            feature.properties![RegionField.RegNum] as number
                        )
                    ),
                    (feature) =>
                        String(feature?.properties?.[RegionField.Name]),
                    (feature) =>
                        String(feature?.properties?.[RegionField.Name]),
                    'All Regions'
                );

                if (isMounted.current) {
                    setRegionOptions(regionOptions);
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
        void getRegionOptions();
        return () => {
            isMounted.current = false;
            if (controller.current) {
                controller.current.abort('Component unmount');
            }
        };
    }, []);

    return (
        <Skeleton
            height={60} // Default dimensions of select
            width={207}
            visible={loading || regionOptions.length === 0}
            className={styles.skeleton}
        >
            <Select
                id="regionSelector"
                searchable
                data={regionOptions}
                value={region}
                data-testid="region-select"
                aria-label="Select a region"
                placeholder="Select a region"
                label="Filter by Region"
                onChange={(value) => {
                    if (value) {
                        setRegion(value);
                    } else {
                        setRegion(RegionDefault);
                    }
                }}
                clearable
            />
        </Skeleton>
    );
};
