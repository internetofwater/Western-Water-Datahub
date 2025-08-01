/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export enum ResvizReservoirField {
    MaxCapacity = 'max_capacity',
    MonitoringLocationId = 'monitoring_location_id',
    MonitoringLocationName = 'monitoring_location_name',
    SiteName = 'site_name',
    DoiRegionNum = 'doi_region_num',
    DoiRegionName = 'doi_region_name',
    Huc06 = 'huc06',
    Huc08 = 'huc08',
    State = 'state',

    Storage = 'raw',
    TenthPercentile = 'p10',
    NinetiethPercentile = 'p90',
    StorageAverage = 'avg',
    StorageDate = 'storage_date',
}

export type ResvizReservoirProperties = {
    [ResvizReservoirField.MaxCapacity]: number;
    [ResvizReservoirField.MonitoringLocationId]: number;
    [ResvizReservoirField.MonitoringLocationName]: string;
    [ResvizReservoirField.SiteName]: string;
    [ResvizReservoirField.DoiRegionNum]: number;
    [ResvizReservoirField.DoiRegionName]: string;
    [ResvizReservoirField.Huc06]: number;
    [ResvizReservoirField.Huc08]: number;
    [ResvizReservoirField.State]: string;
    [ResvizReservoirField.Storage]?: number;
    [ResvizReservoirField.TenthPercentile]?: number;
    [ResvizReservoirField.NinetiethPercentile]?: number;
    [ResvizReservoirField.StorageAverage]?: number;
    [ResvizReservoirField.StorageDate]?: string;
};
