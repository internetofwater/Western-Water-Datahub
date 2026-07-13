/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfigId } from '@/features/Map/types';
import { FeatureCollection, Point, GeoJsonProperties } from 'geojson';

export enum Tools {
    BasemapSelector = 'basemap-selector',
    Print = 'print',
}

export type ReservoirCollections = Partial<
    Record<ReservoirConfigId, FeatureCollection<Point, GeoJsonProperties>>
>;

export type Reservoir = {
    identifier: string | number;
    source: string;
};

export enum BoundingGeographyLevel {
    Region = 'region',
    ManagingRegion = 'managing-region',
    Basin = 'basin',
    State = 'state',
    None = 'none',
}
