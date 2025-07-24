import useMainStore from '@/lib/main';
import { Checkbox } from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { SourceId } from '@/features/Map/consts';
import { FeatureCollection, Point, GeoJsonProperties } from 'geojson';
import { appendResvizDataProperties } from '@/features/Map/utils';

export const ReservoirDateSelector: React.FC = () => {
    const reservoirDate = useMainStore((state) => state.reservoirDate);
    const setReservoirDate = useMainStore((state) => state.setReservoirDate);
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );
    const setReservoirCollections = useMainStore(
        (state) => state.setReservoirCollections
    );

    const handleCheckboxChange = (checked: boolean) => {
        if (checked) {
            const today = dayjs().format('YYYY-MM-DD');
            setReservoirDate(today);
        } else {
            setReservoirDate(null);
        }
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

        const _reservoirCollection = {
            ...reservoirCollections,
            [SourceId.ResvizEDRReservoirs]: processedResult,
        };
        setReservoirCollections(_reservoirCollection);
    };

    useEffect(() => {
        const resvizData = reservoirCollections?.[SourceId.ResvizEDRReservoirs];

        const isValidFeatureCollection =
            resvizData?.type === 'FeatureCollection' &&
            Array.isArray(resvizData.features);

        if (!reservoirCollections || !isValidFeatureCollection) {
            return;
        }

        void fetchRiseReservoirLocations(
            reservoirCollections[SourceId.ResvizEDRReservoirs]!,
            reservoirDate
        );
    }, [reservoirDate]);

    return (
        <>
            <Checkbox
                checked={!reservoirDate}
                label="Latest Storage Value"
                onChange={() => handleCheckboxChange(!reservoirDate)}
            />
            {reservoirDate && (
                <DateInput
                    valueFormat="MM/DD/YYYY"
                    value={dayjs(reservoirDate).toDate()}
                    // minDate={new Date()}
                    maxDate={new Date()}
                    label="Reservoir Storage Date"
                    onChange={handleReservoirDateChange}
                />
            )}
        </>
    );
};
