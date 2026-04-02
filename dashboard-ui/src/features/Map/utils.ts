/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    ExpressionSpecification,
    FilterSpecification,
    GeoJSONFeature,
    GeoJSONSource,
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
    LayerId,
    ReservoirConfigs,
    SubLayerId,
    TeacupPercentageOfCapacityWithAvgExpression,
    TeacupPercentageOfCapacityWithoutAvgExpression,
    TeacupSizeExpression,
    US_BBOX,
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
import {
    CoverageCollection,
    CoverageJSON,
    IGetLocationParams,
} from '@/services/edr.service';
import { ResvizReservoirField } from '@/features/Map/types/reservoir/resviz';
import { SnotelField, SnotelProperties } from '@/features/Map/types/snotel';
import { TeacupReservoirField } from '@/features/Map/types/reservoir/teacup';
import { featureCollection as createFeatureCollection } from '@turf/turf';
import useMainStore from '@/stores/main';
import { BoundingGeographyLevel } from '@/stores/main/types';
import useSessionStore from '@/stores/session';
import { ReservoirDefault } from '@/stores/main/consts';

/**
 *
 * @function
 */
export const loadTeacups = (map: Map) => {
    // const teacupLevels = [
    //     100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15,
    //     10, 5, 0,
    // ];

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

    // teacupLevels.forEach((storage) => {
    //     const id = `teacup-${storage}`;
    //     if (!map.hasImage(id)) {
    //         map.loadImage(`/map-icons/${id}.png`, (error, image) => {
    //             if (error) throw error;
    //             if (!image) {
    //                 throw new Error(`Image not found: ${id}.png`);
    //             }
    //             map.addImage(id, image);
    //         });
    //     }
    //     teacupLevels.forEach((average) => {
    //         const id = `teacup-${storage}-${average}`;
    //         if (!map.hasImage(id)) {
    //             map.loadImage(`/map-icons/${id}.png`, (error, image) => {
    //                 if (error) throw error;
    //                 if (!image) {
    //                     throw new Error(`Image not found: ${id}.png`);
    //                 }
    //                 map.addImage(id, image);
    //             });
    //         }
    //     });
    // });

    map.triggerRepaint();
};

/**
 *
 * @function
 */
export const parseReservoirProperties = <
    T extends keyof RiseReservoirPropertiesRaw,
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
            [
                'any',
                ['<', ['var', 'storage'], 0],
                ['<', ['var', 'capacity'], 0],
            ],
            'no-data',
            ['>=', ['var', 'capacity'], capacity],
            [
                'case',
                ['==', ['var', 'average'], 'no-data'],
                TeacupPercentageOfCapacityWithoutAvgExpression,
                TeacupPercentageOfCapacityWithAvgExpression,
            ],
            'default',
        ], // evaluate this expression
    ]);

    return [
        // Define variables for reuse in sub-expressions
        'let',
        'capacity', // var name
        ['coalesce', ['get', config.capacityProperty], -1], // capacity variable value
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
        [
            'step',
            ['zoom'],
            [
                'case',
                ['==', ['var', 'average'], 'no-data'],
                TeacupPercentageOfCapacityWithoutAvgExpression,
                TeacupPercentageOfCapacityWithAvgExpression,
            ],
            ...zoomSteps,
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

export const getHighlightIcon = (
    config: ReservoirConfig
): ExpressionSpecification => {
    const zoomSteps = ZoomCapacityArray.flatMap(([zoom, capacity]) => [
        zoom, // for this zoom level
        [
            'case',
            [
                'any',
                ['<', ['var', 'storage'], 0],
                ['<', ['var', 'capacity'], 0],
            ],
            'outline-large',
            ['>=', ['var', 'capacity'], capacity],
            ['case', ['<', ['var', 'storage'], 0], 'outline-large', 'outline'],
            'outline-large',
        ], // evaluate this expression
    ]);

    return [
        'let',
        'capacity',
        ['coalesce', ['get', config.capacityProperty], -1],
        'storage', // var name
        [
            '/',
            ['coalesce', ['get', config.storageProperty], -1],
            ['coalesce', ['get', config.capacityProperty], 1],
        ],
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
            [
                'any',
                ['<', ['var', 'storage'], 0],
                ['<', ['var', 'capacity'], 0],
            ],
            defaultSize,
            ['>=', ['var', 'capacity'], capacity],
            [
                'case',
                ['<', ['var', 'storage'], 0],
                defaultSize,
                TeacupSizeExpression,
            ],
            defaultSize,
        ], // evaluate this expression
    ]);

    return [
        'let',
        'capacity',
        ['coalesce', ['get', config.capacityProperty], -1],
        'storage', // var name
        [
            '/',
            ['coalesce', ['get', config.storageProperty], -1],
            ['coalesce', ['get', config.capacityProperty], 1],
        ],
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
    const handleNoData = (expresssion: ExpressionSpecification) => [
        'case',
        ['<', ['var', 'storage'], 0],
        [0, 0.4],
        expresssion,
    ];

    return {
        'text-field': ['get', config.shortLabelProperty],
        // 'text-variable-anchor': ['bottom', 'bottom-left', 'bottom-right'],
        'text-anchor': 'top',
        'text-size': 16,
        'symbol-sort-key': [
            '+',
            ['coalesce', ['get', config.capacityProperty], 1],
            1,
        ],
        'text-font': ['Arial Unicode MS Bold'],
        'text-offset': [
            'let',
            'capacity',
            ['coalesce', ['get', config.capacityProperty], 1],
            'storage', // var name
            [
                '/',
                ['coalesce', ['get', config.storageProperty], -1],
                ['coalesce', ['get', config.capacityProperty], 1],
            ],
            [
                'step',
                ['zoom'],
                [0, 0],
                0,
                handleNoData([
                    'step',
                    ['var', 'capacity'],
                    [0, 0],
                    45000,
                    [0, 0.2],
                    320000,
                    [0, 0.8],
                    2010000,
                    [0, 1.7],
                ]),
                5,
                handleNoData([
                    'step',
                    ['var', 'capacity'],
                    [0, 0.3],
                    45000,
                    [0, 1.2],
                    320000,
                    [0, 1.6],
                    2010000,
                    [0, 1.7],
                ]),
                8,
                handleNoData([
                    'step',
                    ['var', 'capacity'],
                    [0, 1],
                    45000,
                    [0, 1.3],
                    320000,
                    [0, 1.7],
                    2010000,
                    [0, 1.8],
                ]),
            ],
        ],
        'text-allow-overlap': true,
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

export const getReservoirFilter = (
    config: ReservoirConfig
): FilterSpecification => {
    const dataProperties = [
        config.capacityProperty,
        config.storageProperty,
        // config.tenthPercentileProperty,
        // config.ninetiethPercentileProperty,
        // config.thirtyYearAverageProperty,
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

export const getReservoirLabelFilter = (
    config: ReservoirConfig
): FilterSpecification => {
    return [
        'in',
        ['get', config.identifierProperty],
        [
            'literal',
            [
                'ElephantButte',
                'FranklinD.Roosevelt',
                'Shasta',
                'FortPeck',
                'Powell',
                'Mead',
                'FlamingGorge',
                'ElephantButte',
                'NewMelones',
            ],
        ],
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
    reservoirDate?: string | null,
    signal?: AbortSignal
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
                signal,
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

type Options = {
    params?: IGetLocationParams;
    reservoirDate?: string | null;
    signal?: AbortSignal;
};

const updateTeacupProperties = (feature: Feature<Point, GeoJsonProperties>) => {
    const updatedProps: GeoJsonProperties = {
        ...feature.properties,
    };

    if (feature.properties) {
        const useTotal =
            String(
                feature.properties[TeacupReservoirField.UseTotalOrActiveStorage]
            ) === 'Total';
        if (useTotal) {
            const totalCapacity = feature.properties[
                TeacupReservoirField.TotalCapacity
            ]
                ? Number(feature.properties[TeacupReservoirField.TotalCapacity])
                : undefined;

            updatedProps[TeacupReservoirField.Capacity] = totalCapacity;
        } else {
            const activeCapacity = feature.properties[
                TeacupReservoirField.ActiveCapacity
            ]
                ? Number(
                      feature.properties[TeacupReservoirField.ActiveCapacity]
                  )
                : undefined;

            updatedProps[TeacupReservoirField.Capacity] = activeCapacity;
        }

        // Huc06 is given as a URI
        const huc06URI = String(feature.properties[TeacupReservoirField.Huc06]);

        const huc02 = String(
            feature.properties[TeacupReservoirField.Huc06]
        ).substring(huc06URI.length - 6, huc06URI.length - 4);

        updatedProps[TeacupReservoirField.Huc02] = huc02;
    }

    return updatedProps;
};

const getRangeValueConstructor =
    (ranges: CoverageJSON['ranges']) => (property: string) => {
        return ranges[property]?.values?.[0];
    };

export const appendTeacupDataProperties = async (
    featureCollection: FeatureCollection<Point, GeoJsonProperties>,
    options: Options = {}
): Promise<FeatureCollection<Point, GeoJsonProperties>> => {
    const { reservoirDate, signal } = options;

    const coverageCollection = await wwdhService.getCube<CoverageCollection>(
        SourceId.TeacupEDRReservoirs,
        {
            params: {
                bbox: US_BBOX,
                limit: 1,
                ...(reservoirDate ? { datetime: reservoirDate } : {}),
            },
            signal,
        }
    );

    const updatedFeatures = featureCollection.features.map((feature) => {
        const coverage = coverageCollection.coverages.find(
            (coverage) => coverage.id && coverage.id === feature.id
        );

        // Set basic things that are not dependant on /location return, like capacity or the huc02 id
        const updatedProperties = updateTeacupProperties(feature);

        // This feature came from the /items request
        if (!coverage) {
            // Set Storage
            updatedProperties[TeacupReservoirField.Storage] = undefined;
            // 10th Percentile
            updatedProperties[TeacupReservoirField.TenthPercentile] = undefined;
            // 90th Percentile
            updatedProperties[TeacupReservoirField.NinetiethPercentile] =
                undefined;
            // 30-year Average
            updatedProperties[TeacupReservoirField.StorageAverage] = undefined;
            updatedProperties[TeacupReservoirField.StorageDate] = undefined;
            updatedProperties[TeacupReservoirField.Item] = true;

            return {
                ...feature,
                properties: updatedProperties,
            };
        } else {
            // Mark that this is a location, not item
            updatedProperties[TeacupReservoirField.Item] = false;
        }

        const getRangeValue = getRangeValueConstructor(coverage.ranges);

        // Set Storage
        updatedProperties[TeacupReservoirField.Storage] = getRangeValue(
            TeacupReservoirField.Storage
        );
        // 10th Percentile
        updatedProperties[TeacupReservoirField.TenthPercentile] = getRangeValue(
            TeacupReservoirField.TenthPercentile
        );
        // 90th Percentile
        updatedProperties[TeacupReservoirField.NinetiethPercentile] =
            getRangeValue(TeacupReservoirField.NinetiethPercentile);
        // 30-year Average
        updatedProperties[TeacupReservoirField.StorageAverage] = getRangeValue(
            TeacupReservoirField.StorageAverage
        );
        updatedProperties[TeacupReservoirField.StorageDate] = coverage.domain
            .axes.t.values?.[0] as string;

        return {
            ...feature,
            properties: updatedProperties,
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
    value: string | number | string[] | number[],
    applyLabelFilter: boolean = false
): FilterSpecification => {
    const prop = ['get', config[property]];

    // Normalize value into array
    const values = Array.isArray(value) ? value : [value];

    // Handle basin HUC06 identifiers
    if (
        config.id === SourceId.ResvizEDRReservoirs &&
        property === 'basinConnectorProperty'
    ) {
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

        const matchExpression: FilterSpecification = [
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

        return matchExpression;
        // return ['all', getReservoirFilter(config), matchExpression];
    }

    const scalarMatches = applyLabelFilter
        ? [
              'all',
              ['any', ...values.map((v) => ['==', prop, v])],
              getReservoirLabelFilter(config),
          ]
        : ['any', ...values.map((v) => ['==', prop, v])];

    const arrayMatches = applyLabelFilter
        ? [
              'all',
              ['any', ...values.map((v) => ['in', v, prop])],
              getReservoirLabelFilter(config),
          ]
        : ['any', ...values.map((v) => ['in', v, prop])];

    const matchExpression: FilterSpecification = [
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

    return matchExpression;
    // return ['all', getReservoirFilter(config), matchExpression];
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

export const getAllMapLayers = (config: ReservoirConfig) => {
    return [config.iconLayer, config.labelLayer];
};

export const getFeatures = <T extends Geometry, V extends GeoJsonProperties>(
    map: Map,
    sourceId: SourceId
): FeatureCollection<T, V> | undefined => {
    try {
        const source = map.getSource(sourceId) as GeoJSONSource;

        const data = source._data;
        if (typeof data !== 'string') {
            const e = createFeatureCollection<T, V>(
                (data as FeatureCollection<T, V>).features
            );

            return e;
        }
    } catch (error) {
        console.error(error);
    }
};

const ZOOM_HIGH = 8;
const ZOOM_MID = 6;

const getProperty = (
    boundingGeographyLevel: BoundingGeographyLevel
): keyof ReservoirConfig => {
    switch (boundingGeographyLevel) {
        case BoundingGeographyLevel.Region:
            return 'regionConnectorProperty';
        case BoundingGeographyLevel.Basin:
            return 'basinConnectorProperty';
        default:
        case BoundingGeographyLevel.State:
            return 'stateConnectorProperty';
    }
};

const getFilterValue = (
    region: string[],
    basin: string[],
    state: string[],
    boundingGeographyLevel: BoundingGeographyLevel
) => {
    if (
        boundingGeographyLevel === BoundingGeographyLevel.Region &&
        region.length > 0
    ) {
        return region;
    }
    if (
        boundingGeographyLevel === BoundingGeographyLevel.Basin &&
        basin.length > 0
    ) {
        return basin;
    }
    if (
        boundingGeographyLevel === BoundingGeographyLevel.State &&
        state.length > 0
    ) {
        return state;
    }
    return [];
};

const applyLabelSettingsConstructor =
    (map: Map) =>
    (
        layerId: LayerId | SubLayerId,
        options: {
            filter?: FilterSpecification | null;
            allowOverlap?: boolean;
        }
    ) => {
        if (!map.getLayer(layerId)) {
            return;
        }
        if (typeof options.allowOverlap === 'boolean') {
            map.setLayoutProperty(
                layerId,
                'text-allow-overlap',
                options.allowOverlap
            );
        }
        if (options.filter !== undefined) {
            map.setFilter(layerId, options.filter ?? null);
        }
    };

const allOf = (
    ...filters: Array<FilterSpecification | null | undefined>
): FilterSpecification | null | undefined => {
    const defined = filters.filter(
        (f): f is FilterSpecification => f !== null && f !== undefined
    );
    if (defined.length > 0) {
        return ['all', ...defined] as unknown as FilterSpecification;
    }
    // If we have only null/undefined, and any is null then clear all filters
    if (filters.some((f) => f === null)) {
        return null;
    }
    // do not change the current filter
    return undefined;
};

const getZoomBucket = (zoom: number) => {
    return zoom > ZOOM_HIGH ? 'high' : zoom > ZOOM_MID ? 'mid' : 'low';
};

export const updateReservoirFilters = (map: Map) => {
    const zoom = map.getZoom();
    const zoomBucket = getZoomBucket(zoom);

    const {
        boundingGeographyLevel,
        region = [],
        basin = [],
        state = [],
        reservoir,
    } = useMainStore.getState();
    const { hideNoData } = useSessionStore.getState();

    const hasBoundingGeography =
        (region?.length ?? 0) > 0 ||
        (basin?.length ?? 0) > 0 ||
        (state?.length ?? 0) > 0;

    const property = getProperty(boundingGeographyLevel);
    const filterValue = getFilterValue(
        region ?? [],
        basin ?? [],
        state ?? [],
        boundingGeographyLevel
    );

    // Overlap behavior (labels collide less as we zoom in)
    const allowOverlapForBucket = zoomBucket === 'high' ? false : true;

    const applyLabelSettings = applyLabelSettingsConstructor(map);

    ReservoirConfigs.forEach((config) => {
        //    - If geography active: filter to geography
        //    - Else: either hideNoData filter or no filter
        const iconBaseFilter: FilterSpecification | null | undefined =
            hasBoundingGeography
                ? getBoundingGeographyFilter(config, property, filterValue)
                : hideNoData
                  ? getReservoirFilter(config)
                  : null;

        const iconFilter: FilterSpecification | null | undefined =
            hasBoundingGeography && hideNoData
                ? allOf(iconBaseFilter, getReservoirFilter(config))
                : iconBaseFilter;

        if (map.getLayer(config.iconLayer)) {
            map.setFilter(config.iconLayer, iconFilter ?? null);
        }

        let labelFilter: FilterSpecification | null | undefined;
        if (hasBoundingGeography) {
            const includeLabelFilter = zoomBucket === 'low';
            const geoLabel = getBoundingGeographyFilter(
                config,
                property,
                filterValue,
                includeLabelFilter
            );

            labelFilter = hideNoData
                ? allOf(geoLabel, getReservoirFilter(config))
                : geoLabel;
        } else {
            // No geography selection
            if (reservoir === ReservoirDefault) {
                // - low: show labels via getReservoirLabelFilter
                // - mid: clear labels
                // - high: don't change
                labelFilter =
                    zoomBucket === 'low'
                        ? getReservoirLabelFilter(config)
                        : zoomBucket === 'mid'
                          ? null
                          : undefined;

                // If hideNoData is on, compose it as well
                if (hideNoData) {
                    labelFilter = allOf(
                        labelFilter,
                        getReservoirFilter(config)
                    );
                }
            } else {
                // Non-default reservoir, no geography:
                labelFilter =
                    zoomBucket === 'low'
                        ? getReservoirLabelFilter(config)
                        : zoomBucket === 'mid'
                          ? null
                          : undefined;

                if (hideNoData) {
                    labelFilter = allOf(
                        labelFilter,
                        getReservoirFilter(config)
                    );
                }
            }
        }

        // Apply label settings and filter in one call
        applyLabelSettings(config.labelLayer, {
            filter: labelFilter,
            allowOverlap: allowOverlapForBucket,
        });
    });
};
