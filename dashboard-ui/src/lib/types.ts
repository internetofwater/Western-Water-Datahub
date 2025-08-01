import { SourceId } from '@/features/Map/consts';
import { FeatureCollection, Point, GeoJsonProperties } from 'geojson';

export enum Tools {
    BasemapSelector = 'basemap-selector',
    Print = 'print',
    Controls = 'controls',
    Legend = 'legend',
}

export type ReservoirCollections = {
    [key in SourceId]?: FeatureCollection<Point, GeoJsonProperties>;
};

export type Reservoir = {
    identifier: string | number;
    source: string;
};

export enum BoundingGeographyLevel {
    Region = 'region',
    Basin = 'basin',
    State = 'state',
}
