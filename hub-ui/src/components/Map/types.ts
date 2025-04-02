import { FeatureServiceOptions } from '@hansdo/mapbox-gl-arcgis-featureserver';
import {
    GeoJSONSource,
    VectorTileSource as VectorSource,
    RasterTileSource as RasterSource,
    ImageSource,
    VideoSource,
    SourceSpecification,
    LayerSpecification,
    MapOptions,
    MapMouseEvent,
    Map,
    Popup,
    FullscreenControlOptions,
    NavigationControlOptions,
    ScaleControlOptions,
} from 'mapbox-gl';

/**
 * Defines the possible types of sources that can be used in the map.
 *
 * Types:
 * - GeoJSONSource: Represents a GeoJSON source.
 * - VectorSource: Represents a vector tile source.
 * - RasterSource<'raster'>: Represents a raster tile source.
 * - ImageSource: Represents an image source.
 * - VideoSource: Represents a video source.
 * @type
 */
export type SourceDefinition =
    | GeoJSONSource
    | VectorSource
    | RasterSource<'raster'>
    | ImageSource
    | VideoSource;

/**
 * Defines the types of sources that can be used in the map.
 *
 * Values:
 * - GeoJSON: Represents a GeoJSON source.
 * - VectorTile: Represents a vector tile source.
 * - ESRI: Represents an ESRI feature service source.
 *
 * @enum
 */
export enum Sources {
    GeoJSON = 'geojson',
    VectorTile = 'vector-tile',
    ESRI = 'esri',
}

/**
 * Defines the configuration for a source in the map.
 *
 * Properties:
 * - id: string - The unique identifier for the source.
 * - type: Sources - The type of the source.
 * - definition: SourceSpecification | FeatureServiceOptions - The specification or options for the source.
 *
 * @type
 */
export type SourceConfig = {
    id: string;
    type: Sources;
    definition: SourceSpecification | FeatureServiceOptions;
};

/**
 * Defines a custom listener function for map events.
 *
 * Parameters:
 * - map: Map - The Mapbox GL JS map instance.
 * - hoverPopup: Popup - The popup displayed on hover.
 * - persistentPopup: Popup - The popup displayed persistently.
 *
 * Returns:
 * - (e: MapMouseEvent) => void - A function that handles the map mouse event.
 *
 * @type
 */
export type CustomListenerFunction = (
    map: Map,
    hoverPopup: Popup,
    persistentPopup: Popup
) => (e: MapMouseEvent) => void;

/**
 * Defines the configuration for a layer in the map.
 *
 * Properties:
 * - id: string - The unique identifier for the layer.
 * - controllable: boolean - Whether the layer is controllable by the user.
 * - legend: boolean - Whether the layer should be displayed in the legend.
 * - config: LayerSpecification | null - The configuration object for the layer.
 * - hoverFunction?: CustomListenerFunction - Optional function to handle hover events.
 * - customHoverExitFunction?: CustomListenerFunction - Optional function to handle hover exit events.
 * - clickFunction?: CustomListenerFunction - Optional function to handle click events.
 * - mouseMoveFunction?: CustomListenerFunction - Optional function to handle mouse move events.
 *
 * @type
 */
export type LayerDefinition = {
    id: string;
    controllable: boolean;
    legend: boolean;
    config: LayerSpecification | null;
    hoverFunction?: CustomListenerFunction;
    customHoverExitFunction?: CustomListenerFunction;
    clickFunction?: CustomListenerFunction;
    mouseMoveFunction?: CustomListenerFunction;
};

/**
 * Extends LayerDefinition to include sublayers.
 *
 * Properties:
 * - subLayers?: LayerDefinition[] - Optional array of sublayer definitions.
 *
 * @type
 */
export type MainLayerDefinition = LayerDefinition & {
    subLayers?: LayerDefinition[];
};

/**
 * Defines the properties for the map component.
 *
 * Properties:
 * - accessToken: string - The access token for the map service.
 * - id: string - The unique identifier for the map component.
 * - sources: SourceConfig[] - Array of source configurations for the map.
 * - layers: MainLayerDefinition[] - Array of layer definitions for the map.
 * - options: Omit<MapOptions, 'container'> - Map options excluding the container property.
 * - controls?: {
 *     navigationControl?: NavigationControlOptions | boolean;
 *     scaleControl?: ScaleControlOptions | boolean;
 *     fullscreenControl?: FullscreenControlOptions | boolean;
 * } - Optional map controls configuration.
 *
 * @interface
 */
export interface MapComponentProps {
    accessToken: string;
    id: string;
    sources: SourceConfig[];
    layers: MainLayerDefinition[];
    options: Omit<MapOptions, 'container'>;
    controls?: {
        navigationControl?: NavigationControlOptions | boolean;
        scaleControl?: ScaleControlOptions | boolean;
        fullscreenControl?: FullscreenControlOptions | boolean;
    };
}

/**
 * Defines the identifiers for different basemap styles.
 *
 * Values:
 * - Standard: Represents the standard basemap style.
 * - StandardSatellite: Represents the standard satellite basemap style.
 * - Streets: Represents the streets basemap style.
 * - Outdoors: Represents the outdoors basemap style.
 * - Light: Represents the light basemap style.
 * - Dark: Represents the dark basemap style.
 * - Satellite: Represents the satellite basemap style.
 * - SatelliteStreets: Represents the satellite streets basemap style.
 * - NavigationDay: Represents the navigation day basemap style.
 * - NavigationNight: Represents the navigation night basemap style.
 *
 * @enum
 */
export enum BasemapId {
    Standard = 'standard',
    StandardSatellite = 'standard-satellite',
    Streets = 'streets',
    Outdoors = 'outdoors',
    Light = 'light',
    Dark = 'dark',
    Satellite = 'satellite',
    SatelliteStreets = 'satellite-streets',
    NavigationDay = 'navigation-day',
    NavigationNight = 'navigation-night',
}

/**
 * Defines the URLs for different basemap styles.
 *
 * Values:
 * - 'mapbox://styles/mapbox/standard'
 * - 'mapbox://styles/mapbox/standard-satellite'
 * - 'mapbox://styles/mapbox/streets-v12'
 * - 'mapbox://styles/mapbox/outdoors-v12'
 * - 'mapbox://styles/mapbox/light-v11'
 * - 'mapbox://styles/mapbox/dark-v11'
 * - 'mapbox://styles/mapbox/satellite-v9'
 * - 'mapbox://styles/mapbox/satellite-streets-v12'
 * - 'mapbox://styles/mapbox/navigation-day-v1'
 * - 'mapbox://styles/mapbox/navigation-night-v1'
 *
 * @type
 */
export type BasemapStyles =
    | 'mapbox://styles/mapbox/standard'
    | 'mapbox://styles/mapbox/standard-satellite'
    | 'mapbox://styles/mapbox/streets-v12'
    | 'mapbox://styles/mapbox/outdoors-v12'
    | 'mapbox://styles/mapbox/light-v11'
    | 'mapbox://styles/mapbox/dark-v11'
    | 'mapbox://styles/mapbox/satellite-v9'
    | 'mapbox://styles/mapbox/satellite-streets-v12'
    | 'mapbox://styles/mapbox/navigation-day-v1'
    | 'mapbox://styles/mapbox/navigation-night-v1';

/**
 * Defines the mapping of basemap identifiers to their corresponding styles.
 *
 * Properties:
 * - [key in BasemapId]: BasemapStyles - The basemap style for each basemap identifier.
 *
 * @type
 */
export type Basemaps = {
    [key in BasemapId]: BasemapStyles;
};

/**
 * Defines the types of layers that can be used in the map.
 *
 * Values:
 * - Line: Represents a line layer.
 * - Symbol: Represents a symbol layer.
 * - Circle: Represents a circle layer.
 * - Fill: Represents a fill layer.
 *
 * @enum
 */
export enum LayerType {
    Line = 'line',
    Symbol = 'symbol',
    Circle = 'circle',
    Fill = 'fill',
}
