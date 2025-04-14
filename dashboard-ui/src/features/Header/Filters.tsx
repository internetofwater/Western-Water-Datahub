/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Switch } from '@mantine/core';
import styles from '@/features/Header/Header.module.css';

export const Filters: React.FC = () => {
    return (
        <Group className={styles.filterGroupContainer}>
            <Switch defaultChecked label="Show Teacups" />
            <Switch label="Show Streamflow Gages" />
            <Switch label="Show Weather" />
            <Switch label="Flag Low Storage" />
        </Group>
    );
};
