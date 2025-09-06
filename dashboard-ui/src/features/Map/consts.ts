/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { basemaps } from '@/components/Map/consts';
import { BasemapId } from '@/components/Map/types';
import { ExpressionSpecification } from 'mapbox-gl';
import { ReservoirConfig } from '@/features/Map/types';
import { ResvizReservoirField } from '@/features/Map/types/reservoir/resviz';

export const MAP_ID = 'main';

export const BASEMAP = basemaps[BasemapId.Dark];

export const INITIAL_CENTER: [number, number] = [-107.85792, 38.1736];
export const INITIAL_ZOOM = 4.15;

export enum SourceId {
    Regions = 'regions-source',
    Basins = 'hu02',
    States = 'states',
    RiseEDRReservoirs = 'rise-edr',
    ResvizEDRReservoirs = 'resviz-edr',
    USACEEDRReservoirs = 'usace-edr',
    SnowWater = 'snow-water',
    USDroughtMonitor = 'us-drought-monitor',
    NOAAPrecipSixToTen = 'noaa-precip-6-10-day',
    NOAATempSixToTen = 'noaa-temp-6-10-day',
    NOAARiverForecast = 'noaa-rfc',
    Snotel = 'snotel-edr',
    SnotelHucSixMeans = 'snotel-huc06-means',
}

export enum LayerId {
    Regions = 'regions-main',
    Basins = 'basins-main',
    States = 'states-main',
    RiseEDRReservoirs = 'rise-edr-reservoir-points',
    ResvizEDRReservoirs = 'resviz-edr-reservoir-points',
    SnowWater = 'snow-water',
    USDroughtMonitor = 'us-drought-monitor',
    NOAAPrecipSixToTen = 'noaa-precip-6-10-day',
    NOAATempSixToTen = 'noaa-temp-6-10-day',
    NOAARiverForecast = 'noaa-rfc',
    Snotel = 'snotel-edr',
    SnotelHucSixMeans = 'snotel-huc06-means',
}

export enum SubLayerId {
    RegionsBoundary = 'regions-boundary',
    RegionsFill = 'regions-fill',
    BasinsBoundary = 'basins-boundary',
    BasinsFill = 'basins-fill',
    StatesBoundary = 'states-boundary',
    StatesFill = 'states-fill',
    RiseEDRReservoirLabels = 'rise-edr-reservoir-labels',
    ResvizEDRReservoirLabels = 'resviz-edr-reservoir-labels',
}

export const allLayerIds = [
    ...Object.values(LayerId),
    ...Object.values(SubLayerId),
];

export const ZoomCapacityArray = [
    [0, 2010000],
    [4, 465000],
    [5, 320000],
    [7, 65000],
    [8, -1],
];

export const TeacupPercentageOfCapacityExpression: ExpressionSpecification = [
    'step',
    ['var', 'storage'],
    'default', // Below first step value
    -1,
    'no-data',
    0,
    ['concat', 'teacup-0-', ['var', 'average']],
    0.05,
    ['concat', 'teacup-5-', ['var', 'average']],
    0.1,
    ['concat', 'teacup-10-', ['var', 'average']],
    0.15,
    ['concat', 'teacup-15-', ['var', 'average']],
    0.2,
    ['concat', 'teacup-20-', ['var', 'average']],
    0.25,
    ['concat', 'teacup-25-', ['var', 'average']],
    0.3,
    ['concat', 'teacup-30-', ['var', 'average']],
    0.35,
    ['concat', 'teacup-35-', ['var', 'average']],
    0.4,
    ['concat', 'teacup-40-', ['var', 'average']],
    0.45,
    ['concat', 'teacup-45-', ['var', 'average']],
    0.5,
    ['concat', 'teacup-50-', ['var', 'average']],
    0.55,
    ['concat', 'teacup-55-', ['var', 'average']],
    0.6,
    ['concat', 'teacup-60-', ['var', 'average']],
    0.65,
    ['concat', 'teacup-65-', ['var', 'average']],
    0.7,
    ['concat', 'teacup-70-', ['var', 'average']],
    0.75,
    ['concat', 'teacup-75-', ['var', 'average']],
    0.8,
    ['concat', 'teacup-80-', ['var', 'average']],
    0.85,
    ['concat', 'teacup-85-', ['var', 'average']],
    0.9,
    ['concat', 'teacup-90-', ['var', 'average']],
    0.95,
    ['concat', 'teacup-95-', ['var', 'average']],
    1.0,
    ['concat', 'teacup-100-', ['var', 'average']],
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
export const RISEEDRReservoirSource =
    'https://cache.wwdh.internetofwater.app/collections/rise-edr/locations?parameter-name=Storage&limit=10000';

/**
 *
 * @constant
 */
export const ResVizEDRReservoirSource =
    'https://cache.wwdh.internetofwater.app/collections/resviz-edr/locations';

/**
 *
 * @constant
 */
export const RegionsSource =
    'https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/DOI_Unified_Regions/FeatureServer/0';

/**
 *
 * @constant
 */
export const ReservoirConfigs: ReservoirConfig[] = [
    // {
    //     id: SourceId.RiseEDRReservoirs,
    //     storageProperty: RiseReservoirField.LiveCapacity, // Mock value, stand in for current storage
    //     capacityProperty: RiseReservoirField.ActiveCapacity,
    //     tenthPercentileProperty: RiseReservoirField.ActiveCapacity,
    //     ninetiethPercentileProperty: RiseReservoirField.ActiveCapacity,
    //     thirtyYearAverageProperty: RiseReservoirField.ActiveCapacity,
    //     identifierProperty: RiseReservoirField.Id,
    //     identifierType: 'number',
    //     labelProperty: RiseReservoirField.AssetNameInTessel,
    //     chartLabel: 'Lake/Reservoir Storage',
    //     regionConnectorProperty: RiseReservoirField.LocationUnifiedRegionNames,
    //     connectedLayers: [
    //         LayerId.RiseEDRReservoirs,
    //         SubLayerId.RiseEDRReservoirLabels,
    //     ],
    //     params: {
    //         'parameter-name': 'Storage',
    //     },
    // },
    {
        id: SourceId.ResvizEDRReservoirs,
        storageProperty: ResvizReservoirField.Storage,
        capacityProperty: ResvizReservoirField.MaxCapacity,
        tenthPercentileProperty: ResvizReservoirField.TenthPercentile,
        ninetiethPercentileProperty: ResvizReservoirField.NinetiethPercentile,
        thirtyYearAverageProperty: ResvizReservoirField.StorageAverage,
        storageDateProperty: ResvizReservoirField.StorageDate,
        identifierProperty: ResvizReservoirField.MonitoringLocationId,
        identifierType: 'number',
        labelProperty: ResvizReservoirField.SiteName,
        chartLabel: ResvizReservoirField.Storage,
        regionConnectorProperty: ResvizReservoirField.DoiRegionName,
        basinConnectorProperty: ResvizReservoirField.Huc06,
        stateConnectorProperty: ResvizReservoirField.State,
        connectedLayers: [
            LayerId.ResvizEDRReservoirs,
            SubLayerId.ResvizEDRReservoirLabels,
        ],

        params: {
            'parameter-name': 'Storage',
        },
    },
];

export const BaseLayerOpacity = 0.5;

export const ValidStates = [
    'ND',
    'SD',
    'KS',
    'OK',
    'TX',
    'NM',
    'NE',
    'CO',
    'ID',
    'UT',
    'NV',
    'AZ',
    'MT',
    'CA',
    'OR',
    'WA',
];

export const ValidBasins = [
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
];
