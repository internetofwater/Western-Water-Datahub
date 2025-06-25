/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
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
import {
    SubLayerId,
    LayerId,
    SourceId,
    RISEEDRReservoirSource,
    RegionsSource,
} from '@/features/Map/consts';
import {
    getReservoirConfig,
    getReservoirIconImageExpression,
} from '@/features/Map/utils';

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
            url: RegionsSource,
        },
    },
    {
        id: SourceId.RiseEDRReservoirs,
        type: Sources.GeoJSON,
        definition: {
            type: 'geojson',

            data: RISEEDRReservoirSource,
            filter: ['!=', ['get', '_id'], 3688],
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
            return '#000';
        case LayerId.Basins:
            return '#0F0';
        case LayerId.RiseEDRReservoirs:
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
                    'fill-opacity': 0,
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
        case LayerId.RiseEDRReservoirs:
            return {
                id: LayerId.RiseEDRReservoirs,
                type: LayerType.Symbol,
                source: SourceId.RiseEDRReservoirs,
                layout: {
                    'icon-image': getReservoirIconImageExpression(
                        getReservoirConfig(SourceId.RiseEDRReservoirs)!
                    ),
                    'icon-size': [
                        'let',
                        'capacity',
                        ['coalesce', ['get', 'Active Capacity'], 1],
                        [
                            'step',
                            ['zoom'],
                            1,
                            0,
                            [
                                'step',
                                ['var', 'capacity'],
                                0.3,
                                45000,
                                0.4,
                                320000,
                                0.3,
                                2010000,
                                0.5,
                            ],
                            5,
                            [
                                'step',
                                ['var', 'capacity'],
                                0.3,
                                45000,
                                0.3,
                                320000,
                                0.4,
                                2010000,
                                0.5,
                            ],
                            8,
                            [
                                'step',
                                ['var', 'capacity'],
                                0.3,
                                45000,
                                0.4,
                                320000,
                                0.5,
                                2010000,
                                0.6,
                            ],
                        ],
                    ],

                    'symbol-sort-key': [
                        'coalesce',
                        ['get', 'Active Capacity'],
                        1,
                    ],
                    'icon-offset': [
                        'step',
                        ['zoom'],
                        [0, 0],
                        0,
                        ['coalesce', ['get', 'offset'], [0, 0]],
                        5,
                        [0, 0],
                    ],
                    'icon-allow-overlap': true,
                },
            };
        case SubLayerId.RiseEDRReservoirLabels:
            return {
                id: SubLayerId.RiseEDRReservoirLabels,
                type: LayerType.Symbol,
                source: SourceId.RiseEDRReservoirs,
                layout: {
                    'text-field': ['get', 'Asset Name (in tessel)'],
                    'text-anchor': 'bottom',
                    'text-size': 14,
                    'symbol-sort-key': [
                        'coalesce',
                        ['get', 'Active Capacity'],
                        1,
                    ],
                    'text-offset': [
                        'let',
                        'capacity',
                        ['coalesce', ['get', 'Active Capacity'], 1],
                        [
                            'step',
                            ['zoom'],
                            [0, 0],
                            0,
                            [
                                'step',
                                ['var', 'capacity'],
                                [0, 0.5],
                                45000,
                                [0, 1],
                                320000,
                                [0, 2.4],
                                2010000,
                                [0, 3.2],
                            ],
                            5,
                            [
                                'step',
                                ['var', 'capacity'],
                                [0, 0.5],
                                45000,
                                [0, 2.1],
                                320000,
                                [0, 2.8],
                                2010000,
                                [0, 3.2],
                            ],
                            8,
                            [
                                'step',
                                ['var', 'capacity'],
                                [0, 2.4],
                                45000,
                                [0, 2.8],
                                320000,
                                [0, 3.2],
                                2010000,
                                [0, 3.5],
                            ],
                        ],
                    ],
                },
                paint: {
                    'text-color': getLayerColor(
                        SubLayerId.RiseEDRReservoirLabels
                    ),
                    'text-opacity': [
                        'let',
                        'capacity',
                        ['coalesce', ['get', 'Active Capacity'], 1],
                        [
                            'step',
                            ['zoom'],
                            0,
                            0,
                            [
                                'step',
                                ['var', 'capacity'],
                                0,
                                45000,
                                0,
                                320000,
                                1,
                                2010000,
                                1,
                            ],
                            5,
                            [
                                'step',
                                ['var', 'capacity'],
                                0,
                                45000,
                                1,
                                320000,
                                1,
                                2010000,
                                1,
                            ],
                            8,
                            1,
                        ],
                    ],
                    'text-halo-blur': 1,
                    'text-halo-color': '#000000',
                    'text-halo-width': 2,
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
                // hoverFunction: getLayerHoverFunction(SubLayerId.RegionsFill),
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
            },
        ],
    },
    {
        id: LayerId.RiseEDRReservoirs,
        config: getLayerConfig(LayerId.RiseEDRReservoirs),
        controllable: false,
        legend: false,
        clickFunction: getLayerClickFunction(LayerId.RiseEDRReservoirs),
        hoverFunction: getLayerHoverFunction(LayerId.RiseEDRReservoirs),
        subLayers: [
            {
                id: SubLayerId.RiseEDRReservoirLabels,
                config: getLayerConfig(SubLayerId.RiseEDRReservoirLabels),
                controllable: false,
                legend: false,
            },
        ],
        // hoverFunction: getLayerHoverFunction(LayerId.Reservoirs),
    },
];
