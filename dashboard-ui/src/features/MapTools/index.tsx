/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore, { Tools } from '@/lib/main';
import { Selector } from '@/features/MapTools/BaseMap';
import { Box } from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { lazy } from 'react';
import Controls from '@/features/MapTools/Controls';
import Legend from '@/features/MapTools/Legend';

const Screenshot = lazy(() => import('./Screenshot'));

/**
 *
 * @component
 */
export const MapTools: React.FC = () => {
    const tools = useMainStore((state) => state.tools);

    return (
        <>
            <Box className={`${styles.mapToolsContainer} ${styles.left}`}>
                {tools[Tools.Controls] && <Controls />}
                {tools[Tools.Legend] && <Legend />}
            </Box>
            <Box className={`${styles.mapToolsContainer} ${styles.right}`}>
                {tools[Tools.BasemapSelector] && <Selector />}
                {tools[Tools.Print] && <Screenshot />}
            </Box>
        </>
    );
};
