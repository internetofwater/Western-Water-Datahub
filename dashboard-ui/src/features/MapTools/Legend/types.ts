/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerType } from '@/components/Map/types';
import { MainState } from '@/stores/main';

export type TItem = { color: string; label: string };

interface TBaseEntry {
    id: keyof MainState['toggleableLayers'];
}

interface TTypedEntry extends TBaseEntry {
    type: LayerType;
}

export interface TGradientEntry extends TTypedEntry {
    colors: string[];
    from: string | number;
    to: string | number;
}

export interface TItemsEntry extends TTypedEntry {
    items: TItem[];
}

export interface TGroup extends Omit<TItemsEntry, 'id'> {
    label?: string;
    direction: 'vertical' | 'horizontal';
}

export interface TGroupEntry extends TBaseEntry {
    direction: 'vertical' | 'horizontal';
    groups: TGroup[];
}

export type TEntry = TGradientEntry | TItemsEntry | TGroupEntry;
