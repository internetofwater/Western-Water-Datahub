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
                [ManagingRegionField.RegionAbbreviation]: 'UCB',
                [ManagingRegionField.Name]: 'Upper Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-110.23976158144376, 39.29006838088944],
            },
        },
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.RegionAbbreviation]: 'CPN',
                [ManagingRegionField.Name]: 'Columbia - Pacific Northwest',
            },
            geometry: {
                type: 'Point',
                coordinates: [-118.57462350662891, 45.34871252235524],
            },
        },
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.RegionAbbreviation]: 'CGB',
                [ManagingRegionField.Name]: 'California-Great Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-120.2021582733806, 40.33536183639052],
            },
        },
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.RegionAbbreviation]: 'MB/ART',
                [ManagingRegionField.Name]:
                    'Missouri Basin and Arkansas-Rio Grande-Texas Gulf',
            },
            geometry: {
                type: 'Point',
                coordinates: [-103.54762219249345, 45.32613349005564],
            },
        },
        {
            type: 'Feature',
            properties: {
                [ManagingRegionField.RegionAbbreviation]: 'LCB',
                [ManagingRegionField.Name]: 'Lower Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-113.20152774329691, 34.39957581265004],
            },
        },
    ],
};
