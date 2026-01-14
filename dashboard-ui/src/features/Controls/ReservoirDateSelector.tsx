/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main';
import { Checkbox, Stack } from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { SourceId } from '@/features/Map/consts';
import { FeatureCollection, Point, GeoJsonProperties } from 'geojson';
import { appendResvizDataProperties } from '@/features/Map/utils';
import { useLoading } from '@/hooks/useLoading';
import loadingManager from '@/managers/Loading.init';
import { LoadingType, NotificationType } from '@/stores/session/types';
import notificationManager from '@/managers/Notification.init';
import { ResvizReservoirField } from '@/features/Map/types/reservoir/resviz';

export const ReservoirDateSelector: React.FC = () => {
    const reservoirDate = useMainStore((state) => state.reservoirDate);
    const setReservoirDate = useMainStore((state) => state.setReservoirDate);
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );
    const setReservoirCollections = useMainStore(
        (state) => state.setReservoirCollections
    );

    const { isFetchingReservoirs } = useLoading();

    const handleCheckboxChange = (checked: boolean) => {
        if (checked) {
            const today = dayjs().format('YYYY-MM-DD');
            setReservoirDate(today);
        } else {
            setReservoirDate(null);
        }
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

    const handleReservoirDateChange = (value: DateValue) => {
        const date = dayjs(value).format('YYYY-MM-DD');
        setReservoirDate(date);
    };

    const fetchRiseReservoirLocations = async (
        currentCollection: FeatureCollection<Point, GeoJsonProperties>,
        date: string | null
    ) => {
        if (!reservoirCollections) {
            return;
        }

        const processedResult = await appendResvizDataProperties(
            currentCollection,
            date
        );

        if (
            processedResult.features.every(
                (feature) =>
                    feature.properties &&
                    !feature.properties[ResvizReservoirField.StorageAverage]
            )
        ) {
            const { noDataMessage } = getMessages(date);
            notificationManager.show(
                noDataMessage,
                NotificationType.Info,
                10000
            );
        }

        const _reservoirCollection = {
            ...reservoirCollections,
            [SourceId.ResvizEDRReservoirs]: processedResult,
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
                reservoirCollections![SourceId.ResvizEDRReservoirs]!,
                reservoirDate
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

    useEffect(() => {
        const resvizData = reservoirCollections?.[SourceId.ResvizEDRReservoirs];

        const isValidFeatureCollection =
            resvizData?.type === 'FeatureCollection' &&
            Array.isArray(resvizData.features) &&
            resvizData.features.length > 0;

        if (!reservoirCollections || !isValidFeatureCollection) {
            return;
        }

        void updateReservoirs(reservoirDate);
    }, [reservoirDate]);

    return (
        <Stack>
            <Checkbox
                checked={!reservoirDate}
                disabled={isFetchingReservoirs}
                data-disabled={isFetchingReservoirs}
                label="Latest Storage Value"
                onChange={() => handleCheckboxChange(!reservoirDate)}
            />
            {reservoirDate && (
                <DateInput
                    valueFormat="MM/DD/YYYY"
                    disabled={isFetchingReservoirs}
                    value={dayjs(reservoirDate).toDate()}
                    // minDate={new Date()}
                    maxDate={new Date()}
                    label="Reservoir Storage Date"
                    onChange={handleReservoirDateChange}
                />
            )}
        </Stack>
    );
};
