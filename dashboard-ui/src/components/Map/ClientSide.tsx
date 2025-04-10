/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';
// MapComponent.tsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMap } from '@/contexts/MapContexts';
import { MapComponentProps } from '@/components/Map/types';
import {
    addClickFunctions,
    addControls,
    addHoverFunctions,
    addLayers,
    addMouseMoveFunctions,
    addCustomControls,
    addSources,
} from '@/components/Map/utils';

import 'mapbox-gl/dist/mapbox-gl.css';
import FeatureService, {
    FeatureServiceOptions,
} from '@hansdo/mapbox-gl-arcgis-featureserver';

FeatureService.prototype._setAttribution = function () {
    // Stub to prevent attribution bug
};

/**
 * This component initializes and renders a Mapbox GL map with specified sources, layers, and controls.
 * It handles map loading, style changes, and cleanup on component unmount. Once the map is initialized
 * it the map object is stored into the map context provider to allow referencing across the application.
 *
 * Props:
 * - accessToken: string - The access token for the Mapbox service.
 * - id: string - The unique identifier for the map component.
 * - sources: SourceConfig[] - Array of source configurations for the map.
 * - layers: MainLayerDefinition[] - Array of layer definitions for the map.
 * - options: Omit<MapOptions, 'container'> - Map options excluding the container property.
 *   Container is defined by this component.
 * - controls?: {
 *     navigationControl?: NavigationControlOptions | boolean;
 *     scaleControl?: ScaleControlOptions | boolean;
 *     fullscreenControl?: FullscreenControlOptions | boolean;
 * } - Optional map controls configuration.
 *
 *
 * @component
 */
const MapComponent: React.FC<MapComponentProps> = (props) => {
    const {
        id,
        sources,
        layers,
        options,
        controls,
        customControls,
        accessToken,
    } = props;

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const { map, hoverPopup, persistentPopup, setMap } = useMap(id);

    useEffect(() => {
        if (!map && mapContainerRef.current) {
            mapboxgl.accessToken = accessToken;
            const newMap = new mapboxgl.Map({
                ...options,
                container: mapContainerRef.current,
                customAttribution:
                    'Powered by <a href="https://www.esri.com" >Esri</a>',
            });
            const hoverPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
            });

            const persistentPopup = new mapboxgl.Popup();

            newMap.once('load', () => {
                const createFeatureService = (
                    sourceId: string,
                    map: mapboxgl.Map,
                    options: FeatureServiceOptions
                ) => new FeatureService(sourceId, map, options);

                setMap(newMap, hoverPopup, persistentPopup);
                addSources(newMap, sources, createFeatureService);
                addLayers(newMap, layers);
                addHoverFunctions(newMap, layers, hoverPopup, persistentPopup);
                addClickFunctions(newMap, layers, hoverPopup, persistentPopup);
                addMouseMoveFunctions(
                    newMap,
                    layers,
                    hoverPopup,
                    persistentPopup
                );
                addControls(newMap, controls);
                addCustomControls(newMap, customControls);
            });
        }

        return () => {
            if (map) map.remove();
        };
    }, []);

    useEffect(() => {
        if (!map || !hoverPopup || !persistentPopup) {
            return;
        }

        map.on('style.load', () => {
            const createFeatureService = (
                sourceId: string,
                map: mapboxgl.Map,
                options: FeatureServiceOptions
            ) => new FeatureService(sourceId, map, options);

            // Layers reset on style changes
            addSources(map, sources, createFeatureService);
            addLayers(map, layers);
            addHoverFunctions(map, layers, hoverPopup, persistentPopup);
            addClickFunctions(map, layers, hoverPopup, persistentPopup);
            addMouseMoveFunctions(map, layers, hoverPopup, persistentPopup);
        });
    }, [map]);

    // Style the container using #map-container-${id} in a global css file
    return (
        <div
            data-testid={`map-container-${id}`}
            id={`map-container-${id}`}
            ref={mapContainerRef}
        />
    );
};

export default MapComponent;
