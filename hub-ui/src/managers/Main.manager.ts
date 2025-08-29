/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureCollection, Point } from 'geojson';
import { Map } from 'mapbox-gl';
import { v6 } from 'uuid';
import { GeoJSONFeature, stringify } from 'wellknown';
import { StoreApi, UseBoundStore } from 'zustand';
import { getPointLayerDefinition } from '@/features/Map/utils';
import { ICollection } from '@/services/edr.service';
import wwdhService from '@/services/init/wwdh.init';
import { ColorValueHex, Location, MainState } from '@/stores/main/types';

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
  private createUUID(): string {
    return v6();
  }

  /**
   *
   * @function
   */
  private createHexColor(): ColorValueHex {
    return '#fake';
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
  public hasCollection(collectionId: ICollection['id']): boolean {
    return this.store.getState().hasCollection(collectionId);
  }

  /**
   *
   * @function
   */
  public hasLocation(locationId: Location['id']): boolean {
    return this.store.getState().hasLocation(locationId);
  }

  /**
   *
   * @function
   */
  public async getData(collectionId: ICollection['id']): Promise<FeatureCollection<Point>> {
    const geographyFilter = this.store.getState().geographyFilter;
    if (geographyFilter) {
      const feature = geographyFilter as unknown as GeoJSONFeature;
      return this.getArea(collectionId, feature);
    }
    return this.getLocation(collectionId);
  }

  /**
   *
   * @function
   */
  private async getLocation(collectionId: ICollection['id']): Promise<FeatureCollection<Point>> {
    return wwdhService.getLocations<FeatureCollection<Point>>(collectionId);
  }

  /**
   *
   * @function
   */
  private async getArea(
    collectionId: ICollection['id'],
    geographyFilter: GeoJSONFeature
  ): Promise<FeatureCollection<Point>> {
    const wkt = stringify(geographyFilter);

    return wwdhService.getArea<FeatureCollection<Point>>(collectionId, {
      method: 'POST',
      params: {
        coords: wkt,
      },
    });
  }

  /**
   *
   * @function
   */
  public getSourceId(collectionId: ICollection['id']): string {
    return `${collectionId}-source`;
  }

  /**
   *
   * @function
   */
  public getLayerId(collectionId: ICollection['id']): string {
    return `${collectionId}-locations`;
  }

  /**
   *
   * @function
   */
  private async addMapSource(collectionId: ICollection['id']): Promise<string> {
    const sourceId = this.getSourceId(collectionId);
    if (this.map && !this.map.getSource(sourceId)) {
      const data = await this.getData(collectionId);
      this.map.addSource(sourceId, {
        type: 'geojson',
        data,
      });
    }

    return sourceId;
  }

  /**
   *
   * @function
   */
  private async addMapLayer(collectionId: ICollection['id'], sourceId: string): Promise<void> {
    const layerId = this.getLayerId(collectionId);
    if (this.map && !this.map.getLayer(layerId)) {
      this.map.addLayer(getPointLayerDefinition(layerId, sourceId));

      this.map.on('click', layerId, (e) => {
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

      this.map.on('mouseenter', layerId, () => {
        this.map!.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mousemove', layerId, () => {
        this.map!.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', layerId, () => {
        this.map!.getCanvas().style.cursor = '';
      });
    }
  }

  /**
   *
   * @function
   */
  public async getLocations(): Promise<void> {
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
  public async getCollections(): Promise<void> {
    const provider = this.store.getState().provider;
    const category = this.store.getState().category;

    const response = await wwdhService.getCollections({
      params: {
        ...(provider ? { 'provider-name': provider } : {}),
        'parameter-name': category ? category : '*',
      },
    });

    this.store.getState().setCollections(response.collections);
  }
}

export default MainManager;
