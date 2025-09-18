/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import * as turf from "@turf/turf";
import { Feature, FeatureCollection, Geometry, Point, Polygon } from "geojson";
import { GeoJSONSource, LngLatBoundsLike, Map, Popup } from "mapbox-gl";
import { GeoJSONFeature, stringify } from "wellknown";
import { StoreApi, UseBoundStore } from "zustand";
import { GeographyFilterSources } from "@/features/Map/consts";
import { SourceId } from "@/features/Map/sources";
import {
  getFillLayerDefinition,
  getLineLayerDefinition,
  getPointLayerDefinition,
} from "@/features/Map/utils";
import { ICollection } from "@/services/edr.service";
import geoconnexService from "@/services/init/geoconnex.init";
import wwdhService from "@/services/init/wwdh.init";
import { Location, MainState } from "@/stores/main/types";
import { getRandomHexColor } from "@/utils/hexColor";

/**
 *
 * @class
 */
class MainManager {
  private store: UseBoundStore<StoreApi<MainState>>;
  private map: Map | null = null;
  private hoverPopup: Popup | null = null;

  constructor(store: UseBoundStore<StoreApi<MainState>>) {
    this.store = store;
  }

  /**
   *
   * @function
   */
  public setMap(map: Map): void {
    if (!this.map) {
      this.map = map;
    }
  }

  /**
   *
   * @function
   */
  public setPopup(popup: Popup): void {
    if (!this.hoverPopup) {
      this.hoverPopup = popup;
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
  public hasCollection(collectionId: ICollection["id"]): boolean {
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
  private async fetchLocations(
    collectionId: ICollection["id"],
  ): Promise<FeatureCollection<Point>> {
    return wwdhService.getLocations<FeatureCollection<Point>>(collectionId);
  }

  /**
   *
   * @function
   */
  private async getArea(
    collectionId: ICollection["id"],
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
  public getSourceId(collectionId: ICollection["id"]): string {
    return `${collectionId}-source`;
  }

  /**
   *
   * @function
   */
  public getLocationsLayerIds(collectionId: ICollection["id"]): {
    pointLayerId: string;
    fillLayerId: string;
    lineLayerId: string;
  } {
    return {
      pointLayerId: `${collectionId}-edr-locations-point`,
      fillLayerId: `${collectionId}-edr-locations-fill`,
      lineLayerId: `${collectionId}-edr-locations-line`,
    };
  }

  public getFilterLayerId(collectionId: ICollection["id"]): string {
    return `${collectionId}-filter`;
  }

  private filterByGeometryType(
    featureCollection: FeatureCollection<Geometry>,
    geographyFilterFeature: Feature<Polygon>,
  ): FeatureCollection<Geometry> {
    return {
      type: "FeatureCollection",
      features: featureCollection.features.filter((feature) => {
        switch (feature.geometry.type) {
          case "Point":
            return turf.booleanPointInPolygon(
              feature as Feature<Point>,
              geographyFilterFeature,
            );

          case "LineString":
          case "MultiLineString":
          case "Polygon":
          case "MultiPolygon":
            return turf.booleanIntersects(feature, geographyFilterFeature);

          default:
            console.error(
              `Unexpected geometry type: ${feature.geometry?.type} in feature: `,
              feature,
            );
            return false;
        }
      }),
    };
  }

  private filterLocations(
    featureCollection: FeatureCollection<Geometry>,
  ): FeatureCollection<Geometry> {
    const geographyFilter = this.store.getState().geographyFilter;

    if (geographyFilter) {
      return this.filterByGeometryType(
        featureCollection,
        geographyFilter.feature,
      );
    }

    return featureCollection;
  }

  /**
   *
   * @function
   */
  private async addLocationSource(
    collectionId: ICollection["id"],
  ): Promise<string> {
    const sourceId = this.getSourceId(collectionId);
    if (this.map) {
      const data = await this.fetchLocations(collectionId);
      const geographyFilteredData = this.filterLocations(data);

      const source = this.map.getSource(sourceId) as GeoJSONSource;
      if (!source) {
        this.map.addSource(sourceId, {
          type: "geojson",
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
  private async addLocationLayer(
    collectionId: ICollection["id"],
    sourceId: string,
  ): Promise<void> {
    const geographyFilter = this.store.getState().geographyFilter;

    const collections = this.store.getState().collections;

    const { pointLayerId, fillLayerId, lineLayerId } =
      this.getLocationsLayerIds(collectionId);
    if (this.map) {
      const color = getRandomHexColor();
      if (
        !this.map.getLayer(pointLayerId) &&
        !this.map.getLayer(lineLayerId) &&
        !this.map.getLayer(pointLayerId)
      ) {
        this.map.addLayer(getFillLayerDefinition(fillLayerId, sourceId, color));
        this.map.addLayer(getLineLayerDefinition(lineLayerId, sourceId, color));
        this.map.addLayer(
          getPointLayerDefinition(pointLayerId, sourceId, color),
        );

        this.map.on("click", pointLayerId, (e) => {
          e.originalEvent.preventDefault();

          const features = this.map!.queryRenderedFeatures(e.point, {
            layers: [pointLayerId],
          });
          if (features.length > 0) {
            features.forEach((feature) => {
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
            });
          }
        });

        this.map.on("click", fillLayerId, (e) => {
          if (!e.originalEvent.defaultPrevented) {
            e.originalEvent.preventDefault();

            const features = this.map!.queryRenderedFeatures(e.point, {
              layers: [fillLayerId],
            });
            if (features.length > 0) {
              features.forEach((feature) => {
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
              });
            }
          }
        });

        this.map.on("click", lineLayerId, (e) => {
          if (!e.originalEvent.defaultPrevented) {
            e.originalEvent.preventDefault();

            const features = this.map!.queryRenderedFeatures(e.point, {
              layers: [lineLayerId],
            });
            if (features.length > 0) {
              features.forEach((feature) => {
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
              });
            }
          }
        });

        this.map.on(
          "mouseenter",
          [pointLayerId, fillLayerId, lineLayerId],
          (e) => {
            this.map!.getCanvas().style.cursor = "pointer";
            const { features } = e;
            if (features && features.length > 0) {
              const collection = collections.find(
                (collection) => collection.id === collectionId,
              );

              if (collection) {
                const html = `
              <span style="color:black;">
                <strong>${collection.title}</strong><br/>
                ${features.map((feature) => `<strong>Location Id: </strong>${feature.id}<br/>`)}
              </span>
              `;
                this.hoverPopup!.setLngLat(e.lngLat)
                  .setHTML(html)
                  .addTo(this.map!);
              }
            }
          },
        );
        this.map.on(
          "mousemove",
          [pointLayerId, fillLayerId, lineLayerId],
          (e) => {
            this.map!.getCanvas().style.cursor = "pointer";
            const { features } = e;
            if (features && features.length > 0) {
              const collection = collections.find(
                (collection) => collection.id === collectionId,
              );

              if (collection) {
                const html = `
              <span style="color:black;">
                <strong>${collection.title}</strong><br/>
                ${features.map((feature) => `<strong>Location Id: </strong>${feature.id}`).join("<br/>")}
              </span>
              `;
                this.hoverPopup!.setLngLat(e.lngLat)
                  .setHTML(html)
                  .addTo(this.map!);
              }
            }
          },
        );
        this.map.on(
          "mouseleave",
          [pointLayerId, fillLayerId, lineLayerId],
          () => {
            this.map!.getCanvas().style.cursor = "";
            this.hoverPopup!.remove();
          },
        );
      }
      if (geographyFilter) {
        const geoFilterLayerId = this.getFilterLayerId(
          geographyFilter.collectionId,
        );
        [fillLayerId, lineLayerId, pointLayerId].forEach((layerId) =>
          this.map!.moveLayer(geoFilterLayerId, layerId),
        );
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
      const sourceId = await this.addLocationSource(collection);
      this.addLocationLayer(collection, sourceId);
    } else {
      const chunkSize = 5;

      for (let i = 0; i < collections.length; i += chunkSize) {
        const chunk = collections.slice(i, i + chunkSize);

        await Promise.all(
          chunk.map(async (collection) => {
            const collectionId = collection.id;
            const sourceId = await this.addLocationSource(collectionId);
            this.addLocationLayer(collectionId, sourceId);
          }),
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
        ...(provider ? { "provider-name": provider } : {}),
        "parameter-name": category ? category.value : "*",
      },
    });
    const originalCollections = this.store.getState().originalCollections;
    if (originalCollections.length === 0) {
      this.store.getState().setOriginalCollections(response.collections);
    }

    this.store.getState().setCollections(response.collections);
  }

  /**
   *
   * @function
   */
  private async getFilterGeometry(
    collectionId: ICollection["id"],
    itemId: string,
  ): Promise<Feature<Polygon>> {
    const service =
      collectionId === SourceId.DoiRegions ? wwdhService : geoconnexService;
    return service.getItem<Feature<Polygon>>(collectionId, itemId);
  }

  private addGeographyFilterSource(
    collectionId: ICollection["id"],
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
    collectionId: ICollection["id"],
    sourceId: string,
  ): void {
    const layerId = this.getFilterLayerId(collectionId);
    if (this.map) {
      if (!this.map.getLayer(layerId)) {
        this.map.addLayer(getLineLayerDefinition(layerId, sourceId));
      } else {
        this.map.setLayoutProperty(layerId, "visibility", "visible");
      }
    }
  }

  /**
   *
   * @function
   */
  private hideGeographyFilterLayers(sourceIds: string[]): void {
    if (this.map) {
      sourceIds.forEach((sourceId) => {
        const layerId = this.getFilterLayerId(sourceId);
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
    collectionId: ICollection["id"],
    itemId: string,
  ): Promise<void> {
    const feature = await this.getFilterGeometry(collectionId, itemId);

    const sourceId = this.addGeographyFilterSource(collectionId, feature);
    this.addGeographyFilterLayer(collectionId, sourceId);

    const otherGeographyFilterSources = GeographyFilterSources.filter(
      (source) => source !== collectionId,
    );

    this.hideGeographyFilterLayers(otherGeographyFilterSources);

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
  public removeGeographyFilter(fit: boolean = true): void {
    this.hideGeographyFilterLayers(GeographyFilterSources);

    if (this.map && fit) {
      this.map.fitBounds(
        [
          [-125, 24], // Southwest corner (California/Baja)
          [-96.5, 49], // Northeast corner (MN/ND border)
        ],
        {
          padding: 50,
        },
      );
    }

    this.store.getState().setGeographyFilter(null);
  }

  private clearLocationLayers(): void {
    if (!this.map) {
      return;
    }

    const originalCollections = this.store.getState().originalCollections;

    for (const collection of originalCollections) {
      const layerIds = Object.values(this.getLocationsLayerIds(collection.id));
      for (const layerId of layerIds) {
        if (this.map.getLayer(layerId)) {
          this.map.removeLayer(layerId);
        }
      }
    }
  }

  private clearLocationSources(): void {
    if (!this.map) {
      return;
    }

    const originalCollections = this.store.getState().originalCollections;

    for (const collection of originalCollections) {
      const sourceId = this.getSourceId(collection.id);
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    }
  }

  public clearAllData(): void {
    this.store.getState().setLocations([]);

    this.clearLocationLayers();
    this.clearLocationSources();

    this.removeGeographyFilter();

    this.store.getState().setProvider(null);
    this.store.getState().setCategory(null);
    this.store.getState().setCollection(null);
  }
}

export default MainManager;
