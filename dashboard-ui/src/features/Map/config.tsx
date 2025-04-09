import {
    BasemapId,
    CustomListenerFunction,
    LayerType,
    MainLayerDefinition,
    SourceConfig,
    Sources,
} from '@/components/Map/types';
import {
    DataDrivenPropertyValueSpecification,
    LayerSpecification,
    Map,
    Popup,
} from 'mapbox-gl';
import { basemaps } from '@/components/Map/consts';

export const MAP_ID = 'main';

export const BASEMAP = basemaps[BasemapId.Dark];

export enum SourceId {
    Regions = 'regions-source',
    Basins = 'hu04',
    Reservoirs = 'reservoirs-source',
}

export enum LayerId {
    Regions = 'regions-main',
    Basins = 'basins-main',
    Reservoirs = 'reservoirs',
}

export enum SubLayerId {
    RegionsBoundary = 'regions-boundary',
    RegionsFill = 'regions-fill',
    BasinsBoundary = 'basins-boundary',
    BasinsFill = 'basins-fill',
}

export const allLayerIds = [
    ...Object.values(LayerId),
    ...Object.values(SubLayerId),
];

/**********************************************************************
 * Define the various datasources this map will use
 **********************************************************************/

/**
 * Configurations for sources in the map. Supports GeoJSON, VectorTile, and Esri Feature Service sources
 *
 * @constant
 */
export const sourceConfigs: SourceConfig[] = [
    {
        id: SourceId.Regions,
        type: Sources.ESRI,
        definition: {
            url: 'https://services1.arcgis.com/ixD30sld6F8MQ7V5/arcgis/rest/services/ReclamationBoundariesFL/FeatureServer/0',
        },
    },
    {
        id: SourceId.Reservoirs,
        type: Sources.ESRI,
        definition: {
            url: 'https://services1.arcgis.com/ixD30sld6F8MQ7V5/arcgis/rest/services/RISE_point_locations_(view)/FeatureServer/0',
            where: "type='Lake/Reservoir' AND locName like '%Reservoir%'",
        },
    },
    {
        id: SourceId.Basins,
        type: Sources.VectorTile,
        definition: {
            type: 'vector',
            tiles: [
                `https://reference.geoconnex.dev/collections/hu04/tiles/WebMercatorQuad/{z}/{x}/{y}?f=mvt`,
            ],
            minzoom: 0,

            maxzoom: 10,
            tileSize: 512,
            bounds: [-179.229468, -14.42442, 179.856484, 71.439451],
        },
    },
];

/**********************************************************************
 * Create helper functions to group layer logic
 **********************************************************************/
/**
 * Returns the display name for a given layer or sublayer based on its identifier.
 *
 * Parameters:
 * - layerId: LayerId | SubLayerId - The identifier for the layer or sublayer.
 *
 * Returns:
 * - string - The display name for the specified layer or sublayer.
 *
 * @function
 */
export const getLayerName = (layerId: LayerId | SubLayerId): string => {
    switch (layerId) {
        case LayerId.Regions:
            return 'Regions';
        default:
            return '';
    }
};

/**
 * Returns the color for a given layer or sublayer based on its identifier.
 * It defines the color values for each layer, including special cases for data-driven properties.
 *
 * Parameters:
 * - id: LayerId | SubLayerId - The identifier for the layer or sublayer.
 *
 * Returns:
 * - DataDrivenPropertyValueSpecification<string> - The color value or expression for the specified layer or sublayer.
 *
 * @function
 */
export const getLayerColor = (
    id: LayerId | SubLayerId
): DataDrivenPropertyValueSpecification<string> => {
    switch (id) {
        case LayerId.Regions:
            return '#F00';
        case LayerId.Basins:
            return '#0F0';
        case LayerId.Reservoirs:
            return '#00F';
        default:
            return '#FFF';
    }
};

/**
 * Returns the configuration for a given layer or sublayer in the map.
 * It defines the properties such as id, type, source, layout, filter, and paint for each layer.
 *
 * Parameters:
 * - id: LayerId | SubLayerId - The identifier for the layer or sublayer.
 *
 * Returns:
 * - LayerSpecification | null - The configuration object for the specified layer or sublayer, or null if no configuration is needed.
 *
 * @function
 */
export const getLayerConfig = (
    id: LayerId | SubLayerId
): null | LayerSpecification => {
    // Group layer and sublayer configurations together
    switch (id) {
        case LayerId.Regions:
            return null;
        case SubLayerId.RegionsBoundary:
            return {
                id: SubLayerId.RegionsBoundary,
                type: LayerType.Line,
                source: SourceId.Regions,
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round',
                },
                paint: {
                    'line-opacity': 1,
                    'line-color': getLayerColor(LayerId.Regions),
                    'line-width': 3,
                },
            };
        case SubLayerId.RegionsFill:
            return {
                id: SubLayerId.RegionsFill,
                type: LayerType.Fill,
                source: SourceId.Regions,
                paint: {
                    'fill-color': getLayerColor(LayerId.Regions),
                    'fill-opacity': 0.3,
                },
            };
        case LayerId.Basins:
            return null;
        case SubLayerId.BasinsBoundary:
            return {
                id: SubLayerId.BasinsBoundary,
                type: LayerType.Line,
                source: SourceId.Basins,
                'source-layer': 'hu04',
                layout: {
                    visibility: 'none',
                    'line-cap': 'round',
                    'line-join': 'round',
                },
                paint: {
                    'line-opacity': 1,
                    'line-color': getLayerColor(LayerId.Basins),
                    'line-width': 3,
                },
            };
        case SubLayerId.BasinsFill:
            return {
                id: SubLayerId.BasinsFill,
                type: LayerType.Fill,
                source: SourceId.Basins,
                'source-layer': 'hu04',
                layout: {
                    visibility: 'none',
                },
                paint: {
                    'fill-color': getLayerColor(LayerId.Basins),
                    'fill-opacity': 0.3,
                },
            };
        case LayerId.Reservoirs:
            return {
                id: LayerId.Reservoirs,
                type: LayerType.Symbol,
                source: SourceId.Reservoirs,
                layout: {
                    'icon-image': [
                        'let',
                        'storage', // Variable name
                        ['/', ['get', 'elev_ft'], 10000], // Variable value
                        [
                            'step',
                            ['var', 'storage'],
                            'default', // Below first step value
                            0.75,
                            'teacup-75',
                            0.8,
                            'teacup-80',
                            0.85,
                            'teacup-85',
                            0.9,
                            'teacup-90',
                            0.95,
                            'teacup-95',
                            1,
                            'teacup-100',
                        ],
                    ],
                    'icon-size': 0.5,
                    'icon-allow-overlap': true,
                },
            };
        default:
            return null;
    }
};

// Define and hover functions with curry-ed map and popup objects
export const getLayerHoverFunction = (
    id: LayerId | SubLayerId
): CustomListenerFunction => {
    return (map: Map, hoverPopup: Popup, persistentPopup: Popup) => {
        switch (id) {
            default:
                return (e) => {
                    console.log('Hover Event Triggered: ', e);
                    console.log('The map: ', map);
                    console.log('Available Popups: ');
                    console.log('Hover: ', hoverPopup);
                    console.log('Persistent: ', persistentPopup);

                    map.getCanvas().style.cursor = 'pointer';
                };
        }
    };
};

/**
 * Custom functionality for when the `mouseleave` event fires on this layer.
 * If not defined, defaults to unsetting the cursor and removing the hoverpopup
 *
 * Parameters:
 * - id: LayerId | SubLayerId - The identifier for the layer or sublayer.
 *
 * Returns:
 * - CustomListenerFunction - A function that handles the hover exit event for the specified layer or sublayer.
 *
 * @function
 */
export const getLayerCustomHoverExitFunction = (
    id: LayerId | SubLayerId
): CustomListenerFunction => {
    return (map: Map, hoverPopup: Popup, persistentPopup: Popup) => {
        switch (id) {
            default:
                return (e) => {
                    console.log('Hover Exit Event Triggered: ', e);
                    console.log('The map: ', map);
                    console.log('Available Popups: ');
                    console.log('Hover: ', hoverPopup);
                    console.log('Persistent: ', persistentPopup);
                };
        }
    };
};

/**
 * Custom functionality for when the `mousemove` event fires on this layer. This event is triggered when
 * hovering over features without the cursor leaving the layer.
 *
 * Parameters:
 * - id: LayerId | SubLayerId - The identifier for the layer or sublayer.
 *
 * Returns:
 * - CustomListenerFunction - A function that handles the mouse move event for the specified layer or sublayer.
 *
 * @function
 */
export const getLayerMouseMoveFunction = (
    id: LayerId | SubLayerId
): CustomListenerFunction => {
    return (map: Map, hoverPopup: Popup, persistentPopup: Popup) => {
        switch (id) {
            default:
                return (e) => {
                    console.log('Hover Exit Event Triggered: ', e);
                    console.log('The map: ', map);
                    console.log('Available Popups: ');
                    console.log('Hover: ', hoverPopup);
                    console.log('Persistent: ', persistentPopup);
                };
        }
    };
};

/**
 * Custom functionality for when the `click` event fires on this layer.
 *
 * Parameters:
 * - id: LayerId | SubLayerId - The identifier for the layer or sublayer.
 *
 * Returns:
 * - CustomListenerFunction - A function that handles the click event for the specified layer or sublayer.
 *
 * @function
 */
export const getLayerClickFunction = (
    id: LayerId | SubLayerId
): CustomListenerFunction => {
    return (map: Map, hoverPopup: Popup, persistentPopup: Popup) => {
        switch (id) {
            default:
                return (e) => {
                    console.log('Click Event Triggered: ', e);
                    console.log('The map: ', map);
                    console.log('Available Popups: ');
                    console.log('Hover: ', hoverPopup);
                    console.log('Persistent: ', persistentPopup);
                };
        }
    };
};

/**
 * Contains the definitions for main layers and sublayers in the map.
 * Each layer definition includes properties such as id, controllable, legend, config, and optional event handler functions.
 *
 * LayerDefinition Type:
 * - id: string - The identifier for the layer or sublayer.
 * - controllable: boolean - Whether the layers visibility can be toggled by the user.
 * - legend: boolean - Whether the layer should be displayed in the legend.
 * - config: LayerSpecification | null - The configuration object for the layer or sublayer.
 * - hoverFunction?: CustomListenerFunction - Optional function to handle hover events.
 * - customHoverExitFunction?: CustomListenerFunction - Optional function to handle hover exit events.
 * - clickFunction?: CustomListenerFunction - Optional function to handle click events.
 * - mouseMoveFunction?: CustomListenerFunction - Optional function to handle mouse move events.
 *
 * MainLayerDefinition Type:
 * Contains the above type values and an additional optional array
 * - subLayers?: LayerDefinition[] - Optional array of sublayer definitions.
 *
 *
 * @constant
 */
export const layerDefinitions: MainLayerDefinition[] = [
    // Use this as the master object to define layer hierarchies. Sublayers are nested layer definitions,
    // meaning they have their own click and hover listeners. The order of layers and sublayers dictates the draw
    // order on the map.
    {
        id: LayerId.Regions,
        config: getLayerConfig(LayerId.Regions),
        controllable: false,
        legend: false,
        subLayers: [
            {
                id: SubLayerId.RegionsBoundary,
                config: getLayerConfig(SubLayerId.RegionsBoundary),
                controllable: false,
                legend: false,
            },
            {
                id: SubLayerId.RegionsFill,
                config: getLayerConfig(SubLayerId.RegionsFill),
                controllable: false,
                legend: false,
                clickFunction: getLayerClickFunction(SubLayerId.RegionsFill),
                hoverFunction: getLayerHoverFunction(SubLayerId.RegionsFill),
            },
        ],
    },
    {
        id: LayerId.Basins,
        config: getLayerConfig(LayerId.Basins),
        controllable: false,
        legend: false,
        subLayers: [
            {
                id: SubLayerId.BasinsBoundary,
                config: getLayerConfig(SubLayerId.BasinsBoundary),
                controllable: false,
                legend: false,
            },
            {
                id: SubLayerId.BasinsFill,
                config: getLayerConfig(SubLayerId.BasinsFill),
                controllable: false,
                legend: false,
                clickFunction: getLayerClickFunction(SubLayerId.BasinsFill),
                hoverFunction: getLayerHoverFunction(SubLayerId.BasinsFill),
            },
        ],
    },
    {
        id: LayerId.Reservoirs,
        config: getLayerConfig(LayerId.Reservoirs),
        controllable: false,
        legend: false,
        clickFunction: getLayerClickFunction(LayerId.Reservoirs),
        hoverFunction: getLayerHoverFunction(LayerId.Reservoirs),
    },
];
