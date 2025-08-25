/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
  IQueryFeaturesOptions,
  queryFeatures,
} from "@esri/arcgis-rest-feature-service";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

type WhereObject = {
  [key: string | number]: string | number;
};

export class EsriService {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  private objectToQueryString(object: WhereObject) {
    return Object.entries(object)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(", ");
  }

  getFeatures(
    signal: AbortSignal,
    where?: WhereObject,
  ): Promise<FeatureCollection<Geometry, GeoJsonProperties>> {
    const options: IQueryFeaturesOptions = {
      url: this.url,
      signal,
      f: "geojson",
    };

    if (where) {
      options.where = this.objectToQueryString(where);
    }

    return queryFeatures(options) as Promise<
      FeatureCollection<Geometry, GeoJsonProperties>
    >;
  }
}
