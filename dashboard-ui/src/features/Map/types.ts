/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

/**
 *
 * @interface
 */
export interface RegionProperties {
    Interior: string;
    LABEL: string;
    MAPTIP: string;
    OBJECTID_1: number;
    REGION: string;
}

/**
 *
 * @type
 */
type PropertiesBase = {
    _id: number;
    createDate: string;
    elevation: number;
    locationName: string;
    locationStatusId: number;
    locationTypeName: string;
    name: string;
    timezone: string;
    timezoneName: string;
    timezoneOffset: number;
    updateDate: string;
    ['Active Capacity']: number;
    ['Asset Name (in tessel)']: string;
    ['Dead Capacity']: number;
    ['Dead Capacity Elevation']: number;
    ['Inactive Capacity Elevation']: number;
    ['Live Capcity']: number;
    ['Maximum Water Surface Elevation']: number;
    ['Surcharge Capacity']: number;
    ['Total Capacity']: number;
    ['Total Capacity Elevation']: number;
    ['Total Capacity Surface Area']: number;
};

/**
 *
 * @type
 */
export type ReservoirPropertiesRaw = PropertiesBase & {
    horizontalDatum: string;
    locationRegionNames: string;
    locationTags: string;
    locationUnifiedRegionNames: string;
    projectNames: string;
    verticalDatum: string;
};

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
export const ReservoirIdentifierField = 'name';
/**
 *
 * @constant
 */
export const ReservoirRegionConnectorField = 'locationRegionNames';

/**
 *
 * @type
 */
export type ReservoirProperties = PropertiesBase & {
    horizontalDatum: { _id: string; definition: string | null };
    locationRegionNames: string[];
    locationTags: { id: number; tag: string; createDate: string }[];
    locationUnifiedRegionNames: string[];
    projectNames: string[];
    verticalDatum: { _id: string; definition: string | null };
    activeCapacity: number;
    assetName: string;
};
