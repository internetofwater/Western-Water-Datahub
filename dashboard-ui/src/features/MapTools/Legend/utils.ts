/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId, SubLayerId } from '@/features/Map/consts';
import {
    TEntry,
    TGradientEntry,
    TGroupEntry,
    TItemsEntry,
} from '@/features/MapTools/Legend/types';

export const getTooltipContent = (
    layerId: LayerId | SubLayerId | string
): string => {
    switch (layerId) {
        case String(LayerId.Snotel):
            return 'The average snow water equivalent across each HUC06 basin relative to the 30 year average.';
        case String(LayerId.NOAARiverForecast):
            return 'Forecasted average change in flow for current season against the 30 year normal period.';
        case 'capacity':
            return 'Potential water storage';
        case 'storage':
            return 'Current water storage';
        case 'average':
            return 'Help content missing';
        case 'low-percentile':
            return 'Help content missing';
        case 'high-percentile':
            return 'Help content missing';

        default:
            return '';
    }
};

export const isGradientEntry = (entry: TEntry): entry is TGradientEntry => {
    return (
        'colors' in entry &&
        'from' in entry &&
        'to' in entry &&
        Array.isArray(entry.colors) &&
        ['string', 'number'].includes(typeof entry.from) &&
        ['string', 'number'].includes(typeof entry.to)
    );
};

export const isItemsEntry = (entry: TEntry): entry is TItemsEntry => {
    return 'items' in entry && Array.isArray(entry.items);
};

export const isGroupsEntry = (entry: TEntry): entry is TGroupEntry => {
    return (
        'groups' in entry && 'direction' in entry && Array.isArray(entry.groups)
    );
};
