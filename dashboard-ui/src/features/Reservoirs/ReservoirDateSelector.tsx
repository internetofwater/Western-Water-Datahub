/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main';
import { Button, Checkbox, Group, Stack, Tooltip } from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useLoading } from '@/hooks/useLoading';
import styles from '@/features/Reservoirs/Reservoirs.module.css';

export const ReservoirDateSelector: React.FC = () => {
    const reservoirDate = useMainStore((state) => state.reservoirDate);
    const setReservoirDate = useMainStore((state) => state.setReservoirDate);

    const [date, setDate] = useState(reservoirDate);

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
        setDate(date);
    };

    const handleClick = () => {
        setReservoirDate(date);
    };

    useEffect(() => {
        setDate(reservoirDate);
    }, [reservoirDate]);

    const hasReservoirDate = reservoirDate !== null;
    const isDisabled = isFetchingReservoirs || isGeneratingReport;

    return (
        <Stack
            gap="calc(var(--default-spacing) / 4)"
            align="flex-start"
            mt="var(--default-spacing)"
        >
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
                <Group gap={0} align="flex-end">
                    <DateInput
                        size="sm"
                        classNames={{ input: styles.multiselect }}
                        valueFormat="MM/DD/YYYY"
                        placeholder="MM/DD/YYYY"
                        disabled={isDisabled || !hasReservoirDate}
                        value={date ? dayjs(date).toDate() : undefined}
                        maxDate={new Date()}
                        label="Reservoir Storage Date"
                        description="Search for reservoir data on a specific date"
                        onChange={handleReservoirDateChange}
                    />
                    <Tooltip
                        label="The date has not changed."
                        disabled={date !== reservoirDate}
                    >
                        <Button
                            onClick={handleClick}
                            size="xs"
                            className={styles.goButton}
                            disabled={date === reservoirDate}
                        >
                            GO
                        </Button>
                    </Tooltip>
                </Group>
            )}
        </Stack>
    );
};
