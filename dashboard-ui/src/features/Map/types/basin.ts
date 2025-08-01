export enum Huc06BasinField {
    Id = 'id', // Id field is appended in vector tile layer, not items
    GnisUrl = 'gnis_url',
    Uri = 'uri',
    GnisId = 'gnis_id',
    Name = 'name',
    Fid = 'fid',
    LoadDate = 'loaddate',
}

export type Huc06BasinProperties = {
    [Huc06BasinField.Id]: number;
    [Huc06BasinField.GnisUrl]: string;
    [Huc06BasinField.Uri]: string;
    [Huc06BasinField.GnisId]: string | null;
    [Huc06BasinField.Name]: string;
    [Huc06BasinField.Fid]: number;
    [Huc06BasinField.LoadDate]: string; // ISO 8601 date string
};
