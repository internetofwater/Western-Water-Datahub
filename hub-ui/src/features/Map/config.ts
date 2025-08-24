/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataDrivenPropertyValueSpecification, LayerSpecification, Map, Popup } from 'mapbox-gl';
import { Root } from 'react-dom/client';
import { CustomListenerFunction, MainLayerDefinition } from '@/components/Map/types';

export const MAP_ID = 'main-map';

export enum LayerId {}

export enum SubLayerId {}

export const allLayerIds = [];

/**********************************************************************
 * Define the various datasources this map will use
 **********************************************************************/

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
export const getLayerConfig = (id: LayerId | SubLayerId): null | LayerSpecification => {
  switch (id) {
    default:
      return null;
  }
};

// Define and hover functions with curry-ed map and popup objects
export const getLayerHoverFunction = (id: LayerId | SubLayerId): CustomListenerFunction => {
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
export const getLayerMouseMoveFunction = (id: LayerId | SubLayerId): CustomListenerFunction => {
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
export const getLayerClickFunction = (id: LayerId | SubLayerId): CustomListenerFunction => {
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
];
