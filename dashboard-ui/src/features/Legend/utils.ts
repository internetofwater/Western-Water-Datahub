/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId, SubLayerId } from '@/features/Map/consts';

export const getTooltipContent = (layerId: LayerId | SubLayerId) => {
    switch (layerId) {
        case LayerId.Snotel:
            return 'The average snow water equivalent across each HUC06 basin relative to the 30 year average.';
        case LayerId.NOAARiverForecast:
            return 'Forecasted average change in flow for current season against the 30 year normal period.';
        default:
            return '';
    }
};
