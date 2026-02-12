/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import dayjs from "dayjs";
import * as turf from "@turf/turf";
import {
  BBox,
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Point,
  Polygon,
} from "geojson";
import {
  GeoJSONFeature,
  GeoJSONSource,
  LngLatBoundsLike,
  Map,
  MapMouseEvent,
  MapTouchEvent,
  Popup,
  RasterTileSource,
} from "mapbox-gl";
import { v6 } from "uuid";
import { stringify, GeoJSONFeature as WellknownFeature } from "wellknown";
import { StoreApi, UseBoundStore } from "zustand";
import {
  CollectionRestrictions,
  idStoreProperty,
  ItemsOnlyCollections,
  RestrictionType,
  StringIdentifierCollections,
} from "@/consts/collections";
import { getDefaultGeoJSON } from "@/consts/geojson";
import {
  DEFAULT_BBOX,
  DEFAULT_FILL_OPACITY,
  GeographyFilterSources,
} from "@/features/Map/consts";
import { SourceId } from "@/features/Map/sources";
import {
  getFillLayerDefinition,
  getLineLayerDefinition,
  getPointLayerDefinition,
} from "@/features/Map/utils";
import { getNextLink } from "@/managers/Main.utils";
import notificationManager from "@/managers/Notification.init";
import {
  ExtendedFeatureCollection,
  SourceOptions,
  StyleOptions,
} from "@/managers/types";
import { CoverageGridService } from "@/services/coverageGrid.service";
import { ICollection } from "@/services/edr.service";
import geoconnexService from "@/services/init/geoconnex.init";
import wwdhService from "@/services/init/wwdh.init";
import {
  MainState,
  TGeometryTypes,
  TLayer,
  TLocation,
} from "@/stores/main/types";
import { ENotificationType } from "@/stores/session/types";
import {
  CollectionType,
  getCollectionType,
  isEdrGrid,
} from "@/utils/collection";
import { createDynamicStepExpression, isSamePalette } from "@/utils/colors";
import {
  isValidColorBrewerIndex,
  PaletteDefinition,
} from "@/utils/colors/types";
import { getIdStore } from "@/utils/getIdStore";
import { getRandomHexColor } from "@/utils/hexColor";
import { isTopLayer } from "@/utils/isTopLayer";
import { getRasterLayerSpecification } from "@/utils/layerDefinitions";

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
   * Creates a new v6 uuid
   *
   * @function
   */
  public createUUID(): string {
    return v6();
  }

  /**
   *
   * @function
   */
  public hasGeographyFilter(): boolean {
    return this.store.getState().hasGeographyFilter();
  }

  public getCollection(
    collectionId: ICollection["id"],
  ): ICollection | undefined {
    return this.store
      .getState()
      .originalCollections.find((collection) => collection.id === collectionId);
  }

  public getLayer({
    collectionId,
    layerId,
  }: {
    collectionId?: ICollection["id"];
    layerId?: TLayer["id"];
  }): TLayer | undefined {
    return this.store
      .getState()
      .layers.find(
        (layer) => layer.collectionId === collectionId || layer.id === layerId,
      );
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
  public hasLocation(locationId: TLocation["id"]): boolean {
    return this.store.getState().hasLocation(locationId);
  }

  private async fetchData<
    T extends Geometry = Geometry,
    V extends GeoJsonProperties = GeoJsonProperties,
  >(
    collectionId: ICollection["id"],
    bbox?: BBox,
    from?: string | null,
    to?: string | null,
    parameterNames?: string[],
    signal?: AbortSignal,
    next?: string,
  ): Promise<FeatureCollection<T, V>> {
    const collection = this.getCollection(collectionId);

    if (!collection) {
      throw new Error("Datasource not found");
    }

    const collectionType = getCollectionType(collection);

    switch (collectionType) {
      case CollectionType.EDR:
        if (ItemsOnlyCollections.includes(collectionId)) {
          return await this.fetchItems(
            collectionId,
            parameterNames,
            bbox,
            signal,
            next,
          );
        }
        return await this.fetchLocations(
          collectionId,
          parameterNames,
          bbox,
          signal,
          next,
        );
      case CollectionType.Features:
        return await this.fetchItems(
          collectionId,
          parameterNames,
          bbox,
          signal,
          next,
        );
      case CollectionType.EDRGrid:
        if (!bbox) {
          throw new Error("No BBox provided for Grid layer");
        }
        // TODO: improve typing here
        return (await this.fetchGrid(
          collectionId,
          bbox,
          from,
          to,
          parameterNames,
          signal,
        )) as FeatureCollection<T, V>;
    }

    throw new Error("Unsupported collection type");
  }

  /**
   *
   * @function
   */
  private async fetchLocations<
    T extends Geometry = Geometry,
    V extends GeoJsonProperties = GeoJsonProperties,
  >(
    collectionId: ICollection["id"],
    parameterNames?: string[],
    bbox?: BBox,
    signal?: AbortSignal,
    next?: string,
  ): Promise<FeatureCollection<T, V>> {
    const data = await wwdhService.getLocations<FeatureCollection<T, V>>(
      collectionId,
      {
        signal,
        params: {
          limit: 2000,
          bbox,
          ...(parameterNames && parameterNames.length > 0
            ? { "parameter-name": parameterNames.join(",") }
            : {}),
        },
      },
      next,
    );

    if (!data) {
      return getDefaultGeoJSON<T, V>();
    }

    if (StringIdentifierCollections.includes(collectionId)) {
      return this.storeIdentifiers(data);
    }

    return data;
  }

  /**
   *
   * @function
   */
  private storeIdentifiers<
    T extends Geometry = Geometry,
    V extends GeoJsonProperties = GeoJsonProperties,
  >(
    featureCollection: ExtendedFeatureCollection<T, V>,
  ): ExtendedFeatureCollection<T, V> {
    return {
      ...featureCollection,
      features: featureCollection.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          [idStoreProperty]: String(feature.id),
        },
      })),
    };
  }

  /**
   *
   * @function
   */
  private async fetchItems<
    T extends Geometry = Geometry,
    V extends GeoJsonProperties = GeoJsonProperties,
  >(
    collectionId: ICollection["id"],
    parameterNames?: string[],
    bbox?: BBox,
    signal?: AbortSignal,
    next?: string,
  ): Promise<ExtendedFeatureCollection<T, V>> {
    console.log("");
    const data = await wwdhService.getItems<ExtendedFeatureCollection<T, V>>(
      collectionId,
      {
        signal,
        params: {
          limit: 2000,
          bbox,
          ...(parameterNames && parameterNames.length > 0
            ? { "parameter-name": parameterNames.join(",") }
            : {}),
        },
      },
      next,
    );

    if (!data) {
      return getDefaultGeoJSON<T, V>();
    }

    if (StringIdentifierCollections.includes(collectionId)) {
      return this.storeIdentifiers<T, V>(data);
    }

    return data;
  }

  /**
   *
   * @function
   */
  private async fetchGrid(
    collectionId: ICollection["id"],
    bbox: BBox,
    from?: string | null,
    to?: string | null,
    parameterNames?: string[],
    signal?: AbortSignal,
  ): Promise<FeatureCollection> {
    return await new CoverageGridService().createGrid(
      collectionId,
      bbox,
      from,
      to,
      parameterNames,
      signal,
    );
  }

  /**
   *
   * @function
   */
  private async getArea(
    collectionId: ICollection["id"],
    feature: WellknownFeature,
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
    return `user-${collectionId}-source`;
  }

  /**
   *
   * @function
   */
  public getLocationsLayerIds(collectionId: ICollection["id"]): {
    pointLayerId: string;
    fillLayerId: string;
    lineLayerId: string;
    rasterLayerId: string;
  } {
    return {
      pointLayerId: `user-${collectionId}-point`,
      fillLayerId: `user-${collectionId}-fill`,
      lineLayerId: `user-${collectionId}-line`,
      rasterLayerId: `user-${collectionId}-raster`,
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
        turf.simplify(geographyFilter.feature, {
          tolerance: 0.05,
          mutate: false,
        }),
      );
    }

    return featureCollection;
  }

  public getUniqueIds(
    features: GeoJSONFeature[],
    collectionId: ICollection["id"],
  ): Array<string> {
    const uniques = new Set<string>();

    const useIdStore = StringIdentifierCollections.includes(collectionId);

    for (const feature of features) {
      if (useIdStore) {
        const id = getIdStore(feature);
        if (id) {
          uniques.add(id);
        } else {
          console.error(
            "Unable to find id store on layer from collection: ",
            collectionId,
            ", feature: ",
            feature,
          );
        }
      } else if (feature.id) {
        uniques.add(String(feature.id));
      }
    }

    return Array.from(uniques).sort();
  }

  private getClickEventHandler<T extends MapMouseEvent | MapTouchEvent>(
    mapLayerId: string,
    collectionId: ICollection["id"],
  ): (e: T) => void {
    return (e) => {
      if (e.originalEvent.cancelBubble) {
        return;
      }
      e.originalEvent.preventDefault();

      if (!isTopLayer(collectionId, this.map!, e.point)) {
        return;
      }

      if (!e.originalEvent.defaultPrevented) {
        e.originalEvent.preventDefault();
        e.originalEvent.cancelBubble = true;
        const features = this.map!.queryRenderedFeatures(e.point, {
          layers: [mapLayerId],
        });

        if (features.length > 0) {
          // Hack, use the feature id to track this location, fetch id store in consuming features
          const uniqueFeatures = this.getUniqueIds(features, collectionId);

          uniqueFeatures.forEach((locationId) => {
            if (this.hasLocation(locationId)) {
              this.store.getState().removeLocation(locationId);
            } else {
              this.store.getState().addLocation({
                id: locationId,
                collectionId,
              });
            }
          });
        }
      }
    };
  }

  private getHoverEventHandler(
    name: string,
    collectionId: ICollection["id"],
    upperLabel: string,
    lowerLabel: string,
  ): (e: MapMouseEvent) => void {
    return (e) => {
      // As layers can be added in any order, and reordered, perform manual check to ensure popup shows
      // for top layer in visual order
      if (!isTopLayer(collectionId, this.map!, e.point)) {
        return;
      }

      this.map!.getCanvas().style.cursor = "pointer";
      const { features } = e;
      if (features && features.length > 0) {
        const uniqueFeatures = this.getUniqueIds(features, collectionId);
        const html = `
            <span>
              <strong>${name}</strong><br/>
              ${uniqueFeatures.map((locationId) => `<strong>${upperLabel} Id: </strong>${locationId}`).join("<br/>")}
              <div style="margin-top: 16px;display:flex;flex-direction:column;justify-content:center;align-items:center">
                <p style="margin: 0;">Click to select the ${lowerLabel}.</p>
                <p style="margin: 0;">Double-click to preview.</p>
              </div>
            </span>
          `;
        this.hoverPopup!.setLngLat(e.lngLat).setHTML(html).addTo(this.map!);
      }
    };
  }

  private getLabels(collectionType: CollectionType): {
    upperLabel: string;
    lowerLabel: string;
  } {
    switch (collectionType) {
      case CollectionType.EDR:
        return {
          upperLabel: "Location",
          lowerLabel: "location",
        };
      case CollectionType.EDRGrid:
        return {
          upperLabel: "Grid",
          lowerLabel: "grid",
        };

      case CollectionType.Features:
      default:
        return {
          upperLabel: "Item",
          lowerLabel: "item",
        };
    }
  }

  private clearInvalidLocations = (
    collectionId: ICollection["id"],
    featureCollection: FeatureCollection<Geometry>,
  ) => {
    const datasource = this.getCollection(collectionId);

    if (datasource && isEdrGrid(datasource)) {
      this.store.getState().setLocations([]);
    } else {
      const { locations, removeLocation } = this.store.getState();

      const layerLocations = locations.filter(
        (location) => location.collectionId === collectionId,
      );

      const validIds = new Set(
        featureCollection.features.map((feature) => String(feature.id)),
      );
      const invalidLocations = layerLocations.filter(
        (location) => !validIds.has(location.id),
      );

      if (invalidLocations.length === 0) {
        return;
      }

      invalidLocations.forEach((location) => removeLocation(location.id));
    }
  };

  private checkParameterRestrictions(collectionId: ICollection["id"]) {
    const restrictions = CollectionRestrictions[collectionId];
    if (restrictions && restrictions.length > 0) {
      const parameterRestriction = restrictions.find(
        (restriction) => restriction.type === RestrictionType.Parameter,
      );

      if (parameterRestriction) {
        const parameters =
          this.store
            .getState()
            .parameters.find(
              (parameter) => parameter.collectionId === collectionId,
            )?.parameters ?? [];

        const datasource = this.getCollection(collectionId);
        const hasNoParameters = parameters.length === 0;

        if (hasNoParameters || parameters.length > parameterRestriction.count) {
          let message = `Dataset: ${datasource?.title}, requires at least one and up to ${parameterRestriction.count} parameter${parameters.length - parameterRestriction.count > 1 ? "s" : ""} to be fetched at one time.`;
          if (hasNoParameters) {
            message += " Please select at least one parameter.";
          } else {
            message += ` Please remove ${parameters.length - parameterRestriction.count} parameter${parameters.length - parameterRestriction.count > 1 ? "s" : ""}`;
          }
          throw new Error(message);
        }
      }
    }
  }

  private checkDateRestrictions(
    collectionId: ICollection["id"],
    from: string | null,
    to: string | null,
  ) {
    const restrictions = CollectionRestrictions[collectionId];

    if (restrictions && restrictions.length > 0) {
      const dateRestriction = restrictions.find(
        (restriction) => restriction.type === RestrictionType.Day,
      );

      if (dateRestriction && dateRestriction.days) {
        const datasource = this.getCollection(collectionId);
        if (!from || !to) {
          throw new Error(
            `Dataset: ${datasource?.title}, requires a bounded date range of no longer than ${dateRestriction.days} days.`,
          );
        }
        const diff = dayjs(to).diff(dayjs(from), "days");

        if (diff > dateRestriction.days) {
          throw new Error(
            `Dataset: ${datasource?.title}, requires a bounded date range of no longer than ${dateRestriction.days}. Current date range is ${diff - dateRestriction.days} days too long.`,
          );
        }
      }
    }
  }

  private checkCollectionBBoxRestrictions(
    collectionId: ICollection["id"],
    area: number,
  ) {
    const restrictions = CollectionRestrictions[collectionId];

    if (restrictions && restrictions.length > 0) {
      const sizeRestriction = restrictions.find(
        (restriction) => restriction.type === RestrictionType.Size,
      );

      if (
        sizeRestriction &&
        sizeRestriction.size &&
        area > sizeRestriction.size
      ) {
        const datasource = this.getCollection(collectionId);
        const factor = area / sizeRestriction.size;
        throw new Error(
          `Target area ${factor.toFixed(2)}x too large for instance of dataset: ${datasource?.title}.\n ${sizeRestriction.message}`,
        );
      }
    }
  }

  private validateBBox(bbox: BBox, collectionId: ICollection["id"]) {
    const userBBox = turf.bboxPolygon(bbox);
    const fullBBox = turf.bboxPolygon(DEFAULT_BBOX);

    const userBBoxArea = turf.area(userBBox);
    const fullBBoxArea = turf.area(fullBBox);

    // Valid bbox should touch the full bbox, not contain it fully, and be smaller than the size limit
    // Certain collections have additional size restrictions due to large datasets
    // Throw errors to stop process and provide feedback to user
    this.checkCollectionBBoxRestrictions(collectionId, userBBoxArea);

    const intersectsFull = turf.booleanIntersects(userBBox, fullBBox);
    const containsFull = turf.booleanContains(userBBox, fullBBox);
    const smaller = userBBoxArea <= fullBBoxArea;

    if (!intersectsFull) {
      throw new Error("Target area not connected to Arizona.");
    }
    if (containsFull) {
      throw new Error("Target area can not contain Arizona.");
    }
    if (!smaller) {
      throw new Error("Target area must be smaller than Arizona.");
    }
  }

  public getBBox(
    collectionId: ICollection["id"],
    includeGeography: boolean,
  ): BBox {
    const filterFeature = this.store.getState().geographyFilter?.feature;

    if (!includeGeography || !filterFeature) {
      this.checkCollectionBBoxRestrictions(
        collectionId,
        turf.area(turf.bboxPolygon(DEFAULT_BBOX)),
      );
      return DEFAULT_BBOX;
    }

    const featureCollection = turf.featureCollection([filterFeature]);

    const userBBox = turf.bbox(featureCollection);

    this.validateBBox(userBBox, collectionId);

    return userBBox;
  }

  public async styleLayer(
    layer: TLayer,
    paletteDefinition: PaletteDefinition,
    {
      features,
      signal,
    }: StyleOptions<{ [paletteDefinition.parameter]: number }>,
  ) {
    if (!this.map) {
      return;
    }

    const defaultedfeatures =
      features ??
      (
        await this.getFeatures<
          Geometry,
          { [paletteDefinition.parameter]: number }
        >(layer.collectionId, layer.includeGeography, signal)
      ).features;

    const { parameter, count, palette, index } = paletteDefinition;
    const expression = createDynamicStepExpression(
      defaultedfeatures,
      parameter,
      palette,
      count,
      index,
    );

    const { pointLayerId, fillLayerId, lineLayerId } =
      this.getLocationsLayerIds(layer.collectionId);

    if (this.map.getLayer(pointLayerId)) {
      this.map.setPaintProperty(pointLayerId, "circle-color", expression);
    }
    if (this.map.getLayer(fillLayerId)) {
      this.map.setPaintProperty(fillLayerId, "fill-color", expression);
    }
    if (this.map.getLayer(lineLayerId)) {
      this.map.setPaintProperty(lineLayerId, "line-color", expression);
    }

    this.store.getState().updateLayer({
      ...layer,
      color: expression,
      paletteDefinition,
    });

    return expression;
  }

  /**
   *
   * @function
   */
  private async addStandardLayer(
    collectionId: ICollection["id"],
  ): Promise<void> {
    const geographyFilter = this.store.getState().geographyFilter;
    const layer = this.getLayer({ collectionId });

    const { pointLayerId, fillLayerId, lineLayerId } =
      this.getLocationsLayerIds(collectionId);
    const collection = this.getCollection(collectionId);
    if (layer && collection && this.map) {
      const collectionType = getCollectionType(collection);
      const color = layer.color;
      if (
        !this.map.getLayer(pointLayerId) &&
        !this.map.getLayer(lineLayerId) &&
        !this.map.getLayer(pointLayerId)
      ) {
        const sourceId = this.getSourceId(collectionId);

        const { upperLabel, lowerLabel } = this.getLabels(collectionType);
        this.map.addLayer(getFillLayerDefinition(fillLayerId, sourceId, color));
        this.map.addLayer(getLineLayerDefinition(lineLayerId, sourceId, color));
        this.map.addLayer(
          getPointLayerDefinition(pointLayerId, sourceId, color),
        );

        this.map.on(
          "click",
          pointLayerId,
          this.getClickEventHandler<MapMouseEvent>(pointLayerId, collectionId),
        );

        this.map.on(
          "click",
          fillLayerId,
          this.getClickEventHandler<MapMouseEvent>(fillLayerId, collectionId),
        );

        this.map.on(
          "click",
          lineLayerId,
          this.getClickEventHandler<MapMouseEvent>(lineLayerId, collectionId),
        );

        this.map.on(
          "touchend",
          pointLayerId,
          this.getClickEventHandler<MapTouchEvent>(pointLayerId, collectionId),
        );

        this.map.on(
          "touchend",
          fillLayerId,
          this.getClickEventHandler<MapTouchEvent>(fillLayerId, collectionId),
        );

        this.map.on(
          "touchend",
          lineLayerId,
          this.getClickEventHandler<MapTouchEvent>(lineLayerId, collectionId),
        );

        this.map.on(
          "mouseenter",
          [pointLayerId, fillLayerId, lineLayerId],
          this.getHoverEventHandler(
            collection.title ?? "",
            collectionId,
            upperLabel,
            lowerLabel,
          ),
        );
        this.map.on(
          "mousemove",
          [pointLayerId, fillLayerId, lineLayerId],
          this.getHoverEventHandler(
            collection.title ?? "",
            collectionId,
            upperLabel,
            lowerLabel,
          ),
        );
        this.map.on(
          "mouseleave",
          [pointLayerId, fillLayerId, lineLayerId],
          () => {
            this.map!.getCanvas().style.cursor = "";
            this.hoverPopup!.remove();
          },
        );

        if (geographyFilter && collectionType !== CollectionType.EDRGrid) {
          const geoFilterLayerId = this.getFilterLayerId(
            geographyFilter.collectionId,
          );
          for (const layerId of [fillLayerId, lineLayerId, pointLayerId]) {
            this.map.moveLayer(geoFilterLayerId, layerId);
          }
        } else if (
          geographyFilter &&
          collectionType === CollectionType.EDRGrid
        ) {
          const geoFilterLayerId = this.getFilterLayerId(
            geographyFilter.collectionId,
          );
          for (const layerId of [fillLayerId, lineLayerId, pointLayerId]) {
            this.map.moveLayer(layerId, geoFilterLayerId);
          }
        }
      }
    }
  }

  private async addData(
    collectionId: ICollection["id"],
    options?: SourceOptions,
  ) {
    const datasource = this.getCollection(collectionId);
    const sourceId = this.getSourceId(collectionId);

    if (datasource) {
      const collectionType = getCollectionType(datasource);

      if (
        [
          CollectionType.EDR,
          CollectionType.Features,
          CollectionType.EDRGrid,
        ].includes(collectionType)
      ) {
        await this.addGeoJsonData(collectionId, options);
      }
    }

    return sourceId;
  }

  private addSource(collectionId: ICollection["id"]) {
    const datasource = this.getCollection(collectionId);
    const sourceId = this.getSourceId(collectionId);

    if (datasource) {
      const collectionType = getCollectionType(datasource);

      if (
        [
          CollectionType.EDR,
          CollectionType.Features,
          CollectionType.EDRGrid,
        ].includes(collectionType)
      ) {
        this.addGeoJsonSource(collectionId);
      } else if (collectionType === CollectionType.Map) {
        this.addRasterSource(datasource);
      }
    }

    return sourceId;
  }

  /**
   * * Adds (or updates) a GeoJSON source and pages through all results,
   * streaming each page into the source as it arrives.
   *
   * @function
   */
  private async addGeoJsonData(
    collectionId: ICollection["id"],
    options?: SourceOptions,
  ): Promise<string> {
    const sourceId = this.getSourceId(collectionId);

    if (!this.map) {
      return sourceId;
    }

    const source = this.map.getSource(sourceId) as GeoJSONSource | undefined;

    if (options?.noFetch || !source) {
      return sourceId;
    }

    const bbox = this.getBBox(collectionId, options?.includeGeography ?? true);
    const from = options?.from ?? this.store.getState().from;
    const to = options?.to ?? this.store.getState().to;
    const parameters =
      options?.parameterNames ??
      this.store
        .getState()
        .parameters.find((parameter) => parameter.collectionId === collectionId)
        ?.parameters ??
      [];

    const geometryTypes = new Set<TGeometryTypes>();

    this.checkDateRestrictions(collectionId, from, to);

    this.checkParameterRestrictions(collectionId);

    let aggregate = getDefaultGeoJSON();
    let next: string | undefined;

    do {
      if (options?.signal?.aborted) {
        break;
      }

      const page = await this.fetchData(
        collectionId,
        bbox,
        from,
        to,
        parameters,
        options?.signal,
        next,
      );

      let filtered = options?.includeGeography
        ? this.filterLocations(page)
        : page;
      this.clearInvalidLocations(collectionId, filtered);
      if (Array.isArray(filtered.features)) {
        filtered.features.forEach((feature) => {
          geometryTypes.add(feature.geometry.type);
        });
        aggregate.features.push(...filtered.features);
        source.setData(aggregate);
      }

      (filtered as any) = undefined;

      next = getNextLink(page);
    } while (next);

    const layer = this.getLayer({ collectionId });

    if (layer && layer.paletteDefinition) {
      const features = aggregate.features as Feature<
        Geometry,
        { [layer.paletteDefinition.parameter]: number }
      >[];
      this.styleLayer(layer, layer.paletteDefinition, {
        features,
        signal: options?.signal,
      });
    }

    (aggregate as any) = undefined;

    if (layer) {
      this.store.getState().updateLayer({
        ...layer,
        loaded: true,
        geometryTypes: Array.from(geometryTypes),
      });
    }

    return sourceId;
  }

  /**
   *
   * @function
   */
  /**
   * Adds (or updates) a GeoJSON source and pages through all results,
   * streaming each page into the source as it arrives.
   */
  private addGeoJsonSource(collectionId: ICollection["id"]): string {
    const sourceId = this.getSourceId(collectionId);

    if (!this.map) {
      return sourceId;
    }

    const source = this.map.getSource(sourceId) as GeoJSONSource | undefined;
    if (!source) {
      this.map.addSource(sourceId, {
        type: "geojson",
        data: getDefaultGeoJSON(),
      });
    }

    return sourceId;
  }

  private addRasterSource(collection: ICollection) {
    const link = collection.links.find(
      (link) => link.rel.includes("map") && link.type === "image/png",
    );
    const sourceId = this.getSourceId(collection.id);
    if (link && this.map) {
      const source = this.map.getSource(sourceId) as RasterTileSource;

      if (!source) {
        this.map.addSource(sourceId, {
          type: "raster",
          bounds: DEFAULT_BBOX,
          tiles: [
            `${link.href}&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox={bbox-epsg-3857}`,
          ],
          tileSize: 256,
          minzoom: 4,
        });
      }
    }
  }

  private addLayer(collectionId: ICollection["id"]): void {
    const datasource = this.getCollection(collectionId);

    if (datasource) {
      const collectionType = getCollectionType(datasource);

      if (
        [
          CollectionType.EDR,
          CollectionType.Features,
          CollectionType.EDRGrid,
        ].includes(collectionType)
      ) {
        this.addStandardLayer(collectionId);
      } else if (collectionType === CollectionType.Map) {
        this.addRasterLayer(collectionId);
      }
    }
  }

  private addRasterLayer(collectionId: ICollection["id"]): void {
    const { rasterLayerId } = this.getLocationsLayerIds(collectionId);

    const sourceId = this.getSourceId(collectionId);

    if (this.map && !this.map.getLayer(rasterLayerId)) {
      this.map.addLayer(getRasterLayerSpecification(rasterLayerId, sourceId));
    }
  }

  public deleteLayer(collectionId: ICollection["id"]) {
    let layers = this.store
      .getState()
      .layers.filter((_layer) => _layer.collectionId !== collectionId);
    const locations = this.store
      .getState()
      .locations.filter((location) => location.collectionId !== collectionId);
    const parameters = this.store
      .getState()
      .parameters.filter(
        (parameter) => parameter.collectionId !== collectionId,
      );
    const searches = this.store
      .getState()
      .searches.filter((search) => search.collectionId !== collectionId);
    const palettes = this.store
      .getState()
      .palettes.filter((palette) => palette.collectionId !== collectionId);
    const selectedCollections = this.store
      .getState()
      .selectedCollections.filter(
        (selectedCollectionId) => selectedCollectionId !== collectionId,
      );

    layers = layers
      .sort((a, b) => a.position - b.position)
      .map((l, index) => ({ ...l, position: index + 1 }));

    if (this.map) {
      const layerIds = Object.values(this.getLocationsLayerIds(collectionId));
      for (const layerId of layerIds) {
        if (this.map.getLayer(layerId)) {
          this.map.removeLayer(layerId);
        }
      }

      const sourceId = this.getSourceId(collectionId);

      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    }

    this.store.getState().setLayers(layers);
    this.store.getState().setLocations(locations);
    this.store.getState().setParameters(parameters);
    this.store.getState().setSearches(searches);
    this.store.getState().setPalettes(palettes);
    this.store.getState().setSelectedCollections(selectedCollections);
  }

  public cleanLayers(selectedCollections: string[]) {
    const layers = this.store.getState().layers;

    let count = 0;
    for (const layer of layers) {
      if (
        !selectedCollections.some(
          (collectionId) => collectionId === layer.collectionId,
        )
      ) {
        this.deleteLayer(layer.collectionId);
      } else {
        count += 1;
      }
    }

    return count;
  }

  /**
   *
   * @function
   */
  public async createLayer(
    collection: ICollection,
    includeGeography: boolean,
  ): Promise<void> {
    const from = this.store.getState().from;
    const to = this.store.getState().to;
    const layer = this.getLayer({ collectionId: collection.id });

    const count = this.store.getState().layers.length;

    const parameters =
      this.store
        .getState()
        .parameters.find(
          (parameter) => parameter.collectionId === collection.id,
        )?.parameters ?? [];

    const paletteDefinition =
      this.store
        .getState()
        .palettes.find((palette) => palette.collectionId === collection.id)
        ?.palette ?? null;

    const collectionType = getCollectionType(collection);
    if (layer) {
      let color = layer.color;
      // The user has removed the previous paletteDefinition but color is still a data expression
      if (
        this.map &&
        paletteDefinition === null &&
        typeof layer.color !== "string"
      ) {
        const { pointLayerId, fillLayerId, lineLayerId } =
          this.getLocationsLayerIds(layer.collectionId);

        color = getRandomHexColor();

        if (this.map.getLayer(pointLayerId)) {
          this.map.setPaintProperty(pointLayerId, "circle-color", color);
        }
        if (this.map.getLayer(fillLayerId)) {
          this.map.setPaintProperty(fillLayerId, "fill-color", color);
        }
        if (this.map.getLayer(lineLayerId)) {
          this.map.setPaintProperty(lineLayerId, "line-color", color);
        }
      }

      this.store.getState().updateLayer({
        ...layer,
        parameters,
        from,
        to,
        color,
        paletteDefinition,
        visible: true,
        loaded: collectionType === CollectionType.Map,
        includeGeography,
      });
    } else {
      this.store.getState().addLayer({
        id: this.createUUID(),
        collectionId: collection.id,
        color: getRandomHexColor(),
        parameters,
        from,
        to,
        position: count + 1,
        opacity: DEFAULT_FILL_OPACITY,
        paletteDefinition,
        visible: true,
        loaded: collectionType === CollectionType.Map,
        geometryTypes: [],
        includeGeography,
      });
    }

    this.addSource(collection.id);
    this.addLayer(collection.id);

    await this.addData(collection.id, { includeGeography });

    this.reorderLayers();
  }

  /**
   *
   * @function
   */
  public async createLayers(): Promise<void> {
    // Specific user collection choice
    const selectedCollections = this.store.getState().selectedCollections;
    // All collections for selected filters
    const collections = this.store.getState().collections;

    const filteredCollections = collections.filter(
      (collection) =>
        selectedCollections.length === 0 ||
        selectedCollections.includes(collection.id),
    );

    const from = this.store.getState().from;
    const to = this.store.getState().to;

    let count = this.cleanLayers(selectedCollections);

    const chunkSize = 5;
    for (let i = 0; i < filteredCollections.length; i += chunkSize) {
      const chunk = filteredCollections.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async (collection) => {
          const collectionId = collection.id;

          const layer = this.getLayer({ collectionId });

          const parameters =
            this.store
              .getState()
              .parameters.find(
                (parameter) => parameter.collectionId === collectionId,
              )?.parameters ?? [];

          const paletteDefinition =
            this.store
              .getState()
              .palettes.find((palette) => palette.collectionId === collectionId)
              ?.palette ?? null;

          const collectionType = getCollectionType(collection);
          if (layer) {
            let color = layer.color;
            // The user has removed the previous paletteDefinition but color is still a data expression
            if (
              this.map &&
              paletteDefinition === null &&
              typeof layer.color !== "string"
            ) {
              const { pointLayerId, fillLayerId, lineLayerId } =
                this.getLocationsLayerIds(layer.collectionId);

              color = getRandomHexColor();

              if (this.map.getLayer(pointLayerId)) {
                this.map.setPaintProperty(pointLayerId, "circle-color", color);
              }
              if (this.map.getLayer(fillLayerId)) {
                this.map.setPaintProperty(fillLayerId, "fill-color", color);
              }
              if (this.map.getLayer(lineLayerId)) {
                this.map.setPaintProperty(lineLayerId, "line-color", color);
              }
            }

            this.store.getState().updateLayer({
              ...layer,
              parameters,
              from,
              to,
              color,
              paletteDefinition,
              visible: true,
              loaded: collectionType === CollectionType.Map,
            });
          } else {
            this.store.getState().addLayer({
              id: this.createUUID(),
              collectionId,
              color: getRandomHexColor(),
              parameters,
              from,
              to,
              position: count + 1,
              opacity: DEFAULT_FILL_OPACITY,
              paletteDefinition,
              visible: true,
              loaded: collectionType === CollectionType.Map,
              geometryTypes: [],
              includeGeography: true,
            });
            count += 1;
          }

          this.addSource(collectionId);
          this.addLayer(collectionId);
          await this.addData(collectionId);
        }),
      );
    }

    this.reorderLayers();
  }

  /**
   *
   * @function
   */
  public async getCollections(): Promise<void> {
    const provider = this.store.getState().provider;
    const categories = this.store.getState().categories;

    const response = await wwdhService.getCollections({
      params: {
        ...(provider.length > 0 ? { "provider-name": provider.join(",") } : {}),
        ...(categories.length > 0
          ? { "parameter-name": categories.join(",") }
          : {}),
      },
    });

    const originalCollections = this.store.getState().originalCollections;
    if (originalCollections.length === 0) {
      this.store.getState().setOriginalCollections(response.collections);
    }

    const parameterGroups = this.store.getState().parameterGroups;
    if (parameterGroups.length === 0) {
      this.store.getState().setParameterGroups(response.parameterGroups);
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
  public async getFeatures<
    T extends Geometry = Geometry,
    V extends GeoJsonProperties = GeoJsonProperties,
  >(
    collectionId: ICollection["id"],
    includeGeography: boolean,
    signal?: AbortSignal,
  ): Promise<FeatureCollection<T, V>> {
    try {
      const sourceId = this.getSourceId(collectionId);

      const source = this.map?.getSource(sourceId) as GeoJSONSource;

      const data = source._data;
      if (typeof data !== "string") {
        const featureCollection = turf.featureCollection<T, V>(
          (data as FeatureCollection<T, V>).features as Feature<T, V>[],
        );

        return featureCollection;
      }
    } catch (error) {
      console.error(error);
    }

    // TODO
    const bbox = this.getBBox(collectionId, includeGeography);

    // TODO: update to remove extra args
    const data = await this.fetchData<T, V>(
      collectionId,
      bbox,
      undefined,
      undefined,
      undefined,
      signal,
    );

    return data;
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

  private removeAllLayers(): void {
    if (!this.map) {
      return;
    }

    const layers = this.store.getState().layers;

    for (const layer of layers) {
      this.deleteLayer(layer.collectionId);
    }
  }

  public clearAllData(): void {
    this.store.getState().setLocations([]);

    this.removeAllLayers();

    this.removeGeographyFilter();

    this.store.getState().setProvider([]);
    this.store.getState().setCategories([]);
    this.store.getState().setSelectedCollections([]);
    const today = dayjs();
    this.store
      .getState()
      .setFrom(today.subtract(1, "week").format("YYYY-MM-DD"));
    this.store.getState().setTo(today.format("YYYY-MM-DD"));
  }

  public reorderLayers() {
    if (!this.map) {
      return;
    }

    const layers = [...this.store.getState().layers].sort(
      (a, b) => a.position - b.position,
    );
    let lastLayer = "";
    for (const layer of layers) {
      const { rasterLayerId, fillLayerId, lineLayerId, pointLayerId } =
        this.getLocationsLayerIds(layer.collectionId);

      // Intentional ordering of sub-layers
      for (const layerId of [
        pointLayerId,
        lineLayerId,
        fillLayerId,
        rasterLayerId,
      ]) {
        if (this.map.getLayer(layerId)) {
          if (lastLayer.length > 0) {
            this.map.moveLayer(layerId, lastLayer);
          }
          lastLayer = layerId;
        }
      }
    }
  }

  public async updateLayer(
    layer: TLayer,
    color: TLayer["color"],
    visible: TLayer["visible"],
    opacity: TLayer["opacity"],
    paletteDefinition: TLayer["paletteDefinition"],
  ): Promise<void> {
    const layerIds = this.getLocationsLayerIds(layer.collectionId);

    if (color !== layer.color) {
      if (this.map) {
        const { pointLayerId, fillLayerId, lineLayerId } = layerIds;
        if (this.map.getLayer(pointLayerId)) {
          this.map.setPaintProperty(pointLayerId, "circle-color", color);
        }
        if (this.map.getLayer(fillLayerId)) {
          this.map.setPaintProperty(fillLayerId, "fill-color", color);
        }
        if (this.map.getLayer(lineLayerId)) {
          this.map.setPaintProperty(lineLayerId, "line-color", color);
        }
      }
    }

    if (visible !== layer.visible) {
      if (this.map) {
        for (const layerId of Object.values(layerIds)) {
          if (this.map.getLayer(layerId)) {
            this.map.setLayoutProperty(
              layerId,
              "visibility",
              visible ? "visible" : "none",
            );
          }
        }
      }
    }

    if (opacity !== layer.opacity) {
      if (this.map) {
        const { fillLayerId, rasterLayerId } = layerIds;
        if (this.map.getLayer(fillLayerId)) {
          this.map.setPaintProperty(fillLayerId, "fill-opacity", opacity);
        }

        if (this.map.getLayer(rasterLayerId)) {
          this.map.setPaintProperty(rasterLayerId, "raster-opacity", opacity);
        }
      }
    }

    const paletteChanged = !isSamePalette(
      paletteDefinition,
      layer.paletteDefinition,
    );

    // If the parameters have changed, or this is a grid layer and the temporal range has updated
    // grid layers are the only instance where temporal filtering applies, requiring a new fetch
    let _color = color;

    let correctedPaletteDefinition = paletteDefinition;
    if (paletteChanged && paletteDefinition) {
      const expression = await this.styleLayer(layer, paletteDefinition, {
        updateStore: false,
      });
      if (expression) {
        _color = expression;

        if (expression.length !== paletteDefinition.count * 2 + 3) {
          const count = (expression.length - 3) / 2;

          if (isValidColorBrewerIndex(count)) {
            correctedPaletteDefinition = {
              ...paletteDefinition,
              count,
            };
            notificationManager.show(
              `Duplicate thresholds detected. Reducing to ${count} threshold(s)`,
              ENotificationType.Info,
              5000,
            );
          }
        }
      }
    }
    this.store.getState().updateLayer({
      ...layer,
      color: _color,
      visible,
      opacity,
      paletteDefinition: correctedPaletteDefinition,
    });
  }
}

export default MainManager;
