export enum SnotelField {
    BeginDate = 'beginDate',
    CountyName = 'countyName',
    DataTimeZone = 'dataTimeZone',
    DcoCode = 'dcoCode',
    Elevation = 'elevation',
    EndDate = 'endDate',
    ForecastPoint = 'forecastPoint',
    Huc = 'huc',
    Name = 'name',
    NetworkCode = 'networkCode',
    PedonCode = 'pedonCode',
    ReservoirMetadata = 'reservoirMetadata',
    ShefId = 'shefId',
    StateCode = 'stateCode',
    StationElements = 'stationElements',
    StationId = 'stationId',
    StationTriplet = 'stationTriplet',
}

export type SnotelProperties = {
    [SnotelField.BeginDate]: string;
    [SnotelField.CountyName]: string;
    [SnotelField.DataTimeZone]: number;
    [SnotelField.DcoCode]: string;
    [SnotelField.Elevation]: number;
    [SnotelField.EndDate]: string;
    [SnotelField.ForecastPoint]: null; // replace nulls if necessary
    [SnotelField.Huc]: string;
    [SnotelField.Name]: string;
    [SnotelField.NetworkCode]: string;
    [SnotelField.PedonCode]: null;
    [SnotelField.ReservoirMetadata]: null;
    [SnotelField.ShefId]: string;
    [SnotelField.StateCode]: string;
    [SnotelField.StationElements]: null;
    [SnotelField.StationId]: string;
    [SnotelField.StationTriplet]: string;
    [SnotelHucMeansField.SnowpackTempRelative]?: number; // appended field
};

export enum SnotelHucMeansField {
    Fid = 'fid',
    GnisId = 'gnis_id',
    GnisUrl = 'gnis_url',
    LoadDate = 'loaddate',
    Name = 'name',
    SnowpackTempRelative = 'snowpack_water_temp_avg_relative_to_thirty_year_avg',
    Uri = 'uri',
}

export type SnotelHucMeansProperties = {
    [SnotelHucMeansField.Fid]: number;
    [SnotelHucMeansField.GnisId]: string | null;
    [SnotelHucMeansField.GnisUrl]: string;
    [SnotelHucMeansField.LoadDate]: string; // ISO date string
    [SnotelHucMeansField.Name]: string;
    [SnotelHucMeansField.SnowpackTempRelative]: number;
    [SnotelHucMeansField.Uri]: string;
};
