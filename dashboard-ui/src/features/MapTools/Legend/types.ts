/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerType } from '@/components/Map/types';
import { MainState } from '@/stores/main';

export type Entry = {
    id: keyof MainState['toggleableLayers'];
    type: LayerType;
    items?: { color: string; label: string }[];
    colors?: string[];
    from?: string | number;
    to?: string | number;
};
