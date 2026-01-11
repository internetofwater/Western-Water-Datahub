/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

// Center point of each huc boundary for drawing labels
// Some adjustments for better position
import { Huc02BasinField } from '@/features/Map/types/basin';
import { FeatureCollection, Point } from 'geojson';

export const huc02Centers: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: [
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 1,
        //         [Huc02BasinField.Name]: 'New England Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-70.025842537, 44.432876329],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 2,
        //         [Huc02BasinField.Name]: 'Mid Atlantic Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-76.64636500808136, 40.84141988456247],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 3,
        //         [Huc02BasinField.Name]: 'South Atlantic-Gulf Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-84.00641573835105, 33.3596708184683],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 4,
        //         [Huc02BasinField.Name]: 'Great Lakes Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-83.670986631, 45.274667402],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 5,
        //         [Huc02BasinField.Name]: 'Ohio Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-83.858233346, 38.868693634],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 6,
        //         [Huc02BasinField.Name]: 'Tennessee Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-85.180811354, 35.592508032],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 7,
        //         [Huc02BasinField.Name]: 'Upper Mississippi Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-91.719515314, 42.83426983],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 8,
        //         [Huc02BasinField.Name]: 'Lower Mississippi Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-91.53734907020255, 33.54103624020799],
        //     },
        // },
        {
            type: 'Feature',
            properties: {
                id: 9,
                [Huc02BasinField.Name]: 'Souris-Red-Rainy Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-97.42064729352984, 49.226235790304884],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 9,
                [Huc02BasinField.Name]: 'Souris-Red-Rainy Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-114.13930954636578, 49.99332854905629],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 10,
                [Huc02BasinField.Name]: 'Missouri Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-102.861312507, 43.744301875],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 11,
                [Huc02BasinField.Name]: 'Arkansas-White-Red Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.437540298, 36.094387703],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 12,
                [Huc02BasinField.Name]: 'Texas-Gulf Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-97.80995183001559, 31.586608173572984],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 13,
                [Huc02BasinField.Name]: 'Rio Grande Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-104.221449787, 30.865801709],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 14,
                [Huc02BasinField.Name]: 'Upper Colorado Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-109.022990163, 39.165107464],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 15,
                [Huc02BasinField.Name]: 'Lower Colorado Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-111.914388969, 33.995973016],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 16,
                [Huc02BasinField.Name]: 'Great Basin Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-115.717018816, 40.374248643],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 17,
                [Huc02BasinField.Name]: 'Pacific Northwest Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-118.058405599, 46.028693029],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 18,
                [Huc02BasinField.Name]: 'California Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-119.772122181, 37.427876934],
            },
        },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 19,
        //         [Huc02BasinField.Name]: 'Alaska Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-150.511130716, 63.757185864],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 20,
        //         [Huc02BasinField.Name]: 'Hawaii Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-156.58913094, 20.427874336],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 21,
        //         [Huc02BasinField.Name]: 'Caribbean Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [-66.235535985, 18.194997215],
        //     },
        // },
        // {
        //     type: 'Feature',
        //     properties: {
        //         id: 22,
        //         [Huc02BasinField.Name]: 'South Pacific Region',
        //     },
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [24.954304164, 3.209606223],
        //     },
        // },
    ],
};
