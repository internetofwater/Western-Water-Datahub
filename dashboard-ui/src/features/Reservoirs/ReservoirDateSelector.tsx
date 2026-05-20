/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main';
import { Checkbox, Group } from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useLoading } from '@/hooks/useLoading';
import debounce from 'lodash.debounce';
import styles from '@/features/Reservoirs/Reservoirs.module.css';
import { useHistoricalData } from '@/hooks/useHistoricalData';

export const ReservoirDateSelector: React.FC = () => {
    const reservoirDate = useMainStore((state) => state.reservoirDate);
    const setReservoirDate = useMainStore((state) => state.setReservoirDate);

    useHistoricalData(reservoirDate);

    const { isFetchingReservoirs } = useLoading();

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

    const debouncedHandleReservoirDateChange = debounce(
        handleReservoirDateChange,
        300
    );

    useEffect(() => {
        return () => {
            debouncedHandleReservoirDateChange.cancel();
        };
    }, []);

    const hasReservoirDate = reservoirDate !== null;

    return (
        <Group gap="calc(var(--default-spacing) / 1)" align="flex-end">
            {hasReservoirDate && (
                <DateInput
                    size="xs"
                    className={styles.multiselect}
                    valueFormat="MM/DD/YYYY"
                    disabled={isFetchingReservoirs}
                    value={dayjs(reservoirDate).toDate()}
                    maxDate={new Date()}
                    label="Reservoir Storage Date"
                    onChange={debouncedHandleReservoirDateChange}
                />
            )}
            <Checkbox
                size="xs"
                className={styles.dateCheckbox}
                mb={hasReservoirDate ? '0.4375rem' : 0}
                classNames={{ label: styles.label }}
                checked={!hasReservoirDate}
                disabled={isFetchingReservoirs}
                data-disabled={isFetchingReservoirs}
                label="Latest Storage Value"
                onChange={() => handleCheckboxChange(!hasReservoirDate)}
            />
        </Group>
    );
};
