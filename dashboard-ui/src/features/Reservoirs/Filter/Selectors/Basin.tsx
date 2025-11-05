/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { ComboboxData, Select, Skeleton } from '@mantine/core';
import useMainStore from '@/stores/main/main';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID, SourceId, ValidBasins } from '@/features/Map/consts';
import { useEffect, useRef, useState } from 'react';
import styles from '@/features/Header/Header.module.css';
import geoconnexService from '@/services/init/geoconnex.init';
import { formatOptions } from '@/features/Header/Selectors/utils';
import { FeatureCollection, Polygon } from 'geojson';
import {
    Huc02BasinField,
    Huc06BasinProperties,
} from '@/features/Map/types/basin';
import { SourceDataEvent } from '@/features/Map/types';
import { isSourceDataLoaded } from '@/features/Map/utils';
import { BasinDefault } from '@/stores/main/consts';

export const Basin: React.FC = () => {
    const { map } = useMap(MAP_ID);

    const basin = useMainStore((state) => state.basin);
    const setBasin = useMainStore((state) => state.setBasin);

    const [loading, setLoading] = useState(true);
    const [basinOptions, setBasinOptions] = useState<ComboboxData>([]);

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);

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

    const getBasinOptions = async () => {
        try {
            controller.current = new AbortController();

            const basinFeatureCollection = await geoconnexService.getItems<
                FeatureCollection<Polygon, Huc06BasinProperties>
            >(SourceId.Basins, {
                params: {
                    bbox: [-125, 24, -96.5, 49],
                    skipGeometry: true,
                },
            });

            if (basinFeatureCollection.features.length) {
                const basinOptions = formatOptions(
                    basinFeatureCollection.features.filter((feature) =>
                        ValidBasins.includes(String(feature.id))
                    ),
                    (feature) => String(feature.id),
                    (feature) =>
                        String(feature?.properties?.[Huc02BasinField.Name]),
                    'All Basins'
                );

                if (isMounted.current) {
                    setLoading(false);
                    setBasinOptions(basinOptions);
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
        <Skeleton
            height={60} // Default dimensions of select
            width={207}
            visible={loading || basinOptions.length === 0}
            className={styles.skeleton}
        >
            <Select
                size="xs"
                id="basinSelector"
                searchable
                data={basinOptions}
                value={basin}
                aria-label="Select a Basin"
                placeholder="Select a basin"
                label="Filter by Geography"
                onChange={(value) => {
                    if (value) {
                        setBasin(value);
                    } else {
                        setBasin(BasinDefault);
                    }
                }}
                clearable
            />
        </Skeleton>
    );
};
