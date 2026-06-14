/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature, Point } from 'geojson';
import {
    OrganizedProperties,
    SortBy,
    SortOrder,
} from '@/features/Reservoirs/types';

export const chunk = <T>(array: T[], size: number): T[][] => {
    if (array.length === 0 || size === 0) {
        return [];
    }

    const result: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }

    return result;
};

export const getKey = (
    feature: Feature<Point, OrganizedProperties>
): string => {
    return `${String(feature.id)}_${String(feature.properties.sourceId)}`;
};

export const getSortByLabel = (sortBy: SortBy): string => {
    switch (sortBy) {
        case SortBy.Capacity:
            return 'Capacity';
        case SortBy.Storage:
            return 'Storage';
        case SortBy.PercentAverage:
            return 'Percent of Average';
        case SortBy.PercentFull:
            return 'Percent of Full';
    }
};

export const getSortOrderLabel = (sortOrder: SortOrder): string => {
    switch (sortOrder) {
        case 'asc':
            return 'ascending (smallest to largest)';
        case 'desc':
            return 'descending (largest to smallest)';
    }
};
