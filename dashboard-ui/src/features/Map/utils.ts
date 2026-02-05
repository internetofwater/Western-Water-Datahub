/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    ExpressionSpecification,
    FilterSpecification,
    GeoJSONFeature,
    LayoutSpecification,
    Map,
    PaintSpecification,
    Popup,
} from 'mapbox-gl';
import { SourceDataEvent, ReservoirConfig } from '@/features/Map/types';
import {
    ComplexReservoirProperties,
    INITIAL_CENTER,
    INITIAL_ZOOM,
    ReservoirConfigs,
    TeacupPercentageOfCapacityExpression,
    TeacupSizeExpression,
    ZoomCapacityArray,
} from '@/features/Map/consts';
import { SourceId } from '@/features/Map/consts';
import {
    Feature,
    FeatureCollection,
    GeoJsonProperties,
    Geometry,
    Point,
} from 'geojson';
import {
    RiseReservoirProperties,
    RiseReservoirPropertiesRaw,
} from '@/features/Map/types/reservoir/rise';
import wwdhService from '@/services/init/wwdh.init';
import { CoverageJSON } from '@/services/edr.service';
import { ResvizReservoirField } from '@/features/Map/types/reservoir/resviz';
import { SnotelField, SnotelProperties } from '@/features/Map/types/snotel';

/**
 *
 * @function
 */
export const loadImages = (map: Map) => {
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
    if (!map.hasImage('outline')) {
        map.loadImage('/map-icons/outline.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: outline.png');
            }
            map.addImage('outline', image);
        });
    }
    if (!map.hasImage('outline-large')) {
        map.loadImage('/map-icons/outline-large.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: outline-large.png');
            }
            map.addImage('outline-large', image);
        });
    }

    teacupLevels.forEach((average) => {
        teacupLevels.forEach((storage) => {
            const id = `teacup-${storage}-${average}`;
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
    });

    map.triggerRepaint();
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
    const zoomSteps = ZoomCapacityArray.flatMap(([zoom, capacity]) => [
        zoom, // for this zoom level
        [
            'case',
            ['<', ['var', 'storage'], 0],
            'no-data',
            ['>=', ['var', 'capacity'], capacity],
            TeacupPercentageOfCapacityExpression,
            'default',
        ], // evaluate this expression
    ]);

    return [
        // Define variables for reuse in sub-expressions
        'let',
        'capacity', // var name
        ['coalesce', ['get', config.capacityProperty], 1], // capacity variable value
        'storage', // var name
        [
            '/',
            ['coalesce', ['get', config.storageProperty], -1],
            ['coalesce', ['get', config.capacityProperty], 1],
        ], // storage variable value
        'average', // var name
        [
            'step',
            [
                '/',
                ['coalesce', ['get', config.thirtyYearAverageProperty], -1],
                ['coalesce', ['get', config.capacityProperty], 1],
            ],
            'default', // Below first step value
            -1,
            'no-data',
            0,
            '0',
            0.05,
            '5',
            0.1,
            '10',
            0.15,
            '15',
            0.2,
            '20',
            0.25,
            '25',
            0.3,
            '30',
            0.35,
            '35',
            0.4,
            '40',
            0.45,
            '45',
            0.5,
            '50',
            0.55,
            '55',
            0.6,
            '60',
            0.65,
            '65',
            0.7,
            '70',
            0.75,
            '75',
            0.8,
            '80',
            0.85,
            '85',
            0.9,
            '90',
            0.95,
            '95',
            1.0,
            '100,',
        ], // average variable value
        // Primary expression
        ['step', ['zoom'], TeacupPercentageOfCapacityExpression, ...zoomSteps],
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

export const getHighlightIcon = (
    config: ReservoirConfig
): ExpressionSpecification => {
    const zoomSteps = ZoomCapacityArray.flatMap(([zoom, capacity]) => [
        zoom, // for this zoom level
        [
            'case',
            ['>=', ['var', 'capacity'], capacity],
            'outline',
            'outline-large',
        ], // evaluate this expression
    ]);

    return [
        'let',
        'capacity',
        ['coalesce', ['get', config.capacityProperty], 1],
        ['step', ['zoom'], 'outline', ...zoomSteps],
    ];
};

export const getReservoirSymbolSize = (
    config: ReservoirConfig,
    defaultSize: number = 0.4
): ExpressionSpecification => {
    const zoomSteps = ZoomCapacityArray.flatMap(([zoom, capacity]) => [
        zoom, // for this zoom level
        [
            'case',
            ['>=', ['var', 'capacity'], capacity],
            TeacupSizeExpression,
            defaultSize,
        ], // evaluate this expression
    ]);

    return [
        'let',
        'capacity',
        ['coalesce', ['get', config.capacityProperty], 1],
        ['step', ['zoom'], TeacupSizeExpression, ...zoomSteps],
    ];
};

export const getReservoirSymbolSortKey = (
    config: ReservoirConfig
): ExpressionSpecification => {
    return ['coalesce', ['get', config.capacityProperty], 1];
};

export const getReservoirSymbolLayout = (
    config: ReservoirConfig
): LayoutSpecification => {
    return {
        'icon-image': getReservoirIconImageExpression(config),
        'icon-size': getReservoirSymbolSize(config),

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
        'text-size': 16,
        'symbol-sort-key': [
            '+',
            ['coalesce', ['get', config.capacityProperty], 1],
            1,
        ],
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
        'text-color': '#fff',
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
        'text-halo-color': '#000',
        'text-halo-width': 2,
    };
};

export const getReservoirFilter = (
    config: ReservoirConfig
): FilterSpecification => {
    const dataProperties = [
        config.capacityProperty,
        config.storageProperty,
        config.tenthPercentileProperty,
        config.ninetiethPercentileProperty,
        config.thirtyYearAverageProperty,
    ];
    return [
        'all',
        ...dataProperties.map((property) => [
            'all',
            ['has', property],
            ['==', ['typeof', ['get', property]], 'number'],
        ]),
    ];
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
            updatedProps[ResvizReservoirField.StorageDate] =
                coverage.domain.axes.t.values?.[0];
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

export const getBoundingGeographyFilter = (
    config: ReservoirConfig,
    property: keyof ReservoirConfig,
    value: string | number | string[] | number[]
): FilterSpecification => {
    const prop = ['get', config[property]];

    // Normalize value into array
    const values = Array.isArray(value) ? value : [value];

    // Handle basin HUC06 identifiers
    if (property === 'basinConnectorProperty') {
        const values = Array.isArray(value) ? value : [value];

        const scalarMatches = [
            'any',
            ...values.map((v) => [
                '==',
                ['slice', ['to-string', prop], 0, 2],
                v,
            ]),
        ];

        const arrayMatches = [
            'any',
            ...values.map((v) => [
                'in',
                v,
                ['slice', ['to-string', prop], 0, 2],
            ]),
        ];

        const matchExpression = [
            'case',
            ['==', ['typeof', prop], 'array'],
            arrayMatches,
            [
                'any',
                ['==', ['typeof', prop], 'string'],
                ['==', ['typeof', prop], 'number'],
            ],
            scalarMatches,
            false,
        ];
        return ['all', getReservoirFilter(config), matchExpression];
    }

    const scalarMatches = ['any', ...values.map((v) => ['==', prop, v])];

    const arrayMatches = ['any', ...values.map((v) => ['in', v, prop])];

    const matchExpression = [
        'case',
        ['==', ['typeof', prop], 'array'],
        arrayMatches,
        [
            'any',
            ['==', ['typeof', prop], 'string'],
            ['==', ['typeof', prop], 'number'],
        ],
        scalarMatches,
        false,
    ];

    return ['all', getReservoirFilter(config), matchExpression];
};

export const resetMap = (map: Map) => {
    map.resize();
    map.once('idle', () => {
        requestAnimationFrame(() => {
            map.flyTo({
                center: INITIAL_CENTER,
                zoom: INITIAL_ZOOM,
                speed: 2,
                easing: (t) => t, // linear easing
            });
        });
    });
};

export const getAndDisplaySnotelChart = async (
    map: Map,
    persistentPopup: Popup,
    feature: Feature<Point, SnotelProperties>
) => {
    const state = feature.properties[SnotelField.StateCode];
    const name = feature.properties[SnotelField.Name];
    const url = `https://nwcc-apps.sc.egov.usda.gov/awdb/site-plots/POR/WTEQ/${state}/${name}.html`;
    const response = await fetch(url);

    const htmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const graphContainer = doc.querySelector('.graph-container')?.innerHTML;

    if (graphContainer) {
        persistentPopup
            .setLngLat(feature.geometry.coordinates as [number, number])
            .setHTML(htmlText)
            .addTo(map);
    }
};
