/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { lazy } from 'react';
import { Stack } from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { Selector } from '@/features/MapTools/BaseMap';
import Legend from '@/features/MapTools/Legend';
import { MobilePanelButton } from '@/features/MapTools/MobilePanelButton';

const Screenshot = lazy(() => import('./Screenshot'));

/**
 *
 * @component
 */
export const MapTools: React.FC = () => {
    return (
        <>
            <Stack gap="var(--default-spacing)" className={styles.left}>
                <MobilePanelButton />
            </Stack>
            <Stack gap="var(--default-spacing)" className={styles.right}>
                <Legend />
                <Selector />
                <Screenshot />
            </Stack>
        </>
    );
};
