/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { TspanData } from '@/features/Reservior/TeacupDiagram/types';

export const storagePolygonId = 'storage-polygon';
export const capacityPolygonId = 'capacity-polygon';
export const highPercentileId = 'high-percentile-line';
export const highPercentileLabelId = 'high-percentile-label';
export const averageId = 'average-line';
export const averageTextId = 'average-text';
export const averageLabelId = 'average-label';
export const lowPercentileId = 'low-percentile-line';
export const lowPercentileLabelId = 'low-percentile-label';
export const capacityTextId = 'capacity-text';
export const storageTextId = 'storage-text';
export const capacityFill = '#a6d5e3';
export const storageFill = '#1c638e';

export const getHighPercentileLabel = (): TspanData[] => {
    return [
        {
            dx: '10',
            dy: '0',
            'font-weight': 'bold',
            'font-size': '9',
            content: 'High',
        },
        {
            dx: '-35',
            dy: '9',
            'font-size': '8',
            content: [
                { content: '(90' },
                { dy: '-5', 'font-size': '4', content: 'th' },
                { content: '\u00A0' },
                { dy: '5', 'font-size': '8', content: 'Percentile)' },
            ],
        },
    ];
};

export const getAverageLabel = (adjust: number): TspanData[] => {
    return [
        {
            dx: '2',
            dy: `${adjust}`,
            content: '30-year',
        },
        {
            dx: '-35',
            dy: '8',
            content: 'Average',
        },
    ];
};

export const getLowPercentileLabel = (adjust: number): TspanData[] => {
    return [
        {
            dx: '10',
            dy: `${adjust}`,
            'font-weight': 'bold',
            'font-size': '9',
            content: 'Low',
        },
        {
            dx: '-35',
            dy: '8',
            'font-size': '8',
            content: [
                { content: '(10' },
                { dy: '-5', 'font-size': '4', content: 'th' },
                { content: '\u00A0' },
                { dy: '5', 'font-size': '8', content: 'Percentile)' },
            ],
        },
    ];
};
