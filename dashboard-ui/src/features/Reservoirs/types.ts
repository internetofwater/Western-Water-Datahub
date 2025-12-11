/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ComboboxItem } from '@mantine/core';
import { Feature, Point } from 'geojson';

export type Option = ComboboxItem & {
    id: number;
};

export enum SortBy {
    Capacity = 'capacity',
    Storage = 'storage',
    PercentFull = 'percent-full',
    PercentAverage = 'percent-average',
}

export type SortOrder = 'asc' | 'desc';

export type OrganizedProperties = {
    identifier: string | number;
    name: string;
    dateMeasured: string;
    capacity: number;
    storage: number;
    percentFull: number;
    percentAverage: number;
    regionConnector: string;
    basinConnector: string;
    stateConnector: string;
    sourceId: string;
};

export type OrganizedFeature = Feature<Point, OrganizedProperties>;
