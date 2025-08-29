/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import * as turf from '@turf/turf';
import { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { GeoJSONSource, LngLatBoundsLike, Map } from 'mapbox-gl';
import { GeoJSONFeature, stringify } from 'wellknown';
import { StoreApi, UseBoundStore } from 'zustand';
import { GeographyFilterSources } from '@/features/Map/consts';
import { SourceId } from '@/features/Map/sources';
import { getPointLayerDefinition, getPolygonLayerDefinition } from '@/features/Map/utils';
import { ICollection } from '@/services/edr.service';
import geoconnexService from '@/services/init/geoconnex.init';
import wwdhService from '@/services/init/wwdh.init';
import { Location, MainState } from '@/stores/main/types';

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
  private async fetchLocations(collectionId: ICollection['id']): Promise<FeatureCollection<Point>> {
    return wwdhService.getLocations<FeatureCollection<Point>>(collectionId);
  }

  /**
   *
   * @function
   */
  private async getArea(
    collectionId: ICollection['id'],
    feature: GeoJSONFeature
  ): Promise<FeatureCollection<Point>> {
    const wkt = stringify(feature);

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
  public getLocationsLayerId(collectionId: ICollection['id']): string {
    return `${collectionId}-locations`;
  }

  public getFilterLayerId(collectionId: ICollection['id']): string {
    return `${collectionId}-filter`;
  }

  private filterLocations(featureCollection: FeatureCollection<Point>) {
    const geographyFilter = this.store.getState().geographyFilter;

    if (geographyFilter) {
      return turf.pointsWithinPolygon(featureCollection, geographyFilter.feature);
    }

    return featureCollection;
  }

  /**
   *
   * @function
   */
  private async addMapSource(collectionId: ICollection['id']): Promise<string> {
    const sourceId = this.getSourceId(collectionId);
    if (this.map) {
      const data = await this.fetchLocations(collectionId);
      const geographyFilteredData = this.filterLocations(data);

      const source = this.map.getSource(sourceId) as GeoJSONSource;
      if (!source) {
        this.map.addSource(sourceId, {
          type: 'geojson',
          data: geographyFilteredData,
        });
      } else {
        source.setData(geographyFilteredData);
      }
    }

    return sourceId;
  }

  /**
   *
   * @function
   */
  private async addMapLayer(collectionId: ICollection['id'], sourceId: string): Promise<void> {
    const geographyFilter = this.store.getState().geographyFilter;

    const layerId = this.getLocationsLayerId(collectionId);
    if (this.map) {
      if (!this.map.getLayer(layerId)) {
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
      if (geographyFilter) {
        const geoFilterLayerId = this.getLocationsLayerId(geographyFilter.collectionId);
        this.map.moveLayer(layerId, geoFilterLayerId);
      }
    }
  }

  /**
   *
   * @function
   */
  public async getLocations(): Promise<void> {
    // Specific user collection choice
    const collection = this.store.getState().collection;
    // All collections for selected filters
    const collections = this.store.getState().collections;

    if (collection) {
      const sourceId = await this.addMapSource(collection);
      this.addMapLayer(collection, sourceId);
    } else {
      const chunkSize = 5;

      for (let i = 0; i < collections.length; i += chunkSize) {
        const chunk = collections.slice(i, i + chunkSize);

        await Promise.all(
          chunk.map(async (collection) => {
            const collectionId = collection.id;
            const sourceId = await this.addMapSource(collectionId);
            this.addMapLayer(collectionId, sourceId);
          })
        );
      }
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
        'parameter-name': category ? category.value : '*',
      },
    });

    this.store.getState().setCollections(response.collections);
  }

  /**
   *
   * @function
   */
  private async getFilterGeometry(
    collectionId: ICollection['id'],
    itemId: string
  ): Promise<Feature<Polygon>> {
    const service = collectionId === SourceId.DoiRegions ? wwdhService : geoconnexService;
    return service.getItem<Feature<Polygon>>(collectionId, itemId);
  }

  private addGeographyFilterSource(
    collectionId: ICollection['id'],
    feature: Feature<Polygon>
  ): string {
    const sourceId = this.getSourceId(collectionId);
    if (this.map) {
      const source = this.map.getSource(sourceId) as GeoJSONSource;
      if (!source) {
        this.map.addSource(sourceId, {
          type: 'geojson',
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
  private addGeographyFilterLayer(collectionId: ICollection['id'], sourceId: string): void {
    const layerId = this.getFilterLayerId(collectionId);
    if (this.map) {
      if (!this.map.getLayer(layerId)) {
        this.map.addLayer(getPolygonLayerDefinition(layerId, sourceId));
      } else {
        this.map.setLayoutProperty(layerId, 'visibility', 'visible');
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
        const layerId = this.getFilterLayerId(sourceId);
        if (this.map!.getLayer(layerId)) {
          this.map!.setLayoutProperty(layerId, 'visibility', 'none');
        }
      });
    }
  }

  /**
   *
   * @function
   */
  public async updateGeographyFilter(
    collectionId: ICollection['id'],
    itemId: string
  ): Promise<void> {
    const feature = await this.getFilterGeometry(collectionId, itemId);

    const sourceId = this.addGeographyFilterSource(collectionId, feature);
    this.addGeographyFilterLayer(collectionId, sourceId);

    const otherGeographyFilterSources = GeographyFilterSources.filter(
      (source) => source !== collectionId
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
      }
    );

    this.store.getState().setGeographyFilter(null);
  }
}

export default MainManager;
