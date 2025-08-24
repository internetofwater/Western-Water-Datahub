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
import wwdhService from '@/services/init/wwdh.init';
import { Collection, ColorValueHex, Location, MainState } from '@/stores/main/types';

type FakeCollection = {
  id: string;
  [key: string]: string;
};

class MainManager {
  private store: UseBoundStore<StoreApi<MainState>>;
  private map: Map | null = null;

  constructor(store: UseBoundStore<StoreApi<MainState>>) {
    this.store = store;
  }

  private hasMap(): boolean {
    return Boolean(this.map);
  }

  public setMap(map: Map): void {
    if (!this.hasMap()) {
      this.map = map;
    }
  }

  private createUUID(): string {
    return v6();
  }

  private createHexColor(): ColorValueHex {
    return '#fake';
  }

  public hasGeographyFilter(): boolean {
    return this.store.getState().hasGeographyFilter();
  }
  public hasCollection(collectionId: Collection['id']): boolean {
    return this.store.getState().hasCollection(collectionId);
  }
  public hasLocation(locationId: Location['id']): boolean {
    return this.store.getState().hasLocation(locationId);
  }

  public async getData(collectionId: Collection['id']): Promise<FeatureCollection<Point>> {
    const geographyFilter = this.store.getState().geographyFilter;
    if (geographyFilter) {
      const feature = geographyFilter as unknown as GeoJSONFeature;
      return this.getArea(collectionId, feature);
    }
    return this.getLocation(collectionId);
  }

  private async getLocation(collectionId: Collection['id']): Promise<FeatureCollection<Point>> {
    return wwdhService.getLocations<FeatureCollection<Point>>(collectionId);
  }

  private async getArea(
    collectionId: Collection['id'],
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

  public getSourceId(collectionId: Collection['id']): string {
    return `${collectionId}-source`;
  }

  public getLayerId(collectionId: Collection['id']): string {
    return `${collectionId}-locations`;
  }

  private async addMapSource(collectionId: Collection['id']): Promise<string> {
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

  private async addMapLayer(collectionId: Collection['id'], sourceId: string): Promise<void> {
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

  public async updateCollections(): Promise<void> {
    const collections = this.store.getState().collections;

    for (const collection of collections) {
      const collectionId = collection.id;
      const sourceId = await this.addMapSource(collectionId);
      this.addMapLayer(collectionId, sourceId);
    }
  }

  public addCollection(collection: FakeCollection): void {
    const _collection: Collection = {
      id: collection.id,
      provider: 'fake',
      category: 'fake',
      dataset: 'fake',
    };

    this.store.getState().addCollection(_collection);
  }
}

export default MainManager;
