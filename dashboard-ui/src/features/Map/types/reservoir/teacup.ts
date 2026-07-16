/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export enum TeacupReservoirField {
    Id = 'id',
    Name = 'name',
    MapLabel = 'map_label',
    PopupLabel = 'popup_label',
    TotalCapacity = 'total_capacity',
    ActiveCapacity = 'active_capacity',
    CapacityValue = 'capacity_value',
    Huc06 = 'huc6',
    Huc12 = 'huc12',
    RegionName = 'reg_name',
    RegionId = 'reg_num',
    ManagingRegionAbbreviation = 'mng_reg_abbr',
    State = 'state',
    Source = 'source_uri',
    UseTotalOrActiveStorage = 'storage_capacity_label',
    ReservoirNotes = 'reservoir_notes',

    Capacity = 'capacity',
    Storage = 'raw',
    TenthPercentile = 'p10',
    NinetiethPercentile = 'p90',
    StorageAverage = 'avg',
    StorageDate = 'storage_date',
    Huc02 = 'huc02', // Clientside property for easier filtering by huc02
    Item = 'item', // Clientside property to determine if this res is a location
}

export type TeacupReservoirProperties = {
    [TeacupReservoirField.Id]: string;
    [TeacupReservoirField.Name]: string;
    [TeacupReservoirField.MapLabel]: string;
    [TeacupReservoirField.PopupLabel]: string;
    [TeacupReservoirField.TotalCapacity]: number;
    [TeacupReservoirField.ActiveCapacity]: number;
    [TeacupReservoirField.CapacityValue]: number;
    [TeacupReservoirField.Huc06]: number;
    [TeacupReservoirField.Huc12]: number;
    [TeacupReservoirField.RegionName]: string;
    [TeacupReservoirField.RegionId]: number;
    [TeacupReservoirField.ManagingRegionAbbreviation]: string;
    [TeacupReservoirField.State]: string;
    [TeacupReservoirField.Source]: string;
    [TeacupReservoirField.UseTotalOrActiveStorage]: string;

    [TeacupReservoirField.Capacity]?: number;
    [TeacupReservoirField.Storage]?: number;
    [TeacupReservoirField.TenthPercentile]?: number;
    [TeacupReservoirField.NinetiethPercentile]?: number;
    [TeacupReservoirField.StorageAverage]?: number;
    [TeacupReservoirField.StorageDate]?: string;
    [TeacupReservoirField.Huc02]?: number;
};
