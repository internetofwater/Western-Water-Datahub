export enum Huc02Field {
  Id = 'id', // Id field is appended in vector tile layer, not items
  Fid = 'fid',
  Uri = 'uri',
  Name = 'name',
  GnisUrl = 'gnis_url',
  GnisId = 'gnis_id',
  LoadDate = 'loaddate',
}

export type Huc02BasinProperties = {
  [Huc02Field.Id]: number;
  [Huc02Field.GnisUrl]: string;
  [Huc02Field.Uri]: string;
  [Huc02Field.GnisId]: string | null;
  [Huc02Field.Name]: string;
  [Huc02Field.Fid]: number;
  [Huc02Field.LoadDate]: string; // ISO 8601 date string
};
