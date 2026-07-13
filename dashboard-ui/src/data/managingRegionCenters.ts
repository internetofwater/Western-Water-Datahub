/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ManagingRegionField } from '@/features/Map/types/managingRegion';
import { FeatureCollection, Point } from 'geojson';

export const managingRegionCenters: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.ObjectId]: 1,
                [ManagingRegionField.Name]: 'Upper Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-101.0817, 46.9738],
            },
        },
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.ObjectId]: 2,
                [ManagingRegionField.Name]:
                    'Arkansas - Rio Grande - Texas Gulf',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.8068, 32.4998],
            },
        },
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.ObjectId]: 3,
                [ManagingRegionField.Name]: 'Upper Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-108.1286, 39.6615],
            },
        },
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.ObjectId]: 4,
                [ManagingRegionField.Name]: 'Lower Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-113.5361, 34.6394],
            },
        },
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.ObjectId]: 5,
                [ManagingRegionField.Name]: 'Columbia - Pacific Northwest',
            },
            geometry: {
                type: 'Point',
                coordinates: [-118.702, 45.8915],
            },
        },
    ],
};
