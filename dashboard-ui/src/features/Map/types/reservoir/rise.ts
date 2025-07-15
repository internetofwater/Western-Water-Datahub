export enum RiseReservoirField {
    Id = '_id',
    CreateDate = 'createDate',
    Elevation = 'elevation',
    LocationName = 'locationName',
    LocationStatusId = 'locationStatusId',
    LocationTypeName = 'locationTypeName',
    Name = 'name',
    Timezone = 'timezone',
    TimezoneName = 'timezoneName',
    TimezoneOffset = 'timezoneOffset',
    UpdateDate = 'updateDate',

    ActiveCapacity = 'Active Capacity',
    AssetNameInTessel = 'Asset Name (in tessel)',
    DeadCapacity = 'Dead Capacity',
    DeadCapacityElevation = 'Dead Capacity Elevation',
    InactiveCapacityElevation = 'Inactive Capacity Elevation',
    LiveCapacity = 'Live Capcity',
    MaxWaterSurfaceElevation = 'Maximum Water Surface Elevation',
    SurchargeCapacity = 'Surcharge Capacity',
    TotalCapacity = 'Total Capacity',
    TotalCapacityElevation = 'Total Capacity Elevation',
    TotalCapacitySurfaceArea = 'Total Capacity Surface Area',

    HorizontalDatum = 'horizontalDatum',
    LocationRegionNames = 'locationRegionNames',
    LocationTags = 'locationTags',
    LocationUnifiedRegionNames = 'locationUnifiedRegionNames',
    ProjectNames = 'projectNames',
    VerticalDatum = 'verticalDatum',
}

export type ReservoirPropertiesBase = {
    [RiseReservoirField.Id]: number;
    [RiseReservoirField.CreateDate]: string;
    [RiseReservoirField.Elevation]: number;
    [RiseReservoirField.LocationName]: string;
    [RiseReservoirField.LocationStatusId]: number;
    [RiseReservoirField.LocationTypeName]: string;
    [RiseReservoirField.Name]: string;
    [RiseReservoirField.Timezone]: string;
    [RiseReservoirField.TimezoneName]: string;
    [RiseReservoirField.TimezoneOffset]: number;
    [RiseReservoirField.UpdateDate]: string;

    [RiseReservoirField.ActiveCapacity]: number;
    [RiseReservoirField.AssetNameInTessel]: string;
    [RiseReservoirField.DeadCapacity]: number;
    [RiseReservoirField.DeadCapacityElevation]: number;
    [RiseReservoirField.InactiveCapacityElevation]: number;
    [RiseReservoirField.LiveCapacity]: number;
    [RiseReservoirField.MaxWaterSurfaceElevation]: number;
    [RiseReservoirField.SurchargeCapacity]: number;
    [RiseReservoirField.TotalCapacity]: number;
    [RiseReservoirField.TotalCapacityElevation]: number;
    [RiseReservoirField.TotalCapacitySurfaceArea]: number;
};

/**
 *
 * @type
 */
export type RiseReservoirPropertiesRaw = ReservoirPropertiesBase & {
    [RiseReservoirField.HorizontalDatum]: string;
    [RiseReservoirField.LocationRegionNames]: string;
    [RiseReservoirField.LocationTags]: string;
    [RiseReservoirField.LocationUnifiedRegionNames]: string;
    [RiseReservoirField.ProjectNames]: string;
    [RiseReservoirField.VerticalDatum]: string;
};

/**
 *
 * @type
 */
export type RiseReservoirProperties = ReservoirPropertiesBase & {
    [RiseReservoirField.HorizontalDatum]: {
        _id: string;
        definition: string | null;
    };
    [RiseReservoirField.LocationRegionNames]: string[];
    [RiseReservoirField.LocationTags]: {
        id: number;
        tag: string;
        createDate: string;
    }[];
    [RiseReservoirField.LocationUnifiedRegionNames]: string[];
    [RiseReservoirField.ProjectNames]: string[];
    [RiseReservoirField.VerticalDatum]: {
        _id: string;
        definition: string | null;
    };
};
