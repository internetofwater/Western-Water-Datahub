/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { lazy } from 'react';
import { Stack } from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { Selector } from './BaseMap';
import Legend from './Legend';
import { MobilePanelButton } from './MobilePanelButton';

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
