/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main/main';
import { Selector } from '@/features/MapTools/BaseMap';
import { lazy } from 'react';
import { Tools } from '@/stores/main/types';

const Screenshot = lazy(() => import('./Screenshot'));

/**
 *
 * @component
 */
export const MapTools: React.FC = () => {
    const tools = useMainStore((state) => state.tools);

    return (
        <>
            {tools[Tools.BasemapSelector] && <Selector />}
            {tools[Tools.Print] && <Screenshot />}
        </>
    );
};
