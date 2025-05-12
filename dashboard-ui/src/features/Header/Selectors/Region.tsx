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

            const queryFeaturesResult = await esriService.getFeatures(
                controller.current.signal
            );

            if (queryFeaturesResult.features.length) {
                const regionOptions = formatOptions(
                    queryFeaturesResult.features,
                    (feature) => String(feature?.properties?.['REGION']),
                    (feature) => String(feature?.properties?.['REGION']),
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
        void getRegionOptions();
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (controller.current) {
                controller.current.abort('Component unmount');
            }
        };
    }, []);

    return (
        <Skeleton
            height={36} // Default dimensions of select
            width={207}
            visible={loading || regionOptions.length === 0}
        >
            <Select
                id="regionSelector"
                searchable
                data={regionOptions}
                value={region}
                data-testid="region-select"
                aria-label="Select a region"
                placeholder="Select a region"
                onChange={(_value) => setRegion(_value as string)}
            />
        </Skeleton>
    );
};
