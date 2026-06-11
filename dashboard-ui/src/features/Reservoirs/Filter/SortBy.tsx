/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Select } from '@mantine/core';
import { SortBy as SortByType } from '@/features/Reservoirs/types';
import styles from '@/features/Reservoirs/Reservoirs.module.css';
import { useLoading } from '@/hooks/useLoading';
import { getSortByLabel } from '../utils';

type Props = {
    sortBy: SortByType;
    handleChange: (value: SortByType) => void;
};

const data = [
    { value: SortByType.Capacity, label: getSortByLabel(SortByType.Capacity) },
    { value: SortByType.Storage, label: getSortByLabel(SortByType.Storage) },
    {
        value: SortByType.PercentFull,
        label: getSortByLabel(SortByType.PercentFull),
    },
    {
        value: SortByType.PercentAverage,
        label: getSortByLabel(SortByType.PercentAverage),
    },
];

export const SortBy: React.FC<Props> = (props) => {
    const { sortBy, handleChange } = props;

    const { isFetchingReservoirs, isGeneratingReport } = useLoading();

    const isDisabled = isFetchingReservoirs || isGeneratingReport;

    return (
        <Select
            size="xs"
            className={styles.sortBySelect}
            disabled={isDisabled}
            label="Sort by"
            value={sortBy}
            onChange={(value) => handleChange(value as SortByType)}
            data={data}
        />
    );
};
