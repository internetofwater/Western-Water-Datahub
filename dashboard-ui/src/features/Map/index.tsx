/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import Map from '@/components/Map';
import React, { useEffect, useRef, useState } from 'react';
import { layerDefinitions, sourceConfigs } from '@/features/Map/config';
import {
    MAP_ID,
    SubLayerId,
    INITIAL_CENTER,
    INITIAL_ZOOM,
    SourceId,
    ReservoirConfigs,
    ValidBasins,
    LayerId,
} from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import useMainStore from '@/stores/main';
import {
    loadTeacups as loadImages,
    getReservoirConfig,
    findReservoirIndex,
    getReservoirIdentifier,
    isReservoirIdentifier,
    getReservoirFilter,
    getBoundingGeographyFilter,
    resetMap,
    getDefaultGeoJSON,
    getReservoirSymbolSize,
    getReservoirSymbolSortKey,
    getHighlightIcon,
} from '@/features/Map/utils';
import { basemaps } from '@/components/Map/consts';
import { GeoJSONSource, LngLatLike, MapMouseEvent } from 'mapbox-gl';
import { useReservoirData } from '@/hooks/useReservoirData';
import { RegionField } from '@/features/Map/types/region';
import {
    BasinDefault,
    RegionDefault,
    ReservoirDefault,
    StateDefault,
} from '@/stores/main/consts';
import { StateField } from '@/features/Map/types/state';
import { Huc02BasinField } from '@/features/Map/types/basin';
import { BoundingGeographyLevel } from '@/stores/main/types';
import useSessionStore from '@/stores/session';

type Props = {
    accessToken: string;
};

/**
 * This component renders the main map for the application, allowing users to interact with all layers defined in config.tsx.
 * It handles all map events that interact with redux state, including clicks on mainstem and updates to the data in the cluster layer.
 *
 * Props:
 * - accessToken: string - The access token for the map service.
 *
 * @component
 */
const MainMap: React.FC<Props> = (props) => {
    const { accessToken } = props;

    const { map, container } = useMap(MAP_ID);
    const boundingGeographyLevel = useMainStore(
        (state) => state.boundingGeographyLevel
    );
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const basin = useMainStore((state) => state.basin);
    const setBasin = useMainStore((state) => state.setBasin);
    const state = useMainStore((state) => state.state);
    const setState = useMainStore((state) => state.setState);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);
    const basemap = useMainStore((state) => state.basemap);
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );
    const showAllLabels = useMainStore((state) => state.showAllLabels);

    const highlight = useSessionStore((state) => state.highlight);

    const loadingInstances = useSessionStore((state) => state.loadingInstances);

    const [shouldResize, setShouldResize] = useState(false);

    const isMounted = useRef(true);

    useReservoirData();

    // useSnotelData();

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        setShouldResize(loadingInstances.length > 0);
    }, [loadingInstances]);

    useEffect(() => {
        if (!map) {
            return;
        }

        map.resize();
    }, [shouldResize]);

    useEffect(() => {
        const resvizData = reservoirCollections?.[SourceId.ResvizEDRReservoirs];

        const isValidFeatureCollection =
            resvizData?.type === 'FeatureCollection' &&
            Array.isArray(resvizData.features);

        if (!map || !isValidFeatureCollection) {
            return;
        }

        const resVizSource = map.getSource<GeoJSONSource>(
            SourceId.ResvizEDRReservoirs
        );

        if (!resVizSource) {
            return;
        }

        resVizSource.setData(
            reservoirCollections![SourceId.ResvizEDRReservoirs]!
        );
    }, [map, reservoirCollections?.[SourceId.ResvizEDRReservoirs]]);

    useEffect(() => {
        if (!map) {
            return;
        }

        const reservoirLayers = ReservoirConfigs.flatMap(
            (config) => config.connectedLayers
        );

        const handleReservoirsClick = (e: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: reservoirLayers,
            });

            if (features && features.length) {
                // If the user has a hover popup open to a particular feature
                // Find that feature and select it
                const identifier = container
                    ? container.getAttribute('data-identifier')
                    : null;

                const index = identifier
                    ? findReservoirIndex(features, identifier)
                    : 0;

                const feature = features[index];

                const config = getReservoirConfig(feature.source as SourceId);

                if (config && feature.properties) {
                    const identifier = getReservoirIdentifier(
                        config,
                        feature.properties,
                        feature.id!
                    );

                    // if (feature.properties[config.regionConnectorProperty]) {
                    //     const rawRegionProperty = String(
                    //         feature.properties[config.regionConnectorProperty]
                    //     );
                    //     const regionProperty = rawRegionProperty.startsWith('[')
                    //         ? (JSON.parse(rawRegionProperty) as string[])
                    //         : rawRegionProperty;

                    //     setRegion(
                    //         Array.isArray(regionProperty)
                    //             ? regionProperty[0]
                    //             : regionProperty
                    //     );
                    // }
                    // if (feature.properties[config.basinConnectorProperty]) {
                    //     const rawBasinProperty = String(
                    //         feature.properties[config.basinConnectorProperty]
                    //     );
                    //     const basinProperty = rawBasinProperty.startsWith('[')
                    //         ? (JSON.parse(rawBasinProperty) as string[])
                    //         : String(rawBasinProperty).slice(0, 2);

                    //     setBasin(
                    //         Array.isArray(basinProperty)
                    //             ? basinProperty[0]
                    //             : basinProperty
                    //     );
                    // }
                    // if (feature.properties[config.stateConnectorProperty]) {
                    //     const rawStateProperty = String(
                    //         feature.properties[config.stateConnectorProperty]
                    //     );
                    //     const stateProperty = rawStateProperty.startsWith('[')
                    //         ? (JSON.parse(rawStateProperty) as string[])
                    //         : rawStateProperty;

                    //     setState(
                    //         Array.isArray(stateProperty)
                    //             ? stateProperty[0]
                    //             : stateProperty
                    //     );
                    // }

                    setReservoir({
                        identifier:
                            config.identifierType === 'number'
                                ? Number(identifier)
                                : identifier,
                        source: feature.source as SourceId,
                    });
                }
            }
        };

        // map.on('click', SubLayerId.RegionsFill, handleRegionsClick);
        // map.on('click', SubLayerId.BasinsFill, handleBasinsClick);
        // map.on('click', SubLayerId.StatesFill, handleStatesClick);

        map.on('click', reservoirLayers, handleReservoirsClick);

        loadImages(map);
        map.on('style.load', () => {
            loadImages(map);
        });

        // Resize and fit bounds to ensure consistent loading behavior in all screen sizes
        map.resize();
        map.fitBounds(
            [
                [-125, 24], // Southwest corner (California/Baja)
                [-96.5, 49], // Northeast corner (MN/ND border)
            ],
            {
                padding: 60,
                animate: false,
            }
        );

        return () => {
            // map.off('click', SubLayerId.RegionsFill, handleRegionsClick);
            // map.off('click', SubLayerId.BasinsFill, handleBasinsClick);
            // map.off('click', SubLayerId.StatesFill, handleStatesClick);
            map.off('click', reservoirLayers, handleReservoirsClick);
        };
    }, [map]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (region === RegionDefault) {
            // Unset Filter
            map.setFilter(SubLayerId.RegionsFill, null);
            map.setFilter(SubLayerId.RegionsBoundary, null);

            if (reservoir === ReservoirDefault) {
                ReservoirConfigs.forEach((config) => {
                    config.connectedLayers.forEach((layerId) => {
                        map.setFilter(layerId, getReservoirFilter(config));
                    });
                });
            }
        } else {
            map.setFilter(SubLayerId.RegionsFill, [
                '==',
                ['get', RegionField.Name],
                region,
            ]);
            map.setFilter(SubLayerId.RegionsBoundary, [
                '==',
                ['get', RegionField.Name],
                region,
            ]);

            if (boundingGeographyLevel === BoundingGeographyLevel.Region) {
                ReservoirConfigs.forEach((config) => {
                    config.connectedLayers.forEach((layerId) => {
                        map.setFilter(
                            layerId,
                            getBoundingGeographyFilter(
                                config,
                                'regionConnectorProperty',
                                region
                            )
                        );
                    });
                });
            }
        }
    }, [region]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (basin === BasinDefault) {
            // Unset Filter
            map.setFilter(SubLayerId.BasinsFill, [
                'in',
                ['get', Huc02BasinField.Id],
                ['literal', ValidBasins],
            ]);
            map.setFilter(SubLayerId.BasinsBoundary, [
                'in',
                ['get', Huc02BasinField.Id],
                ['literal', ValidBasins],
            ]);

            if (reservoir === ReservoirDefault) {
                ReservoirConfigs.forEach((config) => {
                    config.connectedLayers.forEach((layerId) => {
                        map.setFilter(layerId, getReservoirFilter(config));
                    });
                });
            }
        } else {
            map.setFilter(SubLayerId.BasinsFill, [
                '==',
                ['get', Huc02BasinField.Id],
                basin,
            ]);
            map.setFilter(SubLayerId.BasinsBoundary, [
                '==',
                ['get', Huc02BasinField.Id],
                basin,
            ]);

            if (boundingGeographyLevel === BoundingGeographyLevel.Basin) {
                ReservoirConfigs.forEach((config) => {
                    config.connectedLayers.forEach((layerId) => {
                        map.setFilter(
                            layerId,
                            getBoundingGeographyFilter(
                                config,
                                'basinConnectorProperty',
                                basin
                            )
                        );
                    });
                });
            }
        }
    }, [basin]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (state === StateDefault) {
            // Unset Filter
            map.setFilter(SubLayerId.StatesFill, null);
            map.setFilter(SubLayerId.StatesBoundary, null);

            if (reservoir === ReservoirDefault) {
                ReservoirConfigs.forEach((config) => {
                    config.connectedLayers.forEach((layerId) => {
                        map.setFilter(layerId, getReservoirFilter(config));
                    });
                });
            }
        } else {
            map.setFilter(SubLayerId.StatesFill, [
                '==',
                ['get', StateField.Acronym],
                state,
            ]);
            map.setFilter(SubLayerId.StatesBoundary, [
                '==',
                ['get', StateField.Acronym],
                state,
            ]);

            if (boundingGeographyLevel === BoundingGeographyLevel.State) {
                ReservoirConfigs.forEach((config) => {
                    config.connectedLayers.forEach((layerId) => {
                        map.setFilter(
                            layerId,
                            getBoundingGeographyFilter(
                                config,
                                'stateConnectorProperty',
                                state
                            )
                        );
                    });
                });
            }
        }
    }, [state]);

    useEffect(() => {
        if (!map) {
            return;
        }
        const reservoirLayers = ReservoirConfigs.flatMap(
            (config) => config.connectedLayers
        );

        const handleClickOffReservoir = (e: MapMouseEvent) => {
            if (reservoir !== ReservoirDefault) {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: reservoirLayers,
                });
                if (!features.length) {
                    setRegion(RegionDefault);
                    setBasin(BasinDefault);
                    setState(StateDefault);
                    setReservoir(ReservoirDefault);
                    resetMap(map);
                }
            }
        };

        if (reservoir === ReservoirDefault) {
            map.off('click', handleClickOffReservoir);
        } else {
            map.on('click', handleClickOffReservoir);
            if (reservoirCollections) {
                ReservoirConfigs.forEach((config) => {
                    if (config.id === (reservoir.source as SourceId)) {
                        const collection =
                            reservoirCollections[reservoir.source as SourceId];

                        if (collection) {
                            const features = collection.features.filter(
                                (feature) =>
                                    isReservoirIdentifier(
                                        config,
                                        feature.properties,
                                        feature.id!,
                                        reservoir.identifier
                                    )
                            );

                            if (features.length) {
                                const feature = features[0];
                                const center = feature.geometry
                                    .coordinates as LngLatLike;

                                map.resize();
                                map.flyTo({
                                    center: center,
                                    zoom: 6,
                                    speed: 2,
                                    easing: (t) => t, // linear easing
                                });
                            }
                        }
                    }
                });
            }
        }

        return () => {
            map.off('click', handleClickOffReservoir);
        };
    }, [reservoir]);

    useEffect(() => {
        if (!map) {
            return;
        }

        const source = map.getSource(SourceId.Highlight) as GeoJSONSource;

        if (!source) {
            return;
        }

        if (highlight) {
            const iconImageExpression = getHighlightIcon(highlight.config);
            const iconSizeExpression = getReservoirSymbolSize(
                highlight.config,
                0.15
            );
            const symbolSortExpression = getReservoirSymbolSortKey(
                highlight.config
            );

            map.setLayoutProperty(
                LayerId.Highlight,
                'icon-image',
                iconImageExpression
            );
            map.setLayoutProperty(
                LayerId.Highlight,
                'icon-size',
                iconSizeExpression
            );
            map.setLayoutProperty(
                LayerId.Highlight,
                'symbol-sort-key',
                symbolSortExpression
            );

            map.setFilter(LayerId.Highlight, null);
            source.setData({
                type: 'FeatureCollection',
                features: [highlight.feature],
            });
        } else {
            // TODO, determine why the highlight is sticking
            map.setFilter(LayerId.Highlight, ['==', ['id'], -1]);
            source.setData(getDefaultGeoJSON());
        }
    }, [highlight]);

    useEffect(() => {
        if (!map) {
            return;
        }

        // Copy over all existing layers and sources when changing basemaps
        const layers = map.getStyle().layers || [];
        const sources = map.getStyle().sources || {};

        const customLayers = layers.filter((layer) => {
            return layer.id.startsWith('dash-');
        });

        const customSources = Object.entries(sources).filter(([id]) => {
            return !id.startsWith('mapbox');
        });

        map.once('styledata', () => {
            for (const [id, source] of customSources) {
                if (!map.getSource(id)) {
                    map.addSource(id, source);
                }
            }

            for (const layer of customLayers) {
                if (!map.getLayer(layer.id)) {
                    map.addLayer(layer);
                }
            }
        });

        map.setStyle(basemaps[basemap]);
    }, [basemap]);

    useEffect(() => {
        if (!map) {
            return;
        }

        if (map.getLayer(SubLayerId.RegionLabels)) {
            map.setPaintProperty(SubLayerId.RegionLabels, 'text-opacity', 0);
        }
        if (map.getLayer(SubLayerId.BasinLabels)) {
            map.setPaintProperty(SubLayerId.BasinLabels, 'text-opacity', 0);
        }
        if (map.getLayer(SubLayerId.StateLabels)) {
            map.setPaintProperty(SubLayerId.StateLabels, 'text-opacity', 0);
        }

        // case SubLayerId.RegionsFill:
        // case SubLayerId.BasinsFill:
        // case SubLayerId.StatesFill:
        if (showAllLabels) {
            if (
                boundingGeographyLevel === BoundingGeographyLevel.Region &&
                map.getLayer(SubLayerId.RegionLabels)
            ) {
                map.setPaintProperty(
                    SubLayerId.RegionLabels,
                    'text-opacity',
                    1
                );
            }
            if (
                boundingGeographyLevel === BoundingGeographyLevel.Basin &&
                map.getLayer(SubLayerId.BasinLabels)
            ) {
                map.setPaintProperty(SubLayerId.BasinLabels, 'text-opacity', 1);
            }
            if (
                boundingGeographyLevel === BoundingGeographyLevel.State &&
                map.getLayer(SubLayerId.StateLabels)
            ) {
                map.setPaintProperty(SubLayerId.StateLabels, 'text-opacity', 1);
            }
        }
    }, [boundingGeographyLevel, showAllLabels]);

    return (
        <>
            <Map
                accessToken={accessToken}
                id={MAP_ID}
                sources={sourceConfigs}
                layers={layerDefinitions}
                options={{
                    style: basemaps[basemap],
                    projection: 'mercator',
                    center: INITIAL_CENTER,
                    zoom: INITIAL_ZOOM,
                    minZoom: 3,
                    maxZoom: 20,
                }}
                controls={{
                    // scaleControl: true,
                    navigationControl: true,
                }}
            />
        </>
    );
};

export default MainMap;
