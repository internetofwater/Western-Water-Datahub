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
import useMainStore, { ReservoirDefault } from '@/lib/main';
import {
    loadTeacups as loadImages,
    getReservoirConfig,
    findReservoirIndex,
} from '@/features/Map/utils';
import { MapButton as BasemapSelector } from '@/features/MapTools/BaseMap/MapButton';
import { MapButton as Screenshot } from '@/features/MapTools/Screenshot/MapButton';
import { MapButton as Controls } from '@/features/MapTools/Controls/MapButton';
import CustomControl from '@/components/Map/tools/CustomControl';
import { basemaps } from '@/components/Map/consts';
import { LngLatLike, MapMouseEvent } from 'mapbox-gl';
import { useReservoirData } from '@/app/hooks/useReservoirData';
import { useSnotelData } from '@/app/hooks/useSnotelData';

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
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);
    const basemap = useMainStore((state) => state.basemap);

    const isMounted = useRef(true);

    const { reservoirCollections } = useReservoirData();

    useSnotelData();

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

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
                    const region = feature.properties['REG_NAME'] as string;

                    setRegion(region);
                }
            }
        };

        const handleBasinsClick = (e: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: [SubLayerId.BasinsFill],
            });

            console.log('BASINS', features);

            // if (features && features.length) {
            //     const feature = features[0];

            //     if (feature.properties) {
            //         const region = feature.properties.REGION as string;

            //         setRegion(region);
            //     }
            // }
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
                    const identifier = (feature.properties[
                        config.identifierProperty
                    ] ?? feature.id) as string | number;
                    const regionProperty = JSON.parse(
                        feature.properties[
                            config.regionConnectorProperty
                        ] as string
                    ) as string | string[];

                    setRegion(
                        Array.isArray(regionProperty)
                            ? regionProperty[0]
                            : regionProperty
                    );

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
            map.off('click', reservoirLayers, handleReservoirsClick);
        };
    }, [map]);

    // useEffect(() => {
    //     if (!map) {
    //         return;
    //     }

    //     const now = new Date();
    //     const today = new Date(
    //         now.getFullYear(),
    //         now.getMonth(),
    //         now.getDate()
    //     );
    //     // eslint-disable-next-line @typescript-eslint/no-floating-promises
    //     (async () => {
    //         controller.current = new AbortController();
    //         const data = await edrService.getCube('rise-edr', {
    //             signal: controller.current.signal,
    //             params: {
    //                 'parameter-name': '3',
    //                 bbox: [-130.516667, 24.1, -62.25273100000001, 58.240301],
    //                 datetime: today.toISOString().split('T')[0] + '/',
    //             },
    //         });
    //         console.log('data', data);
    //     })();
    // }, [map]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (region === 'all') {
            // Unset Filter
            map.setFilter(SubLayerId.RegionsFill, null);
            map.setFilter(SubLayerId.RegionsBoundary, null);
            // TODO: basin filter
            if (reservoir === ReservoirDefault) {
                ReservoirConfigs.forEach((config) => {
                    config.connectedLayers.forEach((layerId) => {
                        map.setFilter(layerId, null);
                    });
                });
            }
        } else {
            map.setFilter(SubLayerId.RegionsFill, [
                '==',
                ['get', 'REG_NAME'],
                region,
            ]);
            map.setFilter(SubLayerId.RegionsBoundary, [
                '==',
                ['get', 'REG_NAME'],
                region,
            ]);
            // TODO: basin filter
            ReservoirConfigs.forEach((config) => {
                config.connectedLayers.forEach((layerId) => {
                    map.setFilter(layerId, [
                        'any',
                        ['in', region, ['get', config.regionConnectorProperty]],
                        ['==', ['get', config.regionConnectorProperty], region],
                    ]);
                });
            });
        }
    }, [region]);

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
                    setRegion('all');
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
                                    (feature.properties &&
                                        feature.properties[
                                            config.identifierProperty
                                        ] === reservoir.identifier) ||
                                    feature.id === reservoir.identifier
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
                        control: new CustomControl(<Controls />),
                        position: 'top-left',
                    },
                ]}
            />
        </>
    );
};

export default MainMap;
