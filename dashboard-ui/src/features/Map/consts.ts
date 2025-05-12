/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { basemaps } from '@/components/Map/consts';
import { BasemapId } from '@/components/Map/types';
import { ExpressionSpecification } from 'mapbox-gl';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export const MAP_ID = 'main';

export const BASEMAP = basemaps[BasemapId.Dark];

export const INITIAL_CENTER: [number, number] = [-98.5795, 39.8282];
export const INITIAL_ZOOM = 4;

export enum SourceId {
    Regions = 'regions-source',
    Basins = 'hu04',
    Reservoirs = 'reservoirs-source',
    SnowWater = 'snow-water',
}

export enum LayerId {
    Regions = 'regions-main',
    Basins = 'basins-main',
    Reservoirs = 'reservoirs',
    SnowWater = 'snow-water',
}

export enum SubLayerId {
    RegionsBoundary = 'regions-boundary',
    RegionsFill = 'regions-fill',
    BasinsBoundary = 'basins-boundary',
    BasinsFill = 'basins-fill',
}

export const allLayerIds = [
    ...Object.values(LayerId),
    ...Object.values(SubLayerId),
];

const TeacupStepExpression: ExpressionSpecification = [
    'step',
    ['var', 'storage'],
    'default', // Below first step value
    0.05,
    'teacup-5',
    0.1,
    'teacup-10',
    0.15,
    'teacup-15',
    0.2,
    'teacup-20',
    0.25,
    'teacup-25',
    0.3,
    'teacup-30',
    0.35,
    'teacup-35',
    0.4,
    'teacup-40',
    0.45,
    'teacup-45',
    0.5,
    'teacup-50',
    0.55,
    'teacup-55',
    0.6,
    'teacup-60',
    0.65,
    'teacup-65',
    0.7,
    'teacup-70',
    0.75,
    'teacup-75',
    0.8,
    'teacup-80',
    0.85,
    'teacup-85',
    0.9,
    'teacup-90',
    0.95,
    'teacup-95',
    1.0,
    'teacup-100',
];

export const ReserviorIconImageExpression: ExpressionSpecification = [
    'let',
    'capacity', // Variable name
    ['coalesce', ['get', 'Active Capacity'], 1], // Variable value
    'storage', // Variable name
    [
        '/',
        ['/', ['coalesce', ['get', 'Live Capcity'], 1], 2], // Mock value, stand in for current storage
        ['coalesce', ['get', 'Active Capacity'], 1],
    ], // Variable value
    [
        'step',
        ['zoom'],
        TeacupStepExpression,

        ...[
            [0, 2010000],
            [4, 465000],
            [5, 320000],
            [7, 65000],
            [8, -1],
        ].flatMap(([zoom, capacity]) => [
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

/**
 *
 * @constant
 */
export const ComplexReservoirProperties = [
    'horizontalDatum',
    'locationRegionNames',
    'locationTags',
    'locationUnifiedRegionNames',
    'projectNames',
    'verticalDatum',
];

/**
 *
 * @constant
 */
export const ReservoirIdentifierField = '_id';
export const ReservoirLabelField = 'name';
/**
 *
 * @constant
 */
export const ReservoirRegionConnectorField = 'locationRegionNames';

export const ReservoirSource =
    'https://api.wwdh.internetofwater.app/collections/rise-edr/locations?f=json&parameter-name=reservoirStorage';
export const RegionsSource =
    'https://services1.arcgis.com/ixD30sld6F8MQ7V5/arcgis/rest/services/ReclamationBoundariesFL/FeatureServer/0';

export const defaultGeoJson: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: 'FeatureCollection',
    features: [],
};
