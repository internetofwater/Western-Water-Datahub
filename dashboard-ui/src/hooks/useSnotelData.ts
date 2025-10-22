/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useCallback } from 'react';
import wwdhService from '@/services/init/wwdh.init';
import { FeatureCollection, Point } from 'geojson';
import { MAP_ID, SourceId } from '@/features/Map/consts';
import {
    SnotelField,
    SnotelHucMeansField,
    SnotelHucMeansProperties,
    SnotelProperties,
} from '@/features/Map/types/snotel';
import { useMap } from '@/contexts/MapContexts';
import { GeoJSONSource, Map } from 'mapbox-gl';
import notificationManager from '@/managers/Notification.init';
import { LoadingType, NotificationType } from '@/stores/session/types';
import loadingManager from '@/managers/Loading.init';

export const useSnotelData = () => {
    const controller = useRef<AbortController | null>(null);
    const isMounted = useRef(true);
    const { map } = useMap(MAP_ID);

    const updateSnotelLocations = useCallback(async (map: Map) => {
        const snotelSource = map.getSource<GeoJSONSource>(SourceId.Snotel);
        if (!snotelSource) return;

        const loadingInstance = loadingManager.add(
            'Loading Snow Monitoring Points data',
            LoadingType.Snotel
        );

        try {
            if (controller.current) {
                controller.current.abort();
            }
            controller.current = new AbortController();

            const [snotelHucMeans, snotelLocation] = await Promise.all([
                wwdhService.getItems<
                    FeatureCollection<Point, SnotelHucMeansProperties>
                >(SourceId.SnotelHucSixMeans, {
                    signal: controller.current.signal,
                    params: { f: 'json', skipGeometry: true, limit: 10000 },
                }),
                wwdhService.getLocations<
                    FeatureCollection<Point, SnotelProperties>
                >(SourceId.Snotel, {
                    signal: controller.current.signal,
                    params: { f: 'json', limit: 10000 },
                }),
            ]);

            snotelHucMeans.features.forEach((mean) => {
                snotelLocation.features
                    .filter(
                        (loc) =>
                            loc.properties[SnotelField.Huc]?.slice(0, 6) ===
                            mean.id
                    )
                    .forEach((loc) => {
                        loc.properties = {
                            ...loc.properties,
                            [SnotelHucMeansField.CurrentRelativeSnowWaterEquivalent]:
                                mean.properties[
                                    SnotelHucMeansField
                                        .CurrentRelativeSnowWaterEquivalent
                                ],
                        };
                    });
            });

            if (isMounted.current) {
                notificationManager.show(
                    'Snow Monitoring Points data loaded',
                    NotificationType.Success,
                    5000
                );
                snotelSource.setData(snotelLocation);
            }
        } catch (error) {
            if ((error as Error)?.name !== 'AbortError') {
                console.error('Failed to update SNOTEL data:', error);
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
    }, []);

    useEffect(() => {
        if (map) {
            void updateSnotelLocations(map);
        }
    }, [map]);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            controller.current?.abort();
        };
    }, []);
};
