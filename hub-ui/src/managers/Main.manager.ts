/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import * as turf from "@turf/turf";
import { Feature, FeatureCollection, Point, Polygon } from "geojson";
import { GeoJSONSource, LngLatBoundsLike, Map } from "mapbox-gl";
import { GeoJSONFeature, stringify } from "wellknown";
import { StoreApi, UseBoundStore } from "zustand";
import { GeographyFilterSources } from "@/features/Map/consts";
import { SourceId } from "@/features/Map/sources";
import {
  getPointLayerDefinition,
  getPolygonLayerDefinition,
} from "@/features/Map/utils";
import geoconnexService from "@/services/init/geoconnex.init";
import wwdhService from "@/services/init/wwdh.init";
import { Collection, Location, MainState } from "@/stores/main/types";

type FakeCollection = {
  id: string;
  [key: string]: string;
};

/**
 *
 * @class
 */
class MainManager {
  private store: UseBoundStore<StoreApi<MainState>>;
  private map: Map | null = null;

  constructor(store: UseBoundStore<StoreApi<MainState>>) {
    this.store = store;
  }

  /**
   *
   * @function
   */
  private hasMap(): boolean {
    return Boolean(this.map);
  }

  /**
   *
   * @function
   */
  public setMap(map: Map): void {
    if (!this.hasMap()) {
      this.map = map;
    }
  }

  /**
   *
   * @function
   */
  public hasGeographyFilter(): boolean {
    return this.store.getState().hasGeographyFilter();
  }

  /**
   *
   * @function
   */
  public hasCollection(collectionId: Collection["id"]): boolean {
    return this.store.getState().hasCollection(collectionId);
  }

  /**
   *
   * @function
   */
  public hasLocation(locationId: Location["id"]): boolean {
    return this.store.getState().hasLocation(locationId);
  }

  /**
   *
   * @function
   */
  public async getData(
    collectionId: Collection["id"],
  ): Promise<FeatureCollection<Point>> {
    const geographyFilter = this.store.getState().geographyFilter;
    if (geographyFilter) {
      const feature = geographyFilter.feature as unknown as GeoJSONFeature;
      return this.getArea(collectionId, feature);
    }
    return this.getLocations(collectionId);
  }

  /**
   *
   * @function
   */
  private async getLocations(
    collectionId: Collection["id"],
  ): Promise<FeatureCollection<Point>> {
    return wwdhService.getLocations<FeatureCollection<Point>>(collectionId);
  }

  /**
   *
   * @function
   */
  private async getArea(
    collectionId: Collection["id"],
    feature: GeoJSONFeature,
  ): Promise<FeatureCollection<Point>> {
    const wkt = stringify(feature);

    return wwdhService.getArea<FeatureCollection<Point>>(collectionId, {
      method: "POST",
      params: {
        coords: wkt,
      },
    });
  }

  /**
   *
   * @function
   */
  public getSourceId(collectionId: Collection["id"]): string {
    return `${collectionId}-source`;
  }

  /**
   *
   * @function
   */
  public getLayerId(collectionId: Collection["id"]): string {
    return `${collectionId}-locations`;
  }

  /**
   *
   * @function
   */
  private async addMapSource(collectionId: Collection["id"]): Promise<string> {
    const sourceId = this.getSourceId(collectionId);
    if (this.map && !this.map.getSource(sourceId)) {
      const data = await this.getData(collectionId);
      this.map.addSource(sourceId, {
        type: "geojson",
        data,
      });
    }

    return sourceId;
  }

  /**
   *
   * @function
   */
  private async addMapLayer(
    collectionId: Collection["id"],
    sourceId: string,
  ): Promise<void> {
    const layerId = this.getLayerId(collectionId);
    if (this.map && !this.map.getLayer(layerId)) {
      this.map.addLayer(getPointLayerDefinition(layerId, sourceId));

      this.map.on("click", layerId, (e) => {
        const feature = this.map!.queryRenderedFeatures(e.point, {
          layers: [layerId],
        })?.[0];
        if (feature) {
          const locationId = feature.id;
          if (locationId) {
            if (this.hasLocation(locationId)) {
              this.store.getState().removeLocation(locationId);
            } else {
              this.store.getState().addLocation({
                id: locationId,
                collectionId,
              });
            }
          }
        }
      });

      this.map.on("mouseenter", layerId, () => {
        this.map!.getCanvas().style.cursor = "pointer";
      });
      this.map.on("mousemove", layerId, () => {
        this.map!.getCanvas().style.cursor = "pointer";
      });
      this.map.on("mouseleave", layerId, () => {
        this.map!.getCanvas().style.cursor = "";
      });
    }
  }

  /**
   *
   * @function
   */
  public async updateCollections(): Promise<void> {
    const collections = this.store.getState().collections;

    for (const collection of collections) {
      const collectionId = collection.id;
      const sourceId = await this.addMapSource(collectionId);
      this.addMapLayer(collectionId, sourceId);
    }
  }

  /**
   *
   * @function
   */
  public addCollection(collection: FakeCollection): void {
    const _collection: Collection = {
      id: collection.id,
      provider: "fake",
      category: "fake",
      dataset: "fake",
    };

    this.store.getState().addCollection(_collection);
  }

  /**
   *
   * @function
   */
  private async getFilterGeometry(
    collectionId: Collection["id"],
    itemId: string,
  ): Promise<Feature<Polygon>> {
    const service =
      collectionId === SourceId.DoiRegions ? wwdhService : geoconnexService;
    return service.getItem<Feature<Polygon>>(collectionId, itemId);
  }

  private addGeographyFilterSource(
    collectionId: Collection["id"],
    feature: Feature<Polygon>,
  ): string {
    const sourceId = this.getSourceId(collectionId);
    if (this.map) {
      const source = this.map.getSource(sourceId) as GeoJSONSource;
      if (!source) {
        this.map.addSource(sourceId, {
          type: "geojson",
          data: turf.featureCollection([feature]),
        });
      } else {
        source.setData(turf.featureCollection([feature]));
      }
    }

    return sourceId;
  }

  /**
   *
   * @function
   */
  private addGeographyFilterLayer(
    collectionId: Collection["id"],
    sourceId: string,
  ): void {
    const layerId = this.getLayerId(collectionId);
    if (this.map) {
      if (!this.map.getLayer(layerId)) {
        this.map.addLayer(getPolygonLayerDefinition(layerId, sourceId));
      } else {
        this.map.setLayoutProperty(layerId, "visibility", "visible");
      }
    }
  }

  /**
   *
   * @function
   */
  private hideIrrelevantGeographyFilterLayers(sourceIds: string[]): void {
    if (this.map) {
      sourceIds.forEach((sourceId) => {
        const layerId = this.getLayerId(sourceId);
        if (this.map!.getLayer(layerId)) {
          this.map!.setLayoutProperty(layerId, "visibility", "none");
        }
      });
    }
  }

  /**
   *
   * @function
   */
  public async updateGeographyFilter(
    collectionId: Collection["id"],
    itemId: string,
  ): Promise<void> {
    const feature = await this.getFilterGeometry(collectionId, itemId);

    const sourceId = this.addGeographyFilterSource(collectionId, feature);
    this.addGeographyFilterLayer(collectionId, sourceId);

    const otherGeographyFilterSources = GeographyFilterSources.filter(
      (source) => source !== collectionId,
    );

    this.hideIrrelevantGeographyFilterLayers(otherGeographyFilterSources);

    const bounds = turf.bbox(feature) as LngLatBoundsLike;
    this.map!.fitBounds(bounds, {
      padding: 40,
      speed: 1.2,
    });

    this.store.getState().setGeographyFilter({
      itemId,
      collectionId,
      feature,
    });
  }

  /**
   *
   * @function
   */
  public removeGeographyFilter(): void {
    this.hideIrrelevantGeographyFilterLayers(GeographyFilterSources);

    this.map!.fitBounds(
      [
        [-125, 24], // Southwest corner (California/Baja)
        [-96.5, 49], // Northeast corner (MN/ND border)
      ],
      {
        padding: 50,
      },
    );

    this.store.getState().setGeographyFilter(null);
  }
}

export default MainManager;
