/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { RegionField } from '@/features/Map/types/region';
import { FeatureCollection, Point } from 'geojson';

export const regionCenters: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                [RegionField.RegNum]: 5,
                [RegionField.Name]: 'Missouri Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-101.0817, 46.9738],
            },
        },
        {
            type: 'Feature',
            properties: {
                [RegionField.RegNum]: 6,
                [RegionField.Name]: 'Arkansas - Rio Grande - Texas Gulf',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.8068, 32.4998],
            },
        },
        {
            type: 'Feature',
            properties: {
                [RegionField.RegNum]: 7,
                [RegionField.Name]: 'Upper Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-108.1286, 39.6615],
            },
        },
        {
            type: 'Feature',
            properties: {
                [RegionField.RegNum]: 8,
                [RegionField.Name]: 'Lower Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-113.5361, 34.6394],
            },
        },
        {
            type: 'Feature',
            properties: {
                [RegionField.RegNum]: 9,
                [RegionField.Name]: 'Columbia - Pacific Northwest',
            },
            geometry: {
                type: 'Point',
                coordinates: [-118.702, 45.8915],
            },
        },
        {
            type: 'Feature',
            properties: {
                [RegionField.RegNum]: 10,
                [RegionField.Name]: 'California - Great Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-119.1046, 39.2372],
            },
        },
    ],
};
