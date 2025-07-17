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
    ZoomCapacityArray,
    BaseLayerOpacity,
    ValidStates,
} from '@/features/Map/consts';
import {
    getReservoirConfig,
    getReservoirIconImageExpression,
} from '@/features/Map/utils';
import { Root } from 'react-dom/client';
import { ReservoirPopup } from '../Popups/Reservoirs';
import { Feature, Point } from 'geojson';
import { MantineProvider } from '@mantine/core';
import { SnotelHucMeansField } from './types/snotel';
import { StateField } from './types/state';

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
        id: SourceId.NOAARiverForecast,
        type: Sources.GeoJSON,
        definition: {
            type: 'geojson',
            data: 'https://cache.wwdh.internetofwater.app/collections/noaa-rfc/items?f=json&limit=10000',
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
            data: 'https://reference.geoconnex.us/collections/states/items?f=json',
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
                    'line-width': 3,
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
                layout: {
                    'icon-image': getReservoirIconImageExpression(
                        getReservoirConfig(SourceId.RiseEDRReservoirs)!
                    ),
                    'icon-size': [
                        'let',
                        'capacity',
                        [
                            'coalesce',
                            [
                                'get',
                                getReservoirConfig(SourceId.RiseEDRReservoirs)!
                                    .capacityProperty,
                            ],
                            1,
                        ],
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
                        [
                            'get',
                            getReservoirConfig(SourceId.RiseEDRReservoirs)!
                                .capacityProperty,
                        ],
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
                    'text-field': [
                        'get',
                        getReservoirConfig(SourceId.RiseEDRReservoirs)!
                            .labelProperty,
                    ],
                    'text-anchor': 'bottom',
                    'text-size': 18,
                    'symbol-sort-key': [
                        'coalesce',
                        [
                            'get',
                            getReservoirConfig(SourceId.RiseEDRReservoirs)!
                                .capacityProperty,
                        ],
                        1,
                    ],
                    'text-offset': [
                        'let',
                        'capacity',
                        [
                            'coalesce',
                            [
                                'get',
                                getReservoirConfig(SourceId.RiseEDRReservoirs)!
                                    .capacityProperty,
                            ],
                            1,
                        ],
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
                    'text-color': '#000',
                    'text-opacity': [
                        'let',
                        'capacity',
                        [
                            'coalesce',
                            [
                                'get',
                                getReservoirConfig(SourceId.RiseEDRReservoirs)!
                                    .capacityProperty,
                            ],
                            1,
                        ],
                        [
                            'step',
                            ['zoom'],
                            0,
                            ...ZoomCapacityArray.flatMap(([zoom, capacity]) => [
                                zoom, // At this zoom
                                [
                                    // Evaluate this expression
                                    'case',
                                    ['>=', ['var', 'capacity'], capacity],
                                    1, // If GTE capacity, evaluate sub-step expression
                                    0, // Fallback to basic point symbol
                                ],
                            ]),
                        ],
                    ],
                    'text-halo-color': '#fff',
                    'text-halo-width': 2,
                },
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
                    if (e.features && e.features.length > 0) {
                        const feature = e.features[0] as Feature<Point>;

                        if (feature.properties) {
                            const config = getReservoirConfig(
                                SourceId.RiseEDRReservoirs
                            )!;
                            const identifier = String(
                                feature.properties[config.identifierProperty]
                            );

                            container.setAttribute(
                                'data-identifier',
                                identifier
                            );

                            root.render(
                                <MantineProvider>
                                    <ReservoirPopup
                                        config={config}
                                        reservoirProperties={feature.properties}
                                    />
                                </MantineProvider>
                            );

                            const center = feature.geometry.coordinates as [
                                number,
                                number
                            ];
                            hoverPopup
                                .setLngLat(center)
                                .setDOMContent(container)
                                .setMaxWidth('fit-content')
                                .addTo(map);
                        }
                    }
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
                    if (e.features && e.features.length > 0) {
                        const feature = e.features[0] as Feature<Point>;

                        if (feature.properties) {
                            const config = getReservoirConfig(
                                SourceId.RiseEDRReservoirs
                            )!;
                            const identifier = String(
                                feature.properties[config.identifierProperty]
                            );
                            const currentIdentifier =
                                container.getAttribute('data-identifier');
                            // Dont recreate the same popup for the same feature
                            if (identifier !== currentIdentifier) {
                                container.setAttribute(
                                    'data-identifier',
                                    identifier
                                );

                                root.render(
                                    <MantineProvider>
                                        <ReservoirPopup
                                            config={config}
                                            reservoirProperties={
                                                feature.properties
                                            }
                                        />
                                    </MantineProvider>
                                );

                                const center = feature.geometry.coordinates as [
                                    number,
                                    number
                                ];
                                hoverPopup
                                    .setLngLat(center)
                                    .setDOMContent(container)
                                    .setMaxWidth('fit-content')
                                    .addTo(map);
                            }
                        }
                    }
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
    {
        id: LayerId.RiseEDRReservoirs,
        config: getLayerConfig(LayerId.RiseEDRReservoirs),
        controllable: false,
        legend: false,
        hoverFunction: getLayerHoverFunction(LayerId.RiseEDRReservoirs),
        mouseMoveFunction: getLayerMouseMoveFunction(LayerId.RiseEDRReservoirs),
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
