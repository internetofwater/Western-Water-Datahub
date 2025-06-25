/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ExpressionSpecification, Map } from 'mapbox-gl';
import {
    SourceDataEvent,
    ReservoirPropertiesRaw,
    ReservoirProperties,
    ReservoirConfig,
} from '@/features/Map/types';
import {
    ComplexReservoirProperties,
    ReservoirConfigs,
    TeacupStepExpression,
    ZoomCapacityArray,
} from '@/features/Map/consts';
import { SourceId } from '@/features/Map/consts';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

/**
 *
 * @function
 */
export const loadTeacups = (map: Map) => {
    const teacupLevels = [
        100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15,
        10, 5, 0,
    ];

    if (!map.hasImage('default')) {
        map.loadImage('/map-icons/default.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: default.png');
            }
            map.addImage('default', image);
        });
    }

    teacupLevels.forEach((level) => {
        const id = `teacup-${level}`;
        if (!map.hasImage(id)) {
            map.loadImage(`/map-icons/${id}.png`, (error, image) => {
                if (error) throw error;
                if (!image) {
                    throw new Error(`Image not found: ${id}.png`);
                }
                map.addImage(id, image);
            });
        }
    });
};

/**
 *
 * @function
 */
export const parseReservoirProperties = <
    T extends keyof ReservoirPropertiesRaw
>(
    key: T,
    value: string | number
): ReservoirProperties[T] => {
    if (ComplexReservoirProperties.includes(key)) {
        return JSON.parse(value as string) as ReservoirProperties[T];
    }
    return value as ReservoirProperties[T];
};

/**
 *
 * @function
 */
export const isSourceDataLoaded = (
    map: Map,
    sourceId: SourceId,
    event: SourceDataEvent
): boolean => {
    return Boolean(
        event.sourceId === sourceId &&
            map.getSource(sourceId) &&
            map.isSourceLoaded(sourceId) &&
            map.querySourceFeatures(sourceId).length
    );
};

/**
 *
 * @function
 */
export const getReservoirConfig = (id: SourceId): ReservoirConfig | null => {
    return ReservoirConfigs.find((config) => config.id === id) ?? null;
};

/**
 *
 * @function
 */
export const getReservoirIconImageExpression = (
    config: ReservoirConfig
): ExpressionSpecification => {
    return [
        'let',
        'capacity', // Variable name
        ['coalesce', ['get', config.capacityProperty], 1], // Variable value
        'storage', // Variable name
        [
            '/',
            ['/', ['coalesce', ['get', config.storageProperty], 1], 2], // TODO: remove the division by 2 when data is available
            ['coalesce', ['get', config.capacityProperty], 1],
        ], // Variable value
        [
            'step',
            ['zoom'],
            TeacupStepExpression,

            ...ZoomCapacityArray.flatMap(([zoom, capacity]) => [
                zoom, // At this zoom
                [
                    // Evaluate this expression
                    'case',
                    ['>=', ['var', 'capacity'], capacity],
                    TeacupStepExpression, // If GTE capacity, evaluate sub-step expression
                    'default', // Fallback to basic point symbol
                ],
            ]),
        ],
    ];
};

// export const getCapacityStepExpression = (values: number[]) => {
//     return [
//         'step',
//         ['var', 'capacity'],
//         values[0],
//         CapacityThresholds[0],
//         values[1],
//         CapacityThresholds[1],
//         values[2],
//         CapacityThresholds[2],
//         values[3],
//     ];
// };

// export const getZoomCapacityExpression = (zoomValues: number[][]) => {
//     return [
//         'let',
//         'capacity',
//         ['coalesce', ['get', 'Active Capacity'], 1],
//         [
//             'step',
//             ['zoom'],
//             ...zoomValues.flatMap(([zoom, ...capacityValues]) => [
//                 zoom,
//                 getCapacityStepExpression(capacityValues),
//             ]),
//         ],
//     ];
// };

/**
 *
 * @function
 */
export const getDefaultGeoJSON = (): FeatureCollection<
    Geometry,
    GeoJsonProperties
> => {
    return {
        type: 'FeatureCollection',
        features: [],
    };
};
