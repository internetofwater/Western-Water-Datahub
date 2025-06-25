/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { basemaps } from '@/components/Map/consts';
import { BasemapId } from '@/components/Map/types';
import { ExpressionSpecification } from 'mapbox-gl';
import { ReservoirConfig } from '@/features/Map/types';

export const MAP_ID = 'main';

export const BASEMAP = basemaps[BasemapId.Dark];

export const INITIAL_CENTER: [number, number] = [-107.85792, 38.1736];
export const INITIAL_ZOOM = 4.15;

export enum SourceId {
    Regions = 'regions-source',
    Basins = 'hu04',
    RiseEDRReservoirs = 'rise-edr',
    USACEEDRReservoirs = 'usace-edr',
    SnowWater = 'snow-water',
}

export enum LayerId {
    Regions = 'regions-main',
    Basins = 'basins-main',
    RiseEDRReservoirs = 'rise-edr-reservoir-points',
    SnowWater = 'snow-water',
}

export enum SubLayerId {
    RegionsBoundary = 'regions-boundary',
    RegionsFill = 'regions-fill',
    BasinsBoundary = 'basins-boundary',
    BasinsFill = 'basins-fill',
    RiseEDRReservoirLabels = 'rise-edr-reservoir-labels',
}

export const allLayerIds = [
    ...Object.values(LayerId),
    ...Object.values(SubLayerId),
];

export const ReservoirStyleConfig = {
    2010000: {
        0: {
            iconSize: 0.5,
            showTeacup: true,
        },
        4: {
            iconSize: 0.5,
            showTeacup: true,
        },
        5: {
            iconSize: 0.5,
            showTeacup: true,
        },
        7: {
            iconSize: 0.6,
            showTeacup: true,
        },
        8: {
            iconSize: 0.6,
            showTeacup: true,
        },
    },
    465000: {
        0: {
            iconSize: 0.4,
            showTeacup: false,
        },
        4: {
            iconSize: 0.4,
            showTeacup: true,
        },
        5: {
            iconSize: 0.4,
            showTeacup: true,
        },
        7: {
            iconSize: 0.5,
            showTeacup: true,
        },
        8: {
            iconSize: 0.5,
            showTeacup: true,
        },
    },
    320000: {
        0: {
            iconSize: 0.4,
            showTeacup: false,
        },
        4: {
            iconSize: 0.4,
            showTeacup: false,
        },
        5: {
            iconSize: 0.4,
            showTeacup: true,
        },
        7: {
            iconSize: 0.5,
            showTeacup: true,
        },
        8: {
            iconSize: 0.5,
            showTeacup: true,
        },
    },
    65000: {
        0: {
            iconSize: 0.4,
            showTeacup: false,
        },
        4: {
            iconSize: 0.4,
            showTeacup: false,
        },
        5: {
            iconSize: 0.4,
            showTeacup: false,
        },
        7: {
            iconSize: 0.5,
            showTeacup: true,
        },
        8: {
            iconSize: 0.5,
            showTeacup: true,
        },
    },
    [-1]: {
        // All other reservoirs
        0: {
            iconSize: 0.4,
            showTeacup: false,
        },
        4: {
            iconSize: 0.4,
            showTeacup: false,
        },
        5: {
            iconSize: 0.4,
            showTeacup: false,
        },
        7: {
            iconSize: 0.5,
            showTeacup: true,
        },
        8: {
            iconSize: 0.5,
            showTeacup: true,
        },
    },
};

export const ZoomCapacityArray = [
    [0, 2010000],
    [4, 465000],
    [5, 320000],
    [7, 65000],
    [8, -1],
];

export const TeacupStepExpression: ExpressionSpecification = [
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
export const ReservoirRegionConnectorField = 'locationRegionNames';

export const RISEEDRReservoirSource =
    'https://api.wwdh.internetofwater.app/collections/rise-edr/locations?f=json&parameter-name=reservoirStorage';
export const RegionsSource =
    'https://services1.arcgis.com/ixD30sld6F8MQ7V5/arcgis/rest/services/ReclamationBoundariesFL/FeatureServer/0';

/**
 *
 * @constant
 */
export const ReservoirConfigs: ReservoirConfig[] = [
    {
        id: SourceId.RiseEDRReservoirs,
        storageProperty: 'Live Capcity', // Mock value, stand in for current storage
        capacityProperty: 'Active Capacity',
        identifierProperty: '_id',
        identifierType: 'number',
        labelProperty: 'Asset Name (in tessel)',
        regionConnectorProperty: 'locationRegionNames',
        connectedLayers: [
            LayerId.RiseEDRReservoirs,
            SubLayerId.RiseEDRReservoirLabels,
        ],
    },
];
