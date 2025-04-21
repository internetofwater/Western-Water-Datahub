/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export interface RegionProperties {
    Interior: string;
    LABEL: string;
    MAPTIP: string;
    OBJECTID_1: number;
    REGION: string;
}

export type RawReservoirProperties = {
    createDate: string;
    elevation: number;
    horizontalDatum: string;
    locationName: string;
    locationRegionNames: string;
    locationStatusId: number;
    locationTags: string;
    locationTypeName: string;
    locationUnifiedRegionNames: string;
    name: string;
    projectNames: string;
    timezone: string;
    timezoneName: string;
    timezoneOffset: number;
    updateDate: string;
    verticalDatum: string;
};

export const ComplexReservoirProperties = [
    'horizontalDatum',
    'locationRegionNames',
    'locationTags',
    'locationUnifiedRegionNames',
    'projectNames',
    'verticalDatum',
];

export const ReservoirIdentifierField = 'name';
export const ReservoirRegionConnectorField = 'locationRegionNames';

export type ReservoirProperties = {
    createDate: string;
    elevation: number;
    horizontalDatum: { _id: string; definition: string | null };
    locationName: string;
    locationRegionNames: string[];
    locationStatusId: number;
    locationTags: { id: number; tag: string; createDate: string }[];
    locationTypeName: string;
    locationUnifiedRegionNames: string[];
    name: string;
    projectNames: string[];
    timezone: string;
    timezoneName: string;
    timezoneOffset: number;
    updateDate: string;
    verticalDatum: { _id: string; definition: string | null };
};
