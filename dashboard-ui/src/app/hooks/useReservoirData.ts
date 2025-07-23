/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from 'react';
import wwdhService from '@/services/init/wwdh.init';
import { FeatureCollection, GeoJsonProperties, Point } from 'geojson';
import useMainStore, { ReservoirCollections } from '@/lib/main';
import { ReservoirConfigs, SourceId } from '@/features/Map/consts';
import { appendResvizDataProperties } from '@/features/Map/utils';

export const useReservoirData = () => {
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );
    const setReservoirCollections = useMainStore(
        (state) => state.setReservoirCollections
    );
    // const reservoirDate = useMainStore((state) => state.reservoirDate);

    const [loading, setLoading] = useState(false);
    const controller = useRef<AbortController | null>(null);
    const isMounted = useRef(true);

    const fetchReservoirLocations = async () => {
        try {
            setLoading(true);
            controller.current = new AbortController();
            const reservoirCollections: ReservoirCollections = {};

            for (const config of ReservoirConfigs) {
                const result = await wwdhService.getLocations<
                    FeatureCollection<Point, GeoJsonProperties>
                >(config.id, {
                    signal: controller.current.signal,
                    params: config.params,
                });
                if (config.id === SourceId.ResvizEDRReservoirs) {
                    const processedResult = await appendResvizDataProperties(
                        result
                    );
                    reservoirCollections[config.id] = processedResult;
                }
            }

            if (isMounted.current) {
                setReservoirCollections(reservoirCollections);
                setLoading(false);
            }
        } catch (error) {
            if ((error as Error)?.name !== 'AbortError') {
                console.error(error);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMounted.current = true;
        if (!reservoirCollections) {
            void fetchReservoirLocations();
        }

        return () => {
            isMounted.current = false;
            controller.current?.abort();
        };
    }, []);

    return {
        reservoirCollections,
        loading,
    };
};
