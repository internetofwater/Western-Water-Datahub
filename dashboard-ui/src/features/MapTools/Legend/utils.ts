/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId, SubLayerId } from '@/features/Map/consts';
import { getGlossaryEntry } from '@/features/Help/utils';

export const getTooltipContent = (
    layerId: LayerId | SubLayerId | string
): string => {
    switch (layerId) {
        case String(LayerId.Snotel):
            return (
                getGlossaryEntry(LayerId.Snotel)?.short ??
                'The average snow water equivalent across each HUC06 basin relative to the 30 year average.'
            );
        case String(LayerId.NOAARiverForecast):
            return (
                getGlossaryEntry(LayerId.NOAARiverForecast)?.short ??
                'Forecasted average change in flow for current season against the 30 year normal period.'
            );
        case 'capacity':
            return (
                getGlossaryEntry('capacity')?.short ?? 'Potential water storage'
            );
        case 'storage':
            return (
                getGlossaryEntry('storage')?.short ?? 'Current water storage'
            );
        case 'average':
            return getGlossaryEntry('average')?.short ?? 'Help content missing';
        case 'low-percentile':
            return (
                getGlossaryEntry('low-percentile')?.short ??
                'Help content missing'
            );
        case 'high-percentile':
            return (
                getGlossaryEntry('high-percentile')?.short ??
                'Help content missing'
            );

        default:
            return '';
    }
};
