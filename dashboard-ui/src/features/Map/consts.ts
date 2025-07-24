/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { basemaps } from '@/components/Map/consts';
import { BasemapId } from '@/components/Map/types';
import { ExpressionSpecification } from 'mapbox-gl';
import { ReservoirConfig } from '@/features/Map/types';
import { ResvizReservoirField } from './types/reservoir/resviz';

export const MAP_ID = 'main';

export const BASEMAP = basemaps[BasemapId.Dark];

export const INITIAL_CENTER: [number, number] = [-107.85792, 38.1736];
export const INITIAL_ZOOM = 4.15;

export enum SourceId {
    Regions = 'regions-source',
    Basins = 'hu06',
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
    ['concat', ['var', 'average'], '-teacup-0'],
    0.05,
    ['concat', ['var', 'average'], '-teacup-5'],
    0.1,
    ['concat', ['var', 'average'], '-teacup-10'],
    0.15,
    ['concat', ['var', 'average'], '-teacup-15'],
    0.2,
    ['concat', ['var', 'average'], '-teacup-20'],
    0.25,
    ['concat', ['var', 'average'], '-teacup-25'],
    0.3,
    ['concat', ['var', 'average'], '-teacup-30'],
    0.35,
    ['concat', ['var', 'average'], '-teacup-35'],
    0.4,
    ['concat', ['var', 'average'], '-teacup-40'],
    0.45,
    ['concat', ['var', 'average'], '-teacup-45'],
    0.5,
    ['concat', ['var', 'average'], '-teacup-50'],
    0.55,
    ['concat', ['var', 'average'], '-teacup-55'],
    0.6,
    ['concat', ['var', 'average'], '-teacup-60'],
    0.65,
    ['concat', ['var', 'average'], '-teacup-65'],
    0.7,
    ['concat', ['var', 'average'], '-teacup-70'],
    0.75,
    ['concat', ['var', 'average'], '-teacup-75'],
    0.8,
    ['concat', ['var', 'average'], '-teacup-80'],
    0.85,
    ['concat', ['var', 'average'], '-teacup-85'],
    0.9,
    ['concat', ['var', 'average'], '-teacup-90'],
    0.95,
    ['concat', ['var', 'average'], '-teacup-95'],
    1.0,
    ['concat', ['var', 'average'], '-teacup-100'],
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
    'https://cache.wwdh.internetofwater.app/collections/rise-edr/locations?f=json&parameter-name=reservoirStorage&limit=10000';

/**
 *
 * @constant
 */
export const ResVizEDRReservoirSource =
    'https://cache.wwdh.internetofwater.app/collections/resviz-edr/locations?f=json';

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
    //     regionConnectorProperty: RiseReservoirField.LocationUnifiedRegionNames,
    //     connectedLayers: [
    //         LayerId.RiseEDRReservoirs,
    //         SubLayerId.RiseEDRReservoirLabels,
    //     ],
    //     params: {
    //         'parameter-name': 'reservoirStorage',
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
        regionConnectorProperty: ResvizReservoirField.DoiRegionName,
        connectedLayers: [
            LayerId.ResvizEDRReservoirs,
            SubLayerId.ResvizEDRReservoirLabels,
        ],

        // params: {
        //     'parameter-name': 'raw', // TODO: replace once ontology gets made for resviz
        // },
    },
];

export const BaseLayerOpacity = 0.7;

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
