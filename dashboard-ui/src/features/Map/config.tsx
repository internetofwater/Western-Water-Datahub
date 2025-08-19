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
    BaseLayerOpacity,
    ValidStates,
    ResVizEDRReservoirSource,
} from '@/features/Map/consts';
import {
    getReservoirConfig,
    getReservoirFilter,
    getReservoirLabelLayout,
    getReservoirLabelPaint,
    getReservoirSymbolLayout,
} from '@/features/Map/utils';
import { Root } from 'react-dom/client';
import { SnotelHucMeansField } from '@/features/Map/types/snotel';
import { StateField } from '@/features/Map/types/state';
import { showReservoirPopup } from '@/features/Popups/utils';

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
            where: 'REG_NUM IN (5,6,7,8,9,10)',
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
        id: SourceId.ResvizEDRReservoirs,
        type: Sources.GeoJSON,
        definition: {
            type: 'geojson',
            data: ResVizEDRReservoirSource,
        },
    },
    {
        id: SourceId.NOAARiverForecast,
        type: Sources.GeoJSON,
        definition: {
            type: 'geojson',
            data: 'https://cache.wwdh.internetofwater.app/collections/noaa-rfc/items',
        },
    },
    {
        id: SourceId.USDroughtMonitor,
        type: Sources.Raster,
        definition: {
            type: 'raster',
            tiles: [
                'https://api.wwdh.internetofwater.app/collections/us-drought-monitor/map?f=png&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox={bbox-epsg-3857}',
            ],
            tileSize: 256,
            minzoom: 4,
        },
    },
    {
        id: SourceId.NOAAPrecipSixToTen,
        type: Sources.Raster,
        definition: {
            type: 'raster',
            tiles: [
                'https://api.wwdh.internetofwater.app/collections/noaa-precip-6-10-day/map?f=png&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox={bbox-epsg-3857}',
            ],
            tileSize: 256,
            minzoom: 3,
            maxzoom: 6,
        },
    },
    {
        id: SourceId.NOAATempSixToTen,
        type: Sources.Raster,
        definition: {
            type: 'raster',
            tiles: [
                'https://api.wwdh.internetofwater.app/collections/noaa-temp-6-10-day/map?f=png&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox={bbox-epsg-3857}',
            ],
            tileSize: 256,
            minzoom: 3,
            maxzoom: 6,
        },
    },
    {
        id: SourceId.Snotel,
        type: Sources.GeoJSON,
        definition: {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }, // Data set at runtime after combining with means
        },
    },
    {
        id: SourceId.Basins,
        type: Sources.VectorTile,
        definition: {
            type: 'vector',
            tiles: [
                `https://reference.geoconnex.us/collections/hu06/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`,
            ],
            minzoom: 0,
            maxzoom: 10,
            tileSize: 512,
            bounds: [-124.707777, 25.190876, -67.05824, 49.376613],
        },
    },
    {
        id: SourceId.States,
        type: Sources.GeoJSON,
        definition: {
            type: 'geojson',
            data: 'https://reference.geoconnex.us/collections/states/items',
            filter: [
                'in',
                ['get', StateField.Acronym],
                ['literal', ValidStates],
            ],
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
        case LayerId.Snotel:
            return 'SNOTEL';
        case LayerId.NOAARiverForecast:
            return 'NOAA RFC';
        case LayerId.USDroughtMonitor:
            return 'Drought';
        case LayerId.NOAAPrecipSixToTen:
            return 'Precipitation';
        case LayerId.NOAATempSixToTen:
            return 'Temperature';
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
            return '#000';
        case LayerId.RiseEDRReservoirs:
            return '#00F';
        case LayerId.States:
            return '#000';
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
                'source-layer': 'hu06',
                layout: {
                    visibility: 'none',
                    'line-cap': 'round',
                    'line-join': 'round',
                },
                paint: {
                    'line-opacity': 1,
                    'line-color': getLayerColor(LayerId.Basins),
                    'line-width': 2,
                },
            };
        case SubLayerId.BasinsFill:
            return {
                id: SubLayerId.BasinsFill,
                type: LayerType.Fill,
                source: SourceId.Basins,
                'source-layer': 'hu06',
                layout: {
                    visibility: 'none',
                },
                paint: {
                    'fill-color': getLayerColor(LayerId.Basins),
                    'fill-opacity': 0,
                },
            };
        case LayerId.States:
            return null;
        case SubLayerId.StatesBoundary:
            return {
                id: SubLayerId.StatesBoundary,
                type: LayerType.Line,
                source: SourceId.States,
                layout: {
                    visibility: 'none',
                    'line-cap': 'round',
                    'line-join': 'round',
                },
                paint: {
                    'line-opacity': 1,
                    'line-color': getLayerColor(LayerId.States),
                    'line-width': 3,
                },
            };
        case SubLayerId.StatesFill:
            return {
                id: SubLayerId.StatesFill,
                type: LayerType.Fill,
                source: SourceId.States,
                layout: {
                    visibility: 'none',
                },
                paint: {
                    'fill-color': getLayerColor(LayerId.States),
                    'fill-opacity': 0,
                },
            };
        case LayerId.RiseEDRReservoirs:
            return {
                id: LayerId.RiseEDRReservoirs,
                type: LayerType.Symbol,
                source: SourceId.RiseEDRReservoirs,
                filter: getReservoirFilter(
                    getReservoirConfig(SourceId.RiseEDRReservoirs)!
                ),
                layout: getReservoirSymbolLayout(
                    getReservoirConfig(SourceId.RiseEDRReservoirs)!
                ),
            };
        case SubLayerId.RiseEDRReservoirLabels:
            return {
                id: SubLayerId.RiseEDRReservoirLabels,
                type: LayerType.Symbol,
                source: SourceId.RiseEDRReservoirs,
                filter: getReservoirFilter(
                    getReservoirConfig(SourceId.RiseEDRReservoirs)!
                ),
                layout: getReservoirLabelLayout(
                    getReservoirConfig(SourceId.RiseEDRReservoirs)!
                ),
                paint: getReservoirLabelPaint(
                    getReservoirConfig(SourceId.RiseEDRReservoirs)!
                ),
            };
        case LayerId.ResvizEDRReservoirs:
            return {
                id: LayerId.ResvizEDRReservoirs,
                type: LayerType.Symbol,
                source: SourceId.ResvizEDRReservoirs,
                filter: getReservoirFilter(
                    getReservoirConfig(SourceId.ResvizEDRReservoirs)!
                ),
                layout: getReservoirSymbolLayout(
                    getReservoirConfig(SourceId.ResvizEDRReservoirs)!
                ),
            };
        case SubLayerId.ResvizEDRReservoirLabels:
            return {
                id: SubLayerId.ResvizEDRReservoirLabels,
                type: LayerType.Symbol,
                source: SourceId.ResvizEDRReservoirs,
                filter: getReservoirFilter(
                    getReservoirConfig(SourceId.ResvizEDRReservoirs)!
                ),
                layout: getReservoirLabelLayout(
                    getReservoirConfig(SourceId.ResvizEDRReservoirs)!
                ),
                paint: getReservoirLabelPaint(
                    getReservoirConfig(SourceId.ResvizEDRReservoirs)!
                ),
            };

        case LayerId.USDroughtMonitor:
            return {
                id: LayerId.USDroughtMonitor,
                type: LayerType.Raster,
                source: SourceId.USDroughtMonitor,
                paint: {
                    'raster-opacity': BaseLayerOpacity,
                },
            };
        case LayerId.NOAAPrecipSixToTen:
            return {
                id: LayerId.NOAAPrecipSixToTen,
                type: LayerType.Raster,
                source: SourceId.NOAAPrecipSixToTen,
                paint: {
                    'raster-opacity': BaseLayerOpacity,
                },
                layout: {
                    visibility: 'none',
                },
            };
        case LayerId.NOAATempSixToTen:
            return {
                id: LayerId.NOAATempSixToTen,
                type: LayerType.Raster,
                source: SourceId.NOAATempSixToTen,
                paint: {
                    'raster-opacity': BaseLayerOpacity,
                },
                layout: {
                    visibility: 'none',
                },
            };
        case LayerId.NOAARiverForecast:
            return {
                id: LayerId.NOAARiverForecast,
                type: LayerType.Circle,
                source: SourceId.NOAARiverForecast,
                paint: {
                    'circle-radius': 5,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#000',
                    'circle-color': [
                        'step',
                        ['get', 'esppavg'],
                        '#d73027',
                        25,
                        '#f46d43',
                        50,
                        '#fdae61',
                        75,
                        '#fee090',
                        90,
                        '#e0f3f8',
                        110,
                        '#abd9e9',
                        125,
                        '#74add1',
                        150,
                        '#4575b4',
                    ],
                },
                layout: {
                    visibility: 'none',
                },
            };
        case LayerId.Snotel:
            return {
                id: LayerId.Snotel,
                type: LayerType.Circle,
                source: SourceId.Snotel,
                filter: ['has', SnotelHucMeansField.SnowpackTempRelative],
                paint: {
                    'circle-radius': 5,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#000',
                    'circle-color': [
                        'step',
                        [
                            'coalesce',
                            ['get', SnotelHucMeansField.SnowpackTempRelative],
                            -1,
                        ],
                        '#fff',
                        0,
                        '#7b3294',
                        25,
                        '#c2a5cf',
                        50,
                        '#f7f7f7',
                        75,
                        '#a6dba0',
                        90,
                        '#008837',
                    ],
                },
                layout: {
                    visibility: 'none',
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
    return (
        map: Map,
        hoverPopup: Popup,
        persistentPopup: Popup,
        root: Root,
        container: HTMLDivElement
    ) => {
        switch (id) {
            case LayerId.RiseEDRReservoirs:
                return (e) => {
                    showReservoirPopup(
                        getReservoirConfig(SourceId.RiseEDRReservoirs)!,
                        map,
                        e,
                        root,
                        container,
                        hoverPopup,
                        false
                    );
                };
            case LayerId.ResvizEDRReservoirs:
                return (e) => {
                    showReservoirPopup(
                        getReservoirConfig(SourceId.ResvizEDRReservoirs)!,
                        map,
                        e,
                        root,
                        container,
                        hoverPopup,
                        false
                    );
                };
            default:
                return (e) => {
                    console.log('Hover Event Triggered: ', e);
                    console.log('The map: ', map);
                    console.log('Available Popups: ');
                    console.log('Hover: ', hoverPopup);
                    console.log('Persistent: ', persistentPopup);
                    console.log('Content Root: ', root);
                    console.log('Content Container: ', container);

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
    return (
        map: Map,
        hoverPopup: Popup,
        persistentPopup: Popup,
        root: Root,
        container: HTMLDivElement
    ) => {
        switch (id) {
            default:
                return (e) => {
                    console.log('Hover Exit Event Triggered: ', e);
                    console.log('The map: ', map);
                    console.log('Available Popups: ');
                    console.log('Hover: ', hoverPopup);
                    console.log('Persistent: ', persistentPopup);
                    console.log('Content Root: ', root);
                    console.log('Content Container: ', container);
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
    return (
        map: Map,
        hoverPopup: Popup,
        persistentPopup: Popup,
        root: Root,
        container: HTMLDivElement
    ) => {
        switch (id) {
            case LayerId.RiseEDRReservoirs:
                return (e) => {
                    showReservoirPopup(
                        getReservoirConfig(SourceId.RiseEDRReservoirs)!,
                        map,
                        e,
                        root,
                        container,
                        hoverPopup,
                        true
                    );
                };
            case LayerId.ResvizEDRReservoirs:
                return (e) => {
                    showReservoirPopup(
                        getReservoirConfig(SourceId.ResvizEDRReservoirs)!,
                        map,
                        e,
                        root,
                        container,
                        hoverPopup,
                        true
                    );
                };
            default:
                return (e) => {
                    console.log('Hover Exit Event Triggered: ', e);
                    console.log('The map: ', map);
                    console.log('Available Popups: ');
                    console.log('Hover: ', hoverPopup);
                    console.log('Persistent: ', persistentPopup);
                    console.log('Content Root: ', root);
                    console.log('Content Container: ', container);
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
    return (
        map: Map,
        hoverPopup: Popup,
        persistentPopup: Popup,
        root: Root,
        container: HTMLDivElement
    ) => {
        switch (id) {
            default:
                return (e) => {
                    console.log('Click Event Triggered: ', e);
                    console.log('The map: ', map);
                    console.log('Available Popups: ');
                    console.log('Hover: ', hoverPopup);
                    console.log('Persistent: ', persistentPopup);
                    console.log('Content Root: ', root);
                    console.log('Content Container: ', container);
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
        id: LayerId.USDroughtMonitor,
        config: getLayerConfig(LayerId.USDroughtMonitor),
        controllable: false,
        legend: false,
    },
    {
        id: LayerId.NOAAPrecipSixToTen,
        config: getLayerConfig(LayerId.NOAAPrecipSixToTen),
        controllable: false,
        legend: false,
    },
    {
        id: LayerId.NOAATempSixToTen,
        config: getLayerConfig(LayerId.NOAATempSixToTen),
        controllable: false,
        legend: false,
    },
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
        id: LayerId.States,
        config: getLayerConfig(LayerId.States),
        controllable: false,
        legend: false,
        subLayers: [
            {
                id: SubLayerId.StatesBoundary,
                config: getLayerConfig(SubLayerId.StatesBoundary),
                controllable: false,
                legend: false,
            },
            {
                id: SubLayerId.StatesFill,
                config: getLayerConfig(SubLayerId.StatesFill),
                controllable: false,
                legend: false,
                clickFunction: getLayerClickFunction(SubLayerId.StatesFill),
            },
        ],
    },
    {
        id: LayerId.NOAARiverForecast,
        config: getLayerConfig(LayerId.NOAARiverForecast),
        controllable: false,
        legend: false,
        clickFunction: getLayerClickFunction(LayerId.NOAARiverForecast),
    },
    {
        id: LayerId.Snotel,
        config: getLayerConfig(LayerId.Snotel),
        controllable: false,
        legend: false,
        clickFunction: getLayerClickFunction(LayerId.Snotel),
    },
    // {
    //     id: LayerId.RiseEDRReservoirs,
    //     config: getLayerConfig(LayerId.RiseEDRReservoirs),
    //     controllable: false,
    //     legend: false,
    //     hoverFunction: getLayerHoverFunction(LayerId.RiseEDRReservoirs),
    //     mouseMoveFunction: getLayerMouseMoveFunction(LayerId.RiseEDRReservoirs),
    //     subLayers: [
    //         {
    //             id: SubLayerId.RiseEDRReservoirLabels,
    //             config: getLayerConfig(SubLayerId.RiseEDRReservoirLabels),
    //             controllable: false,
    //             legend: false,
    //         },
    //     ],
    //     // hoverFunction: getLayerHoverFunction(LayerId.Reservoirs),
    // },
    {
        id: LayerId.ResvizEDRReservoirs,
        config: getLayerConfig(LayerId.ResvizEDRReservoirs),
        controllable: false,
        legend: false,
        hoverFunction: getLayerHoverFunction(LayerId.ResvizEDRReservoirs),
        mouseMoveFunction: getLayerMouseMoveFunction(
            LayerId.ResvizEDRReservoirs
        ),
        subLayers: [
            {
                id: SubLayerId.ResvizEDRReservoirLabels,
                config: getLayerConfig(SubLayerId.ResvizEDRReservoirLabels),
                controllable: false,
                legend: false,
            },
        ],
        // hoverFunction: getLayerHoverFunction(LayerId.Reservoirs),
    },
];
