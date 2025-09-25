/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export enum Huc02BasinField {
    Id = 'id', // Id field is appended in vector tile layer, not items
    GnisUrl = 'gnis_url',
    Uri = 'uri',
    GnisId = 'gnis_id',
    Name = 'name',
    Fid = 'fid',
    LoadDate = 'loaddate',
}

export type Huc06BasinProperties = {
    [Huc02BasinField.Id]: number;
    [Huc02BasinField.GnisUrl]: string;
    [Huc02BasinField.Uri]: string;
    [Huc02BasinField.GnisId]: string | null;
    [Huc02BasinField.Name]: string;
    [Huc02BasinField.Fid]: number;
    [Huc02BasinField.LoadDate]: string; // ISO 8601 date string
};
