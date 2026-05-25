/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId } from '@/features/Map/consts';
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

export const useHistoricalData = () => {
    const reservoirDate = useMainStore((state) => state.reservoirDate);
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );
    const setReservoirCollections = useMainStore(
        (state) => state.setReservoirCollections
    );
    const toggleableLayers = useMainStore((state) => state.toggleableLayers);
    const setAllToggleableLayers = useMainStore(
        (state) => state.setAllToggleableLayers
    );

    const controller = useRef<AbortController>(null);

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

    const updateReferenceDataLayers = (date: string | null) => {
        if (date) {
            // Disable data driven reference data layers
            setAllToggleableLayers({
                ...toggleableLayers,
                [LayerId.NOAATempSixToTen]: false,
                [LayerId.NOAAPrecipSixToTen]: false,
                [LayerId.USDroughtMonitor]: false,
                [LayerId.NOAARiverForecast]: false,
                [LayerId.SnotelHucSixMeans]: false,
            });
            notificationManager.show(
                'Reference Data layers do not currently support historic data. These layers have been deactivated.',
                NotificationType.Info,
                10000
            );
        }
    };

    const updateData = async (date: string | null) => {
        await updateReservoirs(date);
        updateReferenceDataLayers(date);
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
