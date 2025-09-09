/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId, SubLayerId } from '../Map/consts';

export const getTooltipContent = (layerId: LayerId | SubLayerId) => {
    switch (layerId) {
        case LayerId.Snotel:
            return 'Change in snowpack water content (SWE) in the HUC06 basin compared to the 30-year average';
        case LayerId.NOAARiverForecast:
            return 'Forecasted average change in flow for current season against the 30 year normal period';
        default:
            return '';
    }
};
