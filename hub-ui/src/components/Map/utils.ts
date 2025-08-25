/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureServiceOptions } from '@hansdo/mapbox-gl-arcgis-featureserver';
import {
  FullscreenControl,
  Map,
  NavigationControl,
  Popup,
  ScaleControl,
  SourceSpecification,
} from 'mapbox-gl';
import { Root } from 'react-dom/client';
import {
  MainLayerDefinition,
  MapComponentProps,
  SourceConfig,
  Sources,
} from '@/components/Map/types';

/**
 * Adds sources to the map based on the provided source configurations.
 *
 * @param {Map} map - The Mapbox map instance.
 * @param {SourceConfig[]} sourceConfigs - Array of source configurations.
 * @param {function(string, Map, FeatureServiceOptions): void} featureService - Function to add ESRI feature services to the map.
 */
export const addSources = (
  map: Map,
  sourceConfigs: SourceConfig[],
  featureService: (sourceId: string, map: Map, options: FeatureServiceOptions) => void
) => {
  sourceConfigs.forEach((sourceConfig) => {
    switch (sourceConfig.type) {
      case Sources.ESRI:
        if (!map.getSource(sourceConfig.id)) {
          featureService(sourceConfig.id, map, sourceConfig.definition as FeatureServiceOptions);
        }
        break;

      case Sources.VectorTile:
        if (!map.getSource(sourceConfig.id)) {
          map.addSource(sourceConfig.id, sourceConfig.definition as SourceSpecification);
        }
        break;
      case Sources.GeoJSON:
      default:
        if (!map.getSource(sourceConfig.id)) {
          map.addSource(sourceConfig.id, sourceConfig.definition as SourceSpecification);
        }
        break;
    }
  });
};

/**
 * Adds layers to the map based on the provided layer definitions.
 *
 * @param {Map} map - The Mapbox map instance.
 * @param {MainLayerDefinition[]} layerDefinitions - Array of layer definitions.
 */
export const addLayers = (map: Map, layerDefinitions: MainLayerDefinition[]) => {
  layerDefinitions.forEach((layer) => {
    if (layer.config && !map.getLayer(layer.id)) {
      map.addLayer(layer.config);
    }
    if ((layer?.subLayers ?? []).length > 0) {
      layer.subLayers!.forEach((subLayer) => {
        if (subLayer.config && !map.getLayer(subLayer.id)) {
          map.addLayer(subLayer.config);
        }
      });
    }
  });
};

/**
 * Adds hover functions to the map layers based on the provided layer definitions.
 *
 * @param {Map} map - The Mapbox map instance.
 * @param {MainLayerDefinition[]} layerDefinitions - Array of layer definitions.
 * @param {Popup} hoverPopup - Popup instance for hover interactions.
 * @param {Popup} persistentPopup - Popup instance for persistent interactions.
 */
export const addHoverFunctions = (
  map: Map,
  layerDefinitions: MainLayerDefinition[],
  hoverPopup: Popup,
  persistentPopup: Popup,
  root: Root,
  container: HTMLDivElement
) => {
  layerDefinitions.forEach((layer) => {
    if (layer.hoverFunction) {
      map.on(
        'mouseenter',
        layer.id,
        layer.hoverFunction(map, hoverPopup, persistentPopup, root, container)
      );
      if (layer.customHoverExitFunction) {
        map.on(
          'mouseleave',
          layer.id,
          layer.customHoverExitFunction(map, hoverPopup, persistentPopup, root, container)
        );
      } else {
        map.on('mouseleave', layer.id, () => {
          map.getCanvas().style.cursor = '';
          hoverPopup.remove();
        });
      }
    }
    if ((layer?.subLayers ?? []).length > 0) {
      layer.subLayers!.forEach((subLayer) => {
        if (subLayer.hoverFunction) {
          map.on(
            'mouseenter',
            subLayer.id,
            subLayer.hoverFunction(map, hoverPopup, persistentPopup, root, container)
          );
          if (subLayer.customHoverExitFunction) {
            map.on(
              'mouseleave',
              subLayer.id,
              subLayer.customHoverExitFunction(map, hoverPopup, persistentPopup, root, container)
            );
          } else {
            map.on('mouseleave', subLayer.id, () => {
              map.getCanvas().style.cursor = '';
              hoverPopup.remove();
            });
          }
        }
      });
    }
  });
};

/**
 * Adds mouse move functions to the map layers based on the provided layer definitions.
 *
 * @param {Map} map - The Mapbox map instance.
 * @param {MainLayerDefinition[]} layerDefinitions - Array of layer definitions.
 * @param {Popup} hoverPopup - Popup instance for hover interactions.
 * @param {Popup} persistentPopup - Popup instance for persistent interactions.
 */
export const addMouseMoveFunctions = (
  map: Map,
  layerDefinitions: MainLayerDefinition[],
  hoverPopup: Popup,
  persistentPopup: Popup,
  root: Root,
  container: HTMLDivElement
) => {
  layerDefinitions.forEach((layer) => {
    if (layer.mouseMoveFunction) {
      map.on(
        'mousemove',
        layer.id,
        layer.mouseMoveFunction(map, hoverPopup, persistentPopup, root, container)
      );
    }
    if ((layer?.subLayers ?? []).length > 0) {
      layer.subLayers!.forEach((subLayer) => {
        if (subLayer.mouseMoveFunction) {
          map.on(
            'mousemove',
            subLayer.id,
            subLayer.mouseMoveFunction(map, hoverPopup, persistentPopup, root, container)
          );
        }
      });
    }
  });
};

/**
 * Adds click functions to the map layers based on the provided layer definitions.
 *
 * @param {Map} map - The Mapbox map instance.
 * @param {MainLayerDefinition[]} layerDefinitions - Array of layer definitions.
 * @param {Popup} hoverPopup - Popup instance for hover interactions.
 * @param {Popup} persistentPopup - Popup instance for persistent interactions.
 */
export const addClickFunctions = (
  map: Map,
  layerDefinitions: MainLayerDefinition[],
  hoverPopup: Popup,
  persistentPopup: Popup,
  root: Root,
  container: HTMLDivElement
) => {
  layerDefinitions.forEach((layer) => {
    if (layer.clickFunction) {
      map.on(
        'click',
        layer.id,
        layer.clickFunction(map, hoverPopup, persistentPopup, root, container)
      );
    }
    if ((layer?.subLayers ?? []).length > 0) {
      layer.subLayers!.forEach((subLayer) => {
        if (subLayer.clickFunction) {
          map.on(
            'click',
            subLayer.id,
            subLayer.clickFunction(map, hoverPopup, persistentPopup, root, container)
          );
        }
      });
    }
  });
};

/**
 * Adds controls to the map based on the provided control configurations.
 *
 * @param {Map} map - The Mapbox map instance.
 * @param {MapComponentProps['controls']} controls - Object representing the control configurations.
 */
export const addControls = (map: Map, controls: MapComponentProps['controls']) => {
  if (controls) {
    const { scaleControl, navigationControl, fullscreenControl } = controls;
    if (scaleControl) {
      const scaleControlOptions = typeof scaleControl === 'boolean' ? {} : scaleControl;
      map.addControl(new ScaleControl(scaleControlOptions));
    }
    if (navigationControl) {
      const navigationControlOptions =
        typeof navigationControl === 'boolean' ? {} : navigationControl;
      map.addControl(
        new NavigationControl(navigationControlOptions),
        'bottom-right' // TODO: add ability to position
      );
    }
    if (fullscreenControl) {
      const fullscreenControlOptions =
        typeof fullscreenControl === 'boolean' ? {} : fullscreenControl;
      map.addControl(new FullscreenControl(fullscreenControlOptions));
    }
  }
};

export const addCustomControls = (
  map: Map,
  customControls: MapComponentProps['customControls']
) => {
  if (customControls) {
    customControls.forEach((customControl) =>
      map.addControl(customControl.control, customControl.position)
    );
  }
};
