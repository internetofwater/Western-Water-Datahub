/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollectionType } from '@/utils/collection';

export enum CollectionId {
  RISEEdr = 'rise-edr',
  SNOTELEdr = 'snotel-edr',
  USACEEdr = 'usace-edr',
  Streamgages = 'usgs-sta',

  NWMChannelRouting = 'National_Water_Model_Channel_Routing_Output',
  NWMAssimilationSystem = 'National_Water_Model_Land_Data_Assimilation_System_Output',
  NWMReachToReach = 'National_Water_Data_Reach_to_Reach_Routing_Output',
  NWMLakeOutput = 'National_Water_Model_Lakeout',

  ArizonaWaterWells = 'ArizonaWaterWells',
  AWDB = 'awdb-forecasts-edr',

  NOAARFC = 'noaa-rfc',
}

export enum Provider {
  USBR = 'usbr',
  USDA = 'usda',
  USGS = 'usgs',
  USACE = 'usace',
  NOAA = 'noaa',
}

export const ProviderDatasources: Record<Provider, string[]> = {
  [Provider.USBR]: [CollectionId.RISEEdr],
  [Provider.USDA]: [CollectionId.SNOTELEdr],
  [Provider.USGS]: [CollectionId.Streamgages],
  [Provider.USACE]: [CollectionId.USACEEdr],
  [Provider.NOAA]: [],
};

export const idStoreProperty = 'id_store';

// These feature collections have feature identifiers not compatible with Mapbox
export const StringIdentifierCollections: string[] = [
  CollectionId.AWDB,
  CollectionId.ArizonaWaterWells,
  CollectionId.NWMLakeOutput,
  CollectionId.Streamgages,
  CollectionId.SNOTELEdr,
  CollectionId.NOAARFC,
];

// These collections have a locations edge but doesnt support bbox
export const ItemsOnlyCollections: string[] = [];

// Some collections support locations but the data size is too large to reasonably render
export const DatasourceCollectionType: Record<CollectionType, string[]> = {
  [CollectionType.EDRGrid]: [CollectionId.NWMChannelRouting],
  [CollectionType.EDR]: [],
  [CollectionType.Features]: [],
  [CollectionType.Map]: [],
  [CollectionType.Unknown]: [],
};

export enum RestrictionType {
  Size = 'size',
  Day = 'day',
  Parameter = 'parameter', // Limit number of parameters
  ParameterFirst = 'parameter-first', // Select a parameter before fetch
}

type RestrictionBase = {
  type: RestrictionType;
  message: string;
  noWarning?: boolean;
};

type SizeRestriction = RestrictionBase & {
  type: RestrictionType.Size;
  size: number;
};
type DayRestriction = RestrictionBase & {
  type: RestrictionType.Day;
  days: number;
};
type ParameterRestriction = RestrictionBase & {
  type: RestrictionType.Parameter;
  count: number;
};
type ParameterFirstRestriction = RestrictionBase & {
  type: RestrictionType.ParameterFirst;
};

export type Restiction =
  | SizeRestriction
  | DayRestriction
  | ParameterRestriction
  | ParameterFirstRestriction;

export const CollectionRestrictions: Record<string, Restiction[]> = {
  [CollectionId.ArizonaWaterWells]: [
    {
      type: RestrictionType.Size,
      size: 83700000000,
      message: "Draw a polygon that's roughly 1/4th of Arizona.",
    },
  ],
  [CollectionId.NWMAssimilationSystem]: [
    {
      type: RestrictionType.Size,
      size: 41900000000,
      message: "Draw a polygon that's roughly 1/8th of Arizona.",
    },
    {
      type: RestrictionType.Day,
      days: 1,
      message: 'Select a date range no greater than one day.',
    },
    {
      type: RestrictionType.Parameter,
      count: 1,
      message: 'Select only one parameter.',
    },
  ],
  [CollectionId.NWMReachToReach]: [
    {
      type: RestrictionType.Size,
      size: 41900000000,
      message: "Draw a polygon that's roughly 1/8th of Arizona.",
    },
    {
      type: RestrictionType.Day,
      days: 1,
      message: 'Select a date range no greater than one day.',
    },
    {
      type: RestrictionType.Parameter,
      count: 1,
      message: 'Select only one parameter.',
    },
  ],
  [CollectionId.NWMChannelRouting]: [
    {
      type: RestrictionType.Size,
      size: 41900000000,
      message: "Draw a polygon that's roughly 1/8th of Arizona.",
    },
    {
      type: RestrictionType.Day,
      days: 1,
      message: 'Select a date range no greater than one day.',
    },
    {
      type: RestrictionType.Parameter,
      count: 1,
      message: 'Select only one parameter.',
    },
  ],
  [CollectionId.NWMLakeOutput]: [
    {
      type: RestrictionType.Day,
      days: 7,
      message: 'Select a date range no greater than one week.',
    },
    {
      type: RestrictionType.Parameter,
      count: 1,
      message: 'Select only one parameter.',
    },
  ],
};
