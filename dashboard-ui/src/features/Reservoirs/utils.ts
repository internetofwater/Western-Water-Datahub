/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature, Point } from 'geojson';
import { OrganizedProperties } from './types';

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
