/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { CoverageCollection } from '@/services/edr.service';

/**
 *
 * @function
 */
export const getDateRange = (range: 1 | 5) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - range);
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
};

/**
 *
 * @function
 */
export const getLabelsAndValues = (
    coverageCollection: CoverageCollection,
    parameter: string
): Array<{ x: string; y: number }> => {
    if (
        !(coverageCollection.coverages.length > 0) ||
        !coverageCollection.coverages[0].ranges ||
        !coverageCollection.coverages[0].ranges[parameter]
    ) {
        throw new Error(`Missing ${parameter} values for this location`);
    }

    const data: Array<{ x: string; y: number }> = [];

    const values = coverageCollection.coverages[0].ranges[parameter].values;
    const dates = coverageCollection.coverages[0].domain.axes.t.values;
    const length = values.length;
    for (let i = 0; i < length; i++) {
        const date = String(dates[i]);
        const value = values[i];
        data.push({
            x: date,
            y: value,
        });
    }

    return data;
};
