/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { FeatureCollection, Point } from 'geojson';

export const stateCenters: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                name: 'Washington',
                uri: 'https://geoconnex.us/ref/states/53',
            },
            geometry: {
                type: 'Point',
                coordinates: [-120.7401, 47.7511],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'Oregon',
                uri: 'https://geoconnex.us/ref/states/41',
            },
            geometry: {
                type: 'Point',
                coordinates: [-120.5411, 44.1189],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'California',
                uri: 'https://geoconnex.us/ref/states/06',
            },
            geometry: {
                type: 'Point',
                coordinates: [-119.4179, 36.7783],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Idaho',
                uri: 'https://geoconnex.us/ref/states/16',
            },
            geometry: {
                type: 'Point',
                coordinates: [-114.742, 44.0682],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'Nevada',
                uri: 'https://geoconnex.us/ref/states/32',
            },
            geometry: {
                type: 'Point',
                coordinates: [-117.284, 40.2764],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'Montana',
                uri: 'https://geoconnex.us/ref/states/30',
            },
            geometry: {
                type: 'Point',
                coordinates: [-109.6338, 47.1275],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Wyoming',
                uri: 'https://geoconnex.us/ref/states/56',
            },
            geometry: {
                type: 'Point',
                coordinates: [-107.2903, 43.0759],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'Utah',
                uri: 'https://geoconnex.us/ref/states/49',
            },
            geometry: {
                type: 'Point',
                coordinates: [-111.9569, 39.9702],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Arizona',
                uri: 'https://geoconnex.us/ref/states/04',
            },
            geometry: {
                type: 'Point',
                coordinates: [-111.0937, 34.0489],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Colorado',
                uri: 'https://geoconnex.us/ref/states/08',
            },
            geometry: {
                type: 'Point',
                coordinates: [-105.7821, 39.5501],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'New Mexico',
                uri: 'https://geoconnex.us/ref/states/35',
            },
            geometry: {
                type: 'Point',
                coordinates: [-105.8701, 34.5199],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'North Dakota',
                uri: 'https://geoconnex.us/ref/states/38',
            },
            geometry: {
                type: 'Point',
                coordinates: [-100.3848, 47.6329],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'South Dakota',
                uri: 'https://geoconnex.us/ref/states/46',
            },
            geometry: {
                type: 'Point',
                coordinates: [-100.3848, 44.7389],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Nebraska',
                uri: 'https://geoconnex.us/ref/states/31',
            },
            geometry: {
                type: 'Point',
                coordinates: [-99.9018, 41.4925],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Oklahoma',
                uri: 'https://geoconnex.us/ref/states/40',
            },
            geometry: {
                type: 'Point',
                coordinates: [-97.0929, 35.4676],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Kansas',
                uri: 'https://geoconnex.us/ref/states/20',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.4833, 38.7246],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Texas',
                uri: 'https://geoconnex.us/ref/states/48',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.4274, 31.7337],
            },
        },
    ],
};
