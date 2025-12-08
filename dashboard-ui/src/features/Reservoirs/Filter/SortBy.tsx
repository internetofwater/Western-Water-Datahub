/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Select } from '@mantine/core';
import { SortBy as SortByType } from '../types';
import styles from '@/features/Reservoirs/Reservoirs.module.css';

type Props = {
    sortBy: SortByType;
    handleChange: (value: SortByType) => void;
};

const data = [
    { value: SortByType.Capacity, label: 'Capacity' },
    { value: SortByType.Storage, label: 'Storage' },
    { value: SortByType.PercentFull, label: 'Percent of Full' },
    { value: SortByType.PercentAverage, label: 'Percent of Average' },
];

export const SortBy: React.FC<Props> = (props) => {
    const { sortBy, handleChange } = props;

    return (
        <Select
            size="xs"
            className={styles.sortBySelect}
            label={'Sort by'}
            value={sortBy}
            onChange={(value) => handleChange(value as SortByType)}
            data={data}
        />
    );
};
