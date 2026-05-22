/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useMap } from '@/contexts/MapContexts';
import { LayerId, MAP_ID } from '@/features/Map/consts';
import useMainStore from '@/stores/main';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { SourceId } from '@/features/Map/consts';
import { FeatureCollection, Point, GeoJsonProperties } from 'geojson';
import { appendTeacupDataProperties } from '@/features/Map/utils';
import loadingManager from '@/managers/Loading.init';
import { LoadingType, NotificationType } from '@/stores/session/types';
import notificationManager from '@/managers/Notification.init';
import { TeacupReservoirField } from '@/features/Map/types/reservoir/teacup';
import { RasterArrayTileSource } from 'mapbox-gl';
import { getLayerName } from '@/features/Map/config';

export const useHistoricalData = () => {
    const reservoirDate = useMainStore((state) => state.reservoirDate);
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );
    const setReservoirCollections = useMainStore(
        (state) => state.setReservoirCollections
    );
    const toggleableLayers = useMainStore((state) => state.toggleableLayers);
    const setToggleableLayers = useMainStore(
        (state) => state.setToggleableLayers
    );

    const controller = useRef<AbortController>(null);

    const { map } = useMap(MAP_ID);

    const getTilesUrl = (date: string | null) => {
        if (date) {
            // TODO: switch to datetime url var if possible
            const [year, month, day] = date.split('-');
            return `https://cache.wwdh.internetofwater.app/collections/us-historical-drought-monitor/map?f=png&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox={bbox-epsg-3857}&endyear=${year}&endmonth=${month}&endday=${day}`;
        }
        return 'https://cache.wwdh.internetofwater.app/collections/us-current-drought-monitor/map?f=png&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox={bbox-epsg-3857}';
    };

    const getMessages = (date: string | null) => {
        const formattedDate = dayjs(date).format('MM/DD/YYYY');

        let loadingMessage = `Loading reservoir storage data for ${formattedDate}.`;
        let updatedMessage = `Updated reservoir storage data for: ${formattedDate}.`;
        let noDataMessage = `Unable to find any reservoir storage data for: ${dayjs(
            date
        ).format('MM/DD/YYYY')}.`;
        if (formattedDate === 'Invalid Date') {
            loadingMessage = 'Loading latest reservoir storage data.';
            updatedMessage =
                'Updated reservoir storage data to the latest date available.';
            noDataMessage = 'Unable to find the latest reservoir storage data.';
        }

        return {
            loadingMessage,
            updatedMessage,
            noDataMessage,
        };
    };

    const fetchRiseReservoirLocations = async (
        currentCollection: FeatureCollection<Point, GeoJsonProperties>,
        date: string | null
    ) => {
        if (!reservoirCollections) {
            return;
        }

        const { noDataMessage } = getMessages(date);

        controller.current = new AbortController();

        const processedResult = await appendTeacupDataProperties(
            currentCollection,
            { reservoirDate: date, signal: controller.current.signal }
        );

        if (
            processedResult.features.every(
                (feature) =>
                    feature.properties &&
                    !feature.properties[TeacupReservoirField.StorageAverage]
            )
        ) {
            notificationManager.show(
                noDataMessage,
                NotificationType.Info,
                10000
            );
        }

        const _reservoirCollection = {
            ...reservoirCollections,
            [SourceId.TeacupEDRReservoirs]: processedResult,
        };
        setReservoirCollections(_reservoirCollection);
    };

    const updateReservoirs = async (date: string | null) => {
        const { loadingMessage, updatedMessage } = getMessages(date);

        const loadingInstance = loadingManager.add(
            loadingMessage,
            LoadingType.Reservoirs
        );
        try {
            await fetchRiseReservoirLocations(
                reservoirCollections![SourceId.TeacupEDRReservoirs]!,
                date
            );
            notificationManager.show(updatedMessage, NotificationType.Success);
        } catch (error) {
            if ((error as Error)?.name !== 'AbortError') {
                console.error(
                    'Failed to update reservoir storage data:',
                    error
                );
            } else if (
                (error as Error)?.message &&
                !(error as Error)?.message.includes('AbortError')
            ) {
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

    const updateBaseLayers = (date: string | null) => {
        const getMessage = (layerId: LayerId) =>
            `${getLayerName(layerId)} does not support historic data. This layer has been turned off.`;
        if (toggleableLayers[LayerId.NOAATempSixToTen]) {
            notificationManager.show(
                getMessage(LayerId.NOAATempSixToTen),
                NotificationType.Info,
                10000
            );
            setToggleableLayers(LayerId.NOAATempSixToTen, false);
        }
        if (toggleableLayers[LayerId.NOAAPrecipSixToTen]) {
            notificationManager.show(
                getMessage(LayerId.NOAAPrecipSixToTen),
                NotificationType.Info,
                10000
            );
            setToggleableLayers(LayerId.NOAAPrecipSixToTen, false);
        }
        if (map) {
            const source = map.getSource<RasterArrayTileSource>(
                SourceId.USDroughtMonitor
            );
            if (source) {
                const tilesUrl = getTilesUrl(date);
                source.setTiles([tilesUrl]);
            }
        }
    };

    const updateData = async (date: string | null) => {
        await updateReservoirs(date);
        updateBaseLayers(date);
    };

    useEffect(() => {
        const resvizData = reservoirCollections?.[SourceId.TeacupEDRReservoirs];

        const isValidFeatureCollection =
            resvizData?.type === 'FeatureCollection' &&
            Array.isArray(resvizData.features) &&
            resvizData.features.length > 0;

        if (!reservoirCollections || !isValidFeatureCollection) {
            return;
        }

        void updateData(reservoirDate);
    }, [reservoirDate]);
};
