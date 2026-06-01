/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef } from 'react';
import wwdhService from '@/services/init/wwdh.init';
import { FeatureCollection, GeoJsonProperties, Point } from 'geojson';
import useMainStore from '@/stores/main';
import { MAP_ID, SourceId } from '@/features/Map/consts';
import {
    appendTeacupDataProperties,
    getAllReservoirConfigs,
    getFeatures,
} from '@/features/Map/utils';
import { ReservoirCollections } from '@/stores/main/types';
import loadingManager from '@/managers/Loading.init';
import { LoadingType, NotificationType } from '@/stores/session/types';
import notificationManager from '@/managers/Notification.init';
import { useMap } from '@/contexts/MapContexts';
import { Map } from 'mapbox-gl';
import { ReservoirConfigId } from '@/features/Map/types';

export const useReservoirData = () => {
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );
    const setReservoirCollections = useMainStore(
        (state) => state.setReservoirCollections
    );

    const controller = useRef<AbortController | null>(null);
    const isMounted = useRef(true);

    const { map } = useMap(MAP_ID);

    const fetchReservoirLocations = async (map: Map) => {
        const loadingInstance = loadingManager.add(
            'Loading reservoir data',
            LoadingType.Reservoirs
        );

        try {
            controller.current = new AbortController();
            const reservoirCollections: ReservoirCollections = {};

            for (const config of getAllReservoirConfigs()) {
                let currentFeatureCollection;
                currentFeatureCollection = getFeatures<
                    Point,
                    GeoJsonProperties
                >(map, config.source);
                if (!currentFeatureCollection) {
                    currentFeatureCollection = await wwdhService.getItems<
                        FeatureCollection<Point, GeoJsonProperties>
                    >(config.source, {
                        signal: controller.current.signal,
                        params: config.params,
                    });
                }

                if (!currentFeatureCollection) {
                    console.error(
                        'Unable to retrieve basic feature collection for: ',
                        config.source
                    );
                    continue;
                }

                if (config.source === SourceId.TeacupEDRReservoirs) {
                    const reservoirCollection =
                        await appendTeacupDataProperties(
                            currentFeatureCollection,
                            {
                                signal: controller.current.signal,
                                params: config.params,
                            }
                        );

                    reservoirCollections[config.source as ReservoirConfigId] =
                        reservoirCollection;
                }
            }

            if (isMounted.current) {
                notificationManager.show(
                    'Reservoir data loaded',
                    NotificationType.Success,
                    5000
                );
                setReservoirCollections(reservoirCollections);
            }
        } catch (error) {
            if ((error as Error)?.name !== 'AbortError') {
                console.error(error);
            } else if ((error as Error)?.message) {
                const _error = error as Error;
                notificationManager.show(
                    `Error: ${_error.message}`,
                    NotificationType.Error,
                    10000
                );
            }
        } finally {
            loadingManager.remove(loadingInstance);
        }
    };

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
            controller.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (!map) {
            return;
        }

        if (
            !reservoirCollections &&
            !loadingManager.has({ type: LoadingType.Reservoirs })
        ) {
            void fetchReservoirLocations(map);
        }
    }, [map]);

    return {
        reservoirCollections,
    };
};
