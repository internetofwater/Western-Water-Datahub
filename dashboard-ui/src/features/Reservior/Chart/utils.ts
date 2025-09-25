/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { CoverageCollection, CoverageJSON } from '@/services/edr.service';

export type DateRange = 1 | 5 | 10 | 30;
/**
 *
 * @function
 */
export const getDateRange = (range: DateRange) => {
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

const isCoverageCollection = (
    coverageCollection: CoverageCollection | CoverageJSON
): coverageCollection is CoverageCollection => {
    return coverageCollection.type === 'CoverageCollection';
};

/**
 *
 * @function
 */
export const getLabelsAndValues = (
    coverage: CoverageCollection | CoverageJSON,
    parameter: string
): Array<{ x: string; y: number }> => {
    if (isCoverageCollection(coverage)) {
        if (
            !(coverage.coverages.length > 0) ||
            !coverage.coverages[0].ranges ||
            !coverage.coverages[0].ranges[parameter]
        ) {
            throw new Error(`Missing ${parameter} values for this location`);
        }

        const data: Array<{ x: string; y: number }> = [];

        const values = coverage.coverages[0].ranges[parameter].values;
        const dates = coverage.coverages[0].domain.axes.t.values;
        const length = values.length;
        for (let i = 0; i < length; i++) {
            const date = String(dates[i]);
            const value = values[i];
            data.push({
                x: date,
                y: value,
            });
        }
        // Ensure correct sorting to prevent fill render bug
        data.sort(
            (pointA, pointB) =>
                new Date(pointA.x).getTime() - new Date(pointB.x).getTime()
        );

        return data;
    }

    if (!coverage.ranges || !coverage.ranges[parameter]) {
        throw new Error(`Missing ${parameter} values for this location`);
    }

    const data: Array<{ x: string; y: number }> = [];

    const values = coverage.ranges[parameter].values;
    const dates = coverage.domain.axes.t.values;
    const length = values.length;
    for (let i = 0; i < length; i++) {
        const date = String(dates[i]);
        const value = values[i];
        data.push({
            x: date,
            y: value,
        });
    }
    // Ensure correct sorting to prevent fill render bug
    data.sort(
        (pointA, pointB) =>
            new Date(pointA.x).getTime() - new Date(pointB.x).getTime()
    );

    return data;
};
