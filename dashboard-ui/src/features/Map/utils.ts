/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    ExpressionSpecification,
    GeoJSONFeature,
    LayoutSpecification,
    Map,
    PaintSpecification,
} from 'mapbox-gl';
import { SourceDataEvent, ReservoirConfig } from '@/features/Map/types';
import {
    ComplexReservoirProperties,
    ReservoirConfigs,
    TeacupStepExpression,
    ZoomCapacityArray,
} from '@/features/Map/consts';
import { SourceId } from '@/features/Map/consts';
import { FeatureCollection, GeoJsonProperties, Geometry, Point } from 'geojson';
import {
    RiseReservoirProperties,
    RiseReservoirPropertiesRaw,
} from '@/features/Map/types/reservoir/rise';
import wwdhService from '@/services/init/wwdh.init';
import { CoverageJSON } from '@/services/edr.service';
import { ResvizReservoirField } from './types/reservoir/resviz';

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
    if (!map.hasImage('no-data')) {
        map.loadImage('/map-icons/no-data.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: no-data.png');
            }
            map.addImage('no-data', image);
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
    T extends keyof RiseReservoirPropertiesRaw
>(
    key: T,
    value: string | number
): RiseReservoirProperties[T] => {
    if (ComplexReservoirProperties.includes(key)) {
        return JSON.parse(value as string) as RiseReservoirProperties[T];
    }
    return value as RiseReservoirProperties[T];
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
            ['coalesce', ['get', config.storageProperty], -1],
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
                    ['>', 0, ['var', 'storage']],
                    'no-data',
                    ['>=', ['var', 'capacity'], capacity],
                    TeacupStepExpression, // If GTE capacity, evaluate sub-step expression
                    'default', // Fallback to basic point symbol
                ],
            ]),
        ],
    ];
};

export const findReservoirIndex = (
    features: GeoJSONFeature[],
    identifier: string
) => {
    const index = features.findIndex((feature) => {
        const config = getReservoirConfig(feature.source as SourceId);
        if (feature?.properties && config) {
            return (
                String(
                    config.identifierProperty
                        ? feature.properties[config.identifierProperty]
                        : feature.id
                ) === identifier
            );
        }
        return false;
    });

    return index !== -1 ? index : 0;
};

export const getReservoirSymbolLayout = (
    config: ReservoirConfig
): LayoutSpecification => {
    return {
        'icon-image': getReservoirIconImageExpression(config),
        'icon-size': [
            'let',
            'capacity',
            ['coalesce', ['get', config.capacityProperty], 1],
            [
                'step',
                ['zoom'],
                1,
                0,
                [
                    'step',
                    ['var', 'capacity'],
                    0.3,
                    45000,
                    0.4,
                    320000,
                    0.3,
                    2010000,
                    0.5,
                ],
                5,
                [
                    'step',
                    ['var', 'capacity'],
                    0.3,
                    45000,
                    0.3,
                    320000,
                    0.4,
                    2010000,
                    0.5,
                ],
                8,
                [
                    'step',
                    ['var', 'capacity'],
                    0.3,
                    45000,
                    0.4,
                    320000,
                    0.5,
                    2010000,
                    0.6,
                ],
            ],
        ],

        'symbol-sort-key': ['coalesce', ['get', config.capacityProperty], 1],
        'icon-offset': [
            'step',
            ['zoom'],
            [0, 0],
            0,
            ['coalesce', ['get', 'offset'], [0, 0]],
            5,
            [0, 0],
        ],
        'icon-allow-overlap': true,
    };
};

export const getReservoirLabelLayout = (
    config: ReservoirConfig
): LayoutSpecification => {
    return {
        'text-field': ['get', config.labelProperty],
        'text-anchor': 'bottom',
        'text-size': 18,
        'symbol-sort-key': ['coalesce', ['get', config.capacityProperty], 1],
        'text-offset': [
            'let',
            'capacity',
            ['coalesce', ['get', config.capacityProperty], 1],
            [
                'step',
                ['zoom'],
                [0, 0],
                0,
                [
                    'step',
                    ['var', 'capacity'],
                    [0, 0.5],
                    45000,
                    [0, 1],
                    320000,
                    [0, 2.4],
                    2010000,
                    [0, 3.2],
                ],
                5,
                [
                    'step',
                    ['var', 'capacity'],
                    [0, 0.5],
                    45000,
                    [0, 2.1],
                    320000,
                    [0, 2.8],
                    2010000,
                    [0, 3.2],
                ],
                8,
                [
                    'step',
                    ['var', 'capacity'],
                    [0, 2.4],
                    45000,
                    [0, 2.8],
                    320000,
                    [0, 3.2],
                    2010000,
                    [0, 3.5],
                ],
            ],
        ],
    };
};

export const getReservoirLabelPaint = (
    config: ReservoirConfig
): PaintSpecification => {
    return {
        'text-color': '#000',
        'text-opacity': [
            'let',
            'capacity',
            ['coalesce', ['get', config.capacityProperty], 1],
            [
                'step',
                ['zoom'],
                0,
                ...ZoomCapacityArray.flatMap(([zoom, capacity]) => [
                    zoom, // At this zoom
                    [
                        // Evaluate this expression
                        'case',
                        ['>=', ['var', 'capacity'], capacity],
                        1, // If GTE capacity, evaluate sub-step expression
                        0, // Fallback to basic point symbol
                    ],
                ]),
            ],
        ],
        'text-halo-color': '#fff',
        'text-halo-width': 2,
    };
};

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

export const isReservoirIdentifier = (
    config: ReservoirConfig,
    properties: GeoJsonProperties,
    id: string | number,
    identifier: string | number
): boolean => {
    return config.identifierProperty && properties?.[config.identifierProperty]
        ? properties[config.identifierProperty] === identifier
        : id === identifier;
};

export const getReservoirIdentifier = (
    config: ReservoirConfig,
    properties: GeoJsonProperties,
    id: string | number
): string | number => {
    const identifier =
        config.identifierProperty && properties?.[config.identifierProperty]
            ? (properties?.[config.identifierProperty] as string | number)
            : id;

    return config.identifierType === 'string'
        ? String(identifier)
        : Number(identifier);
};

export const appendResvizDataProperties = async (
    featureCollection: FeatureCollection<Point, GeoJsonProperties>,
    reservoirDate?: string | null
): Promise<FeatureCollection<Point, GeoJsonProperties>> => {
    const ids = featureCollection.features.map((feature) => feature.id!);

    const requests = ids.map((id) =>
        wwdhService.getLocation<CoverageJSON>(
            SourceId.ResvizEDRReservoirs,
            String(id),
            {
                params: {
                    limit: 1,
                    ...(reservoirDate ? { datetime: reservoirDate } : {}),
                },
            }
        )
    );

    const results = await Promise.allSettled(requests);

    const updatedFeatures = featureCollection.features.map((feature, index) => {
        const result = results[index];
        const updatedProps: GeoJsonProperties = { ...feature.properties };

        if (result.status === 'fulfilled') {
            const coverage = result.value;
            // Set Storage
            updatedProps[ResvizReservoirField.Storage] =
                coverage.ranges[ResvizReservoirField.Storage]?.values?.[0];
            // 10th Percentile
            updatedProps[ResvizReservoirField.TenthPercentile] =
                coverage.ranges[
                    ResvizReservoirField.TenthPercentile
                ]?.values?.[0];
            // 90th Percentile
            updatedProps[ResvizReservoirField.NinetiethPercentile] =
                coverage.ranges[
                    ResvizReservoirField.NinetiethPercentile
                ]?.values?.[0];
            // 30-year Average
            updatedProps[ResvizReservoirField.StorageAverage] =
                coverage.ranges[
                    ResvizReservoirField.StorageAverage
                ]?.values?.[0];
        } else {
            console.warn(
                `Failed to fetch data for ID ${feature.id}:`,
                result.reason
            );
        }

        return {
            ...feature,
            properties: updatedProps,
        };
    });

    return {
        type: 'FeatureCollection',
        features: updatedFeatures,
    };
};
