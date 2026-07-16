/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { BoundingGeographyLevel } from '@/stores/main/types';

export const getBoundingGeographyLabel = (
    boundingGeographyLevel: BoundingGeographyLevel
) => {
    switch (boundingGeographyLevel) {
        case BoundingGeographyLevel.Region:
            return 'DOI Region';
        case BoundingGeographyLevel.ManagingRegion:
            return 'Managing Region';
        case BoundingGeographyLevel.Basin:
            return 'Basin (HUC2)';
        case BoundingGeographyLevel.State:
            return 'State';
        case BoundingGeographyLevel.None:
            return 'None';
        default:
            return 'Boundary';
    }
};
