/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore, { Tools } from '@/lib/main';
import { Selector } from '@/features/MapTools/BaseMap/Selector';
import { Box } from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { lazy } from 'react';

const Screenshot = lazy(() => import('./Screenshot/Screenshot'));

/**
 *
 * @component
 */
export const MapTools: React.FC = () => {
    const tools = useMainStore((state) => state.tools);

    return (
        <Box className={styles.mapToolsContainer}>
            {tools[Tools.BasemapSelector] && <Selector />}
            {tools[Tools.Print] && <Screenshot />}
        </Box>
    );
};
