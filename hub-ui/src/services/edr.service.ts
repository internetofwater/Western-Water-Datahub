/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ILink, IRequestParams, Service, TRequestMethods } from '@ogcapi-js/shared';
import { BBox, GeoJSON } from 'geojson';
import { request } from '@/utils/request';

/**
 * configuration for a OGC EDR API service
 */
// export interface IEDRServiceConfig extends IServiceConfig {}

export interface IServiceRequestOptions<T = IRequestParams> {
  /**
   * Abort signal passed to fetch.
   */
  signal?: AbortSignal;
  /**
   * Additional request parameters.
   */
  params?: T;
  method?: TRequestMethods;

  /**
   * Headers for the request.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: { [key: string]: any };
}

export interface IGetCollectionsParams {
  /**
   * Only features that have a geometry that intersects the bounding box are selected. The bounding box is provided as four or six numbers, depending on whether the coordinate reference system includes a vertical axis (height or depth). [lowerLeft, lowerRight, minValue (optional), upperRight, upperLeft, maxValue (optional)]
   */
  bbox?: BBox;
  /**
   * Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   */
  datetime?: string;
  /**
   * Format of the response.
   */
  f?: string;
  skipGeometry?: boolean;
  limit?: number;
  ['parameter-name']?: string;
  ['provider-name']?: string;
}

export interface IDataQueryParams {
  /**
   * Zoom level.
   */
  z?: string;
  /**
   * Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   */
  datetime?: string;
  /**
   * Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   */
  ['parameter-name']?: string;
  /**
   * Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   */
  crs?: string;
  /**
   * Format of the response.
   */
  f?: string;
  limit?: number;
}

export interface IGetPositionParams extends IDataQueryParams {
  /**
   * A 2D WKT Polygon defining the search area for intersecting geometries. Coordinates within the WKT are expected to be of the CRS provided (defaults to WGS85).
   */
  coords: string;
}

export interface IGetRadiusParams extends IDataQueryParams {
  /**
   * Location(s) to return data for, the coordinates are defined by a Well Known Text (wkt) string to retrieve a single location : POINT(x y). Coordinates are expected to be in
   */
  coords: string;
  /**
   * Defines radius of area around defined coordinates to include in the data selection
   */
  within: number;
  /**
   * Distance units for the within parameter
   */
  ['within-units']: string;
}

export interface IGetAreaParams extends IDataQueryParams {
  /**
   * Coordinates for the area query.
   */
  coords: string;
  /**
   * Resolution in the x direction.
   */
  ['resolution-x']?: string[];
  /**
   * Resolution in the y direction.
   */
  ['resolution-y']?: string[];
}

export interface IGetCubeParams extends IDataQueryParams {
  /**
   * Bounding box for the cube query.
   */
  bbox?: BBox;
}

export interface IGetTrajectoryParams extends IDataQueryParams {
  /**
   * Coordinates for the trajectory query.
   */
  coords: string;
}

export interface IGetCorridorParams extends IDataQueryParams {
  /**
   * Coordinates for the corridor query.
   */
  coords: string;
  /**
   * Resolution in the x direction.
   */
  ['resolution-x']?: string[];
  /**
   * Resolution in the y direction.
   */
  ['resolution-y']?: string[];
  /**
   * Units for the width of the corridor.
   */
  ['width-units']: string;
  /**
   * Height of the corridor.
   */
  ['corridor-height']: string;
  /**
   * Units for the height of the corridor.
   */
  ['height-units']: string;
}

// Note bbox is not supported by most edr implementations
export type IGetLocationParams = Omit<IDataQueryParams, 'z'> & { bbox?: BBox };

/**
 * Determines the return type based on the format.
 * - If the format is "text/html" or "application/x-netcdf", the return type is string.
 * - If the format is "application/json", the return type is JSON.
 * - If the format is "application/prs.coverage+json", the return type is CoverageJSON.
 * - If the format is "application/geo+json", the return type is GeoJSON.
 * - For other formats, the return type is unknown.
 */
// type ReturnType<T> = T extends 'text/html' | 'application/x-netcdf'
//     ? string
//     : T extends 'application/json'
//     ? JSON
//     : T extends 'application/prs.coverage+json'
//     ? CoverageJSON
//     : T extends 'application/geo+json'
//     ? GeoJSON
//     : unknown;

/**
 * Default options for the service requests.
 */
const DEFAULT_OPTIONS = { headers: { Accept: 'application/json' } };

export class EDRService extends Service {
  /**
   * Get a list of feature collections.
   * @param options Options for the request.
   * @description Uses `IServiceRequestOptions<IGetCollectionsParams>` where `IGetCollectionsParams` includes:
   * - `bbox`: Only features that have a geometry that intersects the bounding box are selected. The bounding box is provided as four or six numbers, depending on whether the coordinate reference system includes a vertical axis (height or depth). [lowerLeft, lowerRight, minValue (optional), upperRight, upperLeft, maxValue (optional)]
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `f`: Format of the response.
   */
  async getCollections(
    options: IServiceRequestOptions<IGetCollectionsParams> = DEFAULT_OPTIONS
  ): Promise<IGetCollectionsResponse> {
    const url: string = `${this.baseUrl}/collections`;
    const params: IGetCollectionsParams = { ...options.params };
    const result = await request<IGetCollectionsResponse>({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get a feature collection by ID.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @description Uses `IServiceRequestOptions<{ f?: string }>` where the parameter includes:
   * - `f`: Format of the response.
   */
  async getCollection(
    collectionId: string,
    options: IServiceRequestOptions<{ f?: string }> = DEFAULT_OPTIONS
  ): Promise<ICollection> {
    const url: string = `${this.baseUrl}/collections/${collectionId}`;
    const params = { ...options.params };
    const result: ICollection = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get instances of a feature collection.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @description Uses `IServiceRequestOptions<{ f?: string }>` where the parameter includes:
   * - `f`: Format of the response.
   */
  async getInstances(
    collectionId: string,
    options: IServiceRequestOptions<{ f?: string }> = DEFAULT_OPTIONS
  ): Promise<IInstance> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances`;
    const params = { ...options.params };
    const result: IInstance = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific position.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetPositionParams>` where `IGetPositionParams` includes:
   * - `coords`: A 2D WKT Polygon defining the search area for intersecting geometries. Coordinates within the WKT are expected to be of the CRS provided (defaults to WGS85).
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getPosition<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    options: IServiceRequestOptions<IGetPositionParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/position`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data within a specific radius.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetRadiusParams>` where `IGetRadiusParams` includes:
   * - `coords`: Location(s) to return data for, the coordinates are defined by a Well Known Text (wkt) string to retrieve a single location : POINT(x y). Coordinates are expected to be in
   * - `within`: Defines radius of area around defined coordinates to include in the data selection
   * - `within-units`: Distance units for the within parameter
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getRadius<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    options: IServiceRequestOptions<IGetRadiusParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/radius`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific area.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetAreaParams>` where `IGetAreaParams` includes:
   * - `coords`: Coordinates for the area query.
   * - `resolution-x`: Resolution in the x direction.
   * - `resolution-y`: Resolution in the y direction.
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getArea<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    options: IServiceRequestOptions<IGetAreaParams> = DEFAULT_OPTIONS
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/area`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific cube.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetCubeParams>` where `IGetCubeParams` includes:
   * - `bbox`: Bounding box for the cube query.
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getCube<T extends CoverageJSON | CoverageCollection | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    options: IServiceRequestOptions<IGetCubeParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/cube`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific trajectory.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetTrajectoryParams>` where `IGetTrajectoryParams` includes:
   * - `coords`: Coordinates for the trajectory query.
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getTrajectory<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    options: IServiceRequestOptions<IGetTrajectoryParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/trajectory`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific corridor.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetCorridorParams>` where `IGetCorridorParams` includes:
   * - `coords`: Coordinates for the corridor query.
   * - `resolution-x`: Resolution in the x direction.
   * - `resolution-y`: Resolution in the y direction.
   * - `width-units`: Units for the width of the corridor.
   * - `corridor-height`: Height of the corridor.
   * - `height-units`: Units for the height of the corridor.
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getCorridor<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    options: IServiceRequestOptions<IGetCorridorParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/corridor`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get items from a feature collection.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @returns Data in the specified format (JSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetCollectionsParams>` where `IGetCollectionsParams` includes:
   * - `bbox`: Only features that have a geometry that intersects the bounding box are selected. The bounding box is provided as four or six numbers, depending on whether the coordinate reference system includes a vertical axis (height or depth). [lowerLeft, lowerRight, minValue (optional), upperRight, upperLeft, maxValue (optional)]
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `f`: Format of the response.
   */
  async getItems<T extends JSON | GeoJSON | string = GeoJSON>(
    collectionId: string,
    options: IServiceRequestOptions<IGetCollectionsParams> = DEFAULT_OPTIONS,
    next?: string
  ): Promise<T> {
    const url: string = next ?? `${this.baseUrl}/collections/${collectionId}/items`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get a specific item from a feature collection.
   * @param collectionId ID of the collection.
   * @param itemId ID of the item.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   */
  async getItem<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    itemId: string,
    options: IServiceRequestOptions<IGetCollectionsParams> = DEFAULT_OPTIONS
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/items/${itemId}`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get locations from a feature collection.
   * @param collectionId ID of the collection.
   * @param options Options for the request.
   * @returns Data in the specified format (JSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetCollectionsParams>` where `IGetCollectionsParams` includes:
   * - `bbox`: Only features that have a geometry that intersects the bounding box are selected. The bounding box is provided as four or six numbers, depending on whether the coordinate reference system includes a vertical axis (height or depth). [lowerLeft, lowerRight, minValue (optional), upperRight, upperLeft, maxValue (optional)]
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `f`: Format of the response.
   */
  async getLocations<T extends JSON | GeoJSON | string = GeoJSON>(
    collectionId: string,
    options: IServiceRequestOptions<IGetLocationParams> = DEFAULT_OPTIONS,
    next?: string
  ): Promise<T> {
    const url: string = next ?? `${this.baseUrl}/collections/${collectionId}/locations`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get a specific location from a feature collection.
   * @param collectionId ID of the collection.
   * @param locId ID of the location.
   * @param options Options for the request.
   * @returns Data in the specified format (JSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetLocationParams>` where `IGetLocationParams` includes:
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getLocation<
    T extends JSON | GeoJSON | CoverageJSON | CoverageCollection | string = GeoJSON,
  >(
    collectionId: string,
    locId: string,
    options: IServiceRequestOptions<IGetLocationParams> = DEFAULT_OPTIONS
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/locations/${locId}`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });

    return result;
  }

  /**
   * Get data for a specific position within an instance.
   * @param collectionId ID of the collection.
   * @param instanceId ID of the instance.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetPositionParams>` where `IGetPositionParams` includes:
   * - `coords`: A 2D WKT Polygon defining the search area for intersecting geometries. Coordinates within the WKT are expected to be of the CRS provided (defaults to WGS85).
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getInstancePosition<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    instanceId: string,
    options: IServiceRequestOptions<IGetPositionParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances/${instanceId}/position`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data within a specific radius within an instance.
   * @param collectionId ID of the collection.
   * @param instanceId ID of the instance.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetRadiusParams>` where `IGetRadiusParams` includes:
   * - `coords`: Location(s) to return data for, the coordinates are defined by a Well Known Text (wkt) string to retrieve a single location : POINT(x y). Coordinates are expected to be in
   * - `within`: Defines radius of area around defined coordinates to include in the data selection
   * - `within-units`: Distance units for the within parameter
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getInstanceRadius<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    instanceId: string,
    options: IServiceRequestOptions<IGetRadiusParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances/${instanceId}/radius`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific area within an instance.
   * @param collectionId ID of the collection.
   * @param instanceId ID of the instance.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetAreaParams>` where `IGetAreaParams` includes:
   * - `coords`: Coordinates for the area query.
   * - `resolution-x`: Resolution in the x direction.
   * - `resolution-y`: Resolution in the y direction.
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getInstanceArea<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    instanceId: string,
    options: IServiceRequestOptions<IGetAreaParams> = DEFAULT_OPTIONS
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances/${instanceId}/area`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific cube within an instance.
   * @param collectionId ID of the collection.
   * @param instanceId ID of the instance.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetCubeParams>` where `IGetCubeParams` includes:
   * - `bbox`: Bounding box for the cube query.
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getInstanceCube<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    instanceId: string,
    options: IServiceRequestOptions<IGetCubeParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances/${instanceId}/cube`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific trajectory within an instance.
   * @param collectionId ID of the collection.
   * @param instanceId ID of the instance.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetTrajectoryParams>` where `IGetTrajectoryParams` includes:
   * - `coords`: Coordinates for the trajectory query.
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getInstanceTrajectory<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    instanceId: string,
    options: IServiceRequestOptions<IGetTrajectoryParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances/${instanceId}/trajectory`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get data for a specific corridor within an instance.
   * @param collectionId ID of the collection.
   * @param instanceId ID of the instance.
   * @param options Options for the request.
   * @returns Data in the specified format (CoverageJSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetCorridorParams>` where `IGetCorridorParams` includes:
   * - `coords`: Coordinates for the corridor query.
   * - `resolution-x`: Resolution in the x direction.
   * - `resolution-y`: Resolution in the y direction.
   * - `width-units`: Units for the width of the corridor.
   * - `corridor-height`: Height of the corridor.
   * - `height-units`: Units for the height of the corridor.
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getInstanceCorridor<T extends CoverageJSON | GeoJSON | string = CoverageJSON>(
    collectionId: string,
    instanceId: string,
    options: IServiceRequestOptions<IGetCorridorParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances/${instanceId}/corridor`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get locations within an instance.
   * @param collectionId ID of the collection.
   * @param instanceId ID of the instance.
   * @param options Options for the request.
   * @returns Data in the specified format (JSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetCollectionsParams>` where `IGetCollectionsParams` includes:
   * - `bbox`: Only features that have a geometry that intersects the bounding box are selected. The bounding box is provided as four or six numbers, depending on whether the coordinate reference system includes a vertical axis (height or depth). [lowerLeft, lowerRight, minValue (optional), upperRight, upperLeft, maxValue (optional)]
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `f`: Format of the response.
   */
  async getInstanceLocations<T extends JSON | GeoJSON | string = GeoJSON>(
    collectionId: string,
    instanceId: string,
    options: IServiceRequestOptions<IGetCollectionsParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances/${instanceId}/locations`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }

  /**
   * Get a specific location within an instance.
   * @param collectionId ID of the collection.
   * @param instanceId ID of the instance.
   * @param locId ID of the location.
   * @param options Options for the request.
   * @returns Data in the specified format (JSON, GeoJSON, or string).
   * @description Uses `IServiceRequestOptions<IGetLocationParams>` where `IGetLocationParams` includes:
   * - `datetime`: Either a date-time or an interval. Date and time expressions adhere to RFC 3339. Intervals are separated by a forward-slash ('start/end') and may be bounded or half-bounded (double-dots at start or end).
   * - `parameter-name`: Comma delimited list of parameters to retrieve data for. Valid parameters are listed in the collections metadata
   * - `crs`: Identifier (id) of the coordinate system to return data in list of valid crs identifiers for the chosen collection are defined in the metadata responses. If not supplied the coordinate reference system will default to WGS84.
   * - `f`: Format of the response.
   */
  async getInstanceLocation<T extends JSON | GeoJSON | string = GeoJSON>(
    collectionId: string,
    instanceId: string,
    locId: string,
    options: IServiceRequestOptions<IGetLocationParams> = {}
  ): Promise<T> {
    const url: string = `${this.baseUrl}/collections/${collectionId}/instances/${instanceId}/locations/${locId}`;
    const params = { ...options.params };
    const result: T = await request({
      url,
      params,
      method: options.method,
      signal: options.signal,
      headers: options.headers,
    });
    return result;
  }
}
/**
 * spatial extent of the information
 */
export interface IExtentSpatial {
  /**
   * one or more bounding boxes that describe the spatial extent
   */
  bbox: BBox;

  /**
   * coordinate reference system of the coordinates in the spatial extent
   */
  crs: string;

  /**
   * name of the vertical coordinate reference system
   */
  name?: string;
}

/**
 *
 */
export interface IExtentTemporal {
  /**
   *
   */
  interval: [string | null, string | null][];

  /**
   *
   */
  values?: string[][];

  /**
   *
   */
  trs: string;

  /**
   *
   */
  name?: string;
}

/**
 *
 */
export interface IExtentVertical {
  /**
   *
   */
  interval: string[][];

  /**
   *
   */
  values?: string[][];

  /**
   *
   */
  vrs: string;

  /**
   *
   */
  name?: string;
}

/**
 * extent of the information in the collection
 */
export interface IExtent {
  /**
   * 	the spatial extent of the information in the collection
   */
  spatial?: IExtentSpatial;

  /**
   *
   */
  temporal?: IExtentTemporal;

  /**
   *
   */
  vertical?: IExtentVertical;
}

/**
 *
 */
export interface IDataQueries {
  /**
   *
   */
  position?: { link: ILink };

  /**
   *
   */
  radius?: { link: ILink };

  /**
   *
   */
  area?: { link: ILink };

  /**
   *
   */
  cube?: { link: ILink };

  /**
   *
   */
  trajectory?: { link: ILink };

  /**
   *
   */
  corridor?: { link: ILink };

  /**
   *
   */
  locations?: { link: ILink };

  /**
   *
   */
  items?: { link: ILink };
}

/**
 *
 */
export interface IInstance {
  /**
   *
   */
  links: ILink[];

  /**
   *
   */
  instances: ICollection[];
}

export interface ParameterName {
  id: string;
  type: 'Parameter';
  name: string;
  observedProperty: {
    label: {
      id: string;
      en: string;
    };
  };
  unit: {
    label?: {
      en: string;
    };
    symbol: {
      value: string;
      type: string; // e.g., "http://www.opengis.net/def/uom/UCUM/"
    };
  };
}

export interface ParameterGroup {
  type: 'ParameterGroup';
  id: string;
  label: string;
  observedProperty: {
    id: string;
    label: {
      en: string;
    };
  };
  members: {
    [source: string]: string[];
  };
}

/**
 * collection metadata
 */
export interface ICollection {
  /**
   * identifier of the collection used, for example, in URIs
   */
  id: string;

  /**
   * human readable title of the collection
   */
  title?: string;

  /**
   * a description of the features in the collection
   */
  description?: string;

  /**
   * indicator about the type of the items in the collection (the default value is 'feature')
   */
  itemType?: string;

  /**
   * links
   */
  links: ILink[];

  /**
   * the list of CRS identifiers supported by the service
   */
  crs?: string[];

  /**
   * list of keywords which help to describe the collection
   */
  keywords?: string[];

  /**
   *
   */
  extent: IExtent;

  /**
   *
   */
  data_queries: IDataQueries;

  /**
   *
   */
  output_formats: string[];

  /**
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameter_names: Record<string, ParameterName>;
}

/**
 * response for the get collections request
 */
export interface IGetCollectionsResponse {
  /**
   * collections
   */
  collections: ICollection[];

  /**
   * links
   */
  links: ILink[];

  parameterGroups: ParameterGroup[];
}

export type CoverageCollection = {
  type: 'CoverageCollection';
  parameters: {
    [key: string]: {
      type: 'Parameter';
      description: {
        en: string;
      };
      unit: {
        symbol: string;
      };
      observedProperty: {
        id: string;
        label: {
          en: string;
        };
      };
    };
  };
  referencing: Array<{
    coordinates: string[];
    system: {
      type: string;
      id?: string;
      cs?: {
        csAxes: Array<{
          name: {
            en: string;
          };
          direction: string;
          unit: {
            symbol: string;
          };
        }>;
      };
      calendar?: string;
    };
  }>;
  coverages: CoverageJSON[];
};

export type CoverageAxesSegments = {
  start: number;
  stop: number;
  num: number;
};
export type CoverageAxesValues = {
  values: (number | string)[];
};

export interface CoverageJSON {
  type: string;
  domain: {
    type: string;
    domainType: string;

    axes: {
      [key: string]: CoverageAxesSegments | CoverageAxesValues;
    };

    referencing: {
      coordinates: string[];
      system: {
        type: string;
        id: string;
      };
    }[];
  };
  parameters: {
    [key: string]: {
      type: string;
      observedProperty: {
        id: string;
        label: {
          en: string;
        };
      };
      unit: {
        label: {
          en: string;
        };
        symbol: string;
      };
    };
  };
  ranges: {
    [key: string]: {
      type: string;
      values: number[];
    };
  };
}

export interface ICategory {
  id: string;
  label: { [key: string]: string };
  description?: { [key: string]: string };
}

export interface IUnit {
  id?: string;
  label?: { [key: string]: string };
  symbol?: { [key: string]: string | { type: string; value: string } };
}

export interface IObservedProperty {
  id?: string;
  label: { [key: string]: string };
  description?: { [key: string]: string };
  categories?: ICategory;
}

export interface IGeojsonParameters {
  id?: string;
  type: 'Parameter';
  description?: { [key: string]: string };
  unit?: IUnit;
  categoryEncoding?: { [key: string]: number | number[] };
}

export type IGeoJSON = GeoJSON & {
  parameters?: IGeojsonParameters;
  links?: ILink[];
  timestamp: string;
  numberMatched: number;
  numberReturned: number;
};
