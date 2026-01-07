/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { lazy } from 'react';
import { Stack } from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { Selector } from './BaseMap';
import Legend from './Legend';

const Screenshot = lazy(() => import('./Screenshot'));

/**
 *
 * @component
 */
export const MapTools: React.FC = () => {
    return (
        <Stack gap="var(--default-spacing)" className={styles.toolsGroup}>
            <Legend />
            <Selector />
            <Screenshot />
        </Stack>
    );
};
