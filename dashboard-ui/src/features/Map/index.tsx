/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import Map from '@/components/Map';
import React, { useEffect, useRef } from 'react';
import { layerDefinitions, sourceConfigs } from '@/features/Map/config';
import {
    MAP_ID,
    SubLayerId,
    INITIAL_CENTER,
    INITIAL_ZOOM,
    SourceId,
    ReservoirConfigs,
} from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import useMainStore from '@/lib/main';
import {
    loadTeacups as loadImages,
    getReservoirConfig,
    findReservoirIndex,
    getReservoirIdentifier,
    isReservoirIdentifier,
    getReservoirFilter,
    getBoundingGeographyFilter,
} from '@/features/Map/utils';
import { MapButton as BasemapSelector } from '@/features/MapTools/BaseMap/MapButton';
import { MapButton as Screenshot } from '@/features/MapTools/Screenshot/MapButton';
import { MapButton as Controls } from '@/features/MapTools/Controls/MapButton';
import { MapButton as Legend } from '@/features/MapTools/Legend/MapButton';
import CustomControl from '@/components/Map/tools/CustomControl';
import { basemaps } from '@/components/Map/consts';
import { GeoJSONSource, LngLatLike, MapMouseEvent } from 'mapbox-gl';
import { useReservoirData } from '@/app/hooks/useReservoirData';
import { useSnotelData } from '@/app/hooks/useSnotelData';
import { RegionField } from '@/features/Map/types/region';
import {
    BasinDefault,
    RegionDefault,
    ReservoirDefault,
    StateDefault,
} from '@/lib/consts';
import { StateField } from './types/state';
import { Huc06BasinField } from './types/basin';
import { BoundingGeographyLevel } from '@/lib/types';

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

    const isMounted = useRef(true);

    useReservoirData();

    useSnotelData();

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

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

        console.log(
            'querySourceFeatures',
            map.querySourceFeatures(SourceId.USACEEDRReservoirs),
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

        const handleRegionsClick = (e: MapMouseEvent) => {
            const zoom = map.getZoom();
            if (zoom > 6) {
                return;
            }

            const features = map.queryRenderedFeatures(e.point, {
                layers: [SubLayerId.RegionsFill],
            });

            if (features && features.length) {
                const feature = features[0];
                console.log('Region', feature);
                if (feature.properties) {
                    const region = feature.properties[
                        RegionField.Name
                    ] as string;

                    if (region) {
                        setRegion(region);
                    }
                }
            }
        };

        const handleBasinsClick = (e: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: [SubLayerId.BasinsFill],
            });

            if (features && features.length) {
                const feature = features[0];
                console.log('Basin', feature);
                if (feature.properties) {
                    const basin = feature.properties[
                        Huc06BasinField.Id
                    ] as string;

                    if (basin) {
                        setBasin(basin);
                    }
                }
            }
        };

        const handleStatesClick = (e: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: [SubLayerId.StatesFill],
            });

            if (features && features.length) {
                const feature = features[0];
                console.log('State', feature);
                if (feature.properties) {
                    const state = feature.properties[
                        StateField.Acronym
                    ] as string;

                    if (state) {
                        setState(state);
                    }
                }
            }
        };

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

                console.log('feature', feature);

                if (config && feature.properties) {
                    const identifier = getReservoirIdentifier(
                        config,
                        feature.properties,
                        feature.id!
                    );

                    if (feature.properties[config.regionConnectorProperty]) {
                        const rawRegionProperty = String(
                            feature.properties[config.regionConnectorProperty]
                        );
                        const regionProperty = rawRegionProperty.startsWith('[')
                            ? (JSON.parse(rawRegionProperty) as string[])
                            : rawRegionProperty;

                        setRegion(
                            Array.isArray(regionProperty)
                                ? regionProperty[0]
                                : regionProperty
                        );
                    }
                    if (feature.properties[config.basinConnectorProperty]) {
                        const rawBasinProperty = String(
                            feature.properties[config.basinConnectorProperty]
                        );
                        const basinProperty = rawBasinProperty.startsWith('[')
                            ? (JSON.parse(rawBasinProperty) as string[])
                            : rawBasinProperty;

                        setBasin(
                            Array.isArray(basinProperty)
                                ? basinProperty[0]
                                : basinProperty
                        );
                    }
                    if (feature.properties[config.stateConnectorProperty]) {
                        const rawStateProperty = String(
                            feature.properties[config.stateConnectorProperty]
                        );
                        const stateProperty = rawStateProperty.startsWith('[')
                            ? (JSON.parse(rawStateProperty) as string[])
                            : rawStateProperty;

                        setState(
                            Array.isArray(stateProperty)
                                ? stateProperty[0]
                                : stateProperty
                        );
                    }

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

        map.on('click', SubLayerId.RegionsFill, handleRegionsClick);
        map.on('click', SubLayerId.BasinsFill, handleBasinsClick);
        map.on('click', SubLayerId.StatesFill, handleStatesClick);

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
            map.off('click', SubLayerId.RegionsFill, handleRegionsClick);
            map.off('click', SubLayerId.BasinsFill, handleBasinsClick);
            map.off('click', SubLayerId.StatesFill, handleStatesClick);
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
            map.setFilter(SubLayerId.BasinsFill, null);
            map.setFilter(SubLayerId.BasinsBoundary, null);

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
                ['get', Huc06BasinField.Id],
                basin,
            ]);
            map.setFilter(SubLayerId.BasinsBoundary, [
                '==',
                ['get', Huc06BasinField.Id],
                basin,
            ]);

            if (boundingGeographyLevel === BoundingGeographyLevel.Basin) {
                console.log('basin', basin);
                ReservoirConfigs.forEach((config) => {
                    config.connectedLayers.forEach((layerId) => {
                        console.log(
                            getBoundingGeographyFilter(
                                config,
                                'basinConnectorProperty',
                                Number(basin)
                            )
                        );
                        map.setFilter(
                            layerId,
                            getBoundingGeographyFilter(
                                config,
                                'basinConnectorProperty',
                                Number(basin)
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
                    map.once('idle', () => {
                        requestAnimationFrame(() => {
                            map.flyTo({
                                center: INITIAL_CENTER,
                                zoom: INITIAL_ZOOM,
                                speed: 2,
                            });
                        });
                    });
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

                                map.once('idle', () => {
                                    // Wait for the next animation frame to ensure layout is complete
                                    requestAnimationFrame(() => {
                                        map.flyTo({
                                            center: center,
                                            zoom: 10,
                                            speed: 2,
                                            easing: (t) => t, // linear easing
                                        });
                                    });
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

        // Copy over all existing layers and sources when changing basemaps
        const layers = map.getStyle().layers || [];
        const sources = map.getStyle().sources || {};

        const customLayers = layers.filter((layer) => {
            return !layer.id.startsWith('mapbox');
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
                    scaleControl: true,
                    navigationControl: true,
                }}
                customControls={[
                    {
                        control: new CustomControl(
                            (
                                <>
                                    <BasemapSelector />
                                    <Screenshot />
                                </>
                            )
                        ),
                        position: 'top-right',
                    },
                    {
                        control: new CustomControl(
                            (
                                <>
                                    <Controls />
                                    <Legend />
                                </>
                            )
                        ),
                        position: 'top-left',
                    },
                ]}
            />
        </>
    );
};

export default MainMap;
