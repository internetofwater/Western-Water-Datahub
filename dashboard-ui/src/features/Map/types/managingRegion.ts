/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
export enum ManagingRegionField {
    ObjectId = 'OBJECTID_1',
    Name = 'managingregion',
    RegionAbbreviation = 'abbreviation',
    GlobalID = 'GlobalID',
}

export type ManagingRegionProperties = {
    [ManagingRegionField.ObjectId]: number;
    [ManagingRegionField.Name]: string;
    [ManagingRegionField.RegionAbbreviation]: string;
    [ManagingRegionField.GlobalID]: string;
};
