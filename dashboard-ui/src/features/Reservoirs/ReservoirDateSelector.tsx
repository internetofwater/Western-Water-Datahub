/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main';
import { Checkbox, Stack } from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useLoading } from '@/hooks/useLoading';
import debounce from 'lodash.debounce';
import styles from '@/features/Reservoirs/Reservoirs.module.css';

export const ReservoirDateSelector: React.FC = () => {
    const reservoirDate = useMainStore((state) => state.reservoirDate);
    const setReservoirDate = useMainStore((state) => state.setReservoirDate);

    const { isFetchingReservoirs, isGeneratingReport } = useLoading();

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
    const isDisabled = isFetchingReservoirs || isGeneratingReport;

    return (
        <Stack gap="calc(var(--default-spacing) / 4)" align="flex-start">
            <Checkbox
                size="xs"
                className={styles.dateCheckbox}
                classNames={{ label: styles.label }}
                checked={!hasReservoirDate}
                disabled={isDisabled}
                data-disabled={isDisabled}
                label="Show most recent data"
                onChange={() => handleCheckboxChange(!hasReservoirDate)}
            />
            {hasReservoirDate && (
                <DateInput
                    size="xs"
                    classNames={{ input: styles.multiselect }}
                    valueFormat="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    disabled={isDisabled || !hasReservoirDate}
                    value={
                        reservoirDate
                            ? dayjs(reservoirDate).toDate()
                            : undefined
                    }
                    maxDate={new Date()}
                    label="Reservoir Storage Date"
                    description="Search for reservoir data on a specific date"
                    onChange={debouncedHandleReservoirDateChange}
                />
            )}
        </Stack>
    );
};
