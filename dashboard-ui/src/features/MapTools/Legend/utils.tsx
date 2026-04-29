/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId, SubLayerId } from '@/features/Map/consts';
import { Text } from '@mantine/core';
import {
    TEntry,
    TGradientEntry,
    TGroupEntry,
    TItemsEntry,
} from '@/features/MapTools/Legend/types';
import { ReactNode } from 'react';

export const getTooltipContent = (
    layerId: LayerId | SubLayerId | string
): ReactNode => {
    switch (layerId) {
        case String(LayerId.Snotel):
            return 'The current median snow water equivalent across HUC6 basins as a percentage of the 30-year median (1991-2020).';
        case String(LayerId.NOAARiverForecast):
            return (
                <>
                    <Text size="sm">
                        Forecasted seasonal (typically April-July) streamflow
                        volume at forecast points as a percentage
                    </Text>
                    <Text size="sm">
                        of the 30-year average seasonal streamflow (WY
                        1991-2020) for each forecast point.
                    </Text>
                </>
            );
            return '';
        case String(LayerId.RegionsReference):
            return 'The boundaries of the Department of the Interior Unified Regions in the western U.S.';
        case String(LayerId.BasinsReference):
            return 'The boundaries of 2-digit Hydrologic Units.';
        case String(LayerId.StatesReference):
            return 'The boundaries of the 17 western U.S. states.';
        case String(LayerId.USDroughtMonitor):
            return 'The current drought intensity, ranging from D0 (abnormally dry) to D4 (exceptional drought).';
        case String(LayerId.NOAAPrecipSixToTen):
            return 'The probability of precipitation above, near, or below normal for the period 6-10 days from now.';
        case String(LayerId.NOAATempSixToTen):
            return 'The probability of temperatures above, near, or below normal for the period 6-10 days from now.';
        case 'capacity':
            return 'The amount of water that can be stored in a reservoir based on physical constraints and operating agreements.';
        case 'storage':
            return 'The reservoir storage volume on the indicated date.';
        case 'average':
            return 'The average storage volume on the specified date over the 30-year period from WY 1991-2020.';
        case 'low-percentile':
            return '10% of historical storage values for this date are lower than this volume.';
        case 'high-percentile':
            return '90% of historical storage values for this date are lower than this volume.';

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
