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
    getReservoirLabelFilter,
    getAllMapLayers,
} from '@/features/Map/utils';
import { basemaps } from '@/components/Map/consts';
import {
    FilterSpecification,
    GeoJSONSource,
    LngLatLike,
    MapMouseEvent,
    MapTouchEvent,
} from 'mapbox-gl';
import { useReservoirData } from '@/hooks/useReservoirData';
import { RegionField } from '@/features/Map/types/region';
import { ReservoirDefault } from '@/stores/main/consts';
import { StateField } from '@/features/Map/types/state';
import { Huc02BasinField } from '@/features/Map/types/basin';
import { BoundingGeographyLevel } from '@/stores/main/types';
import useSessionStore from '@/stores/session';
import debounce from 'lodash.debounce';
import { ReservoirConfig } from './types';

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
    const setMapMoved = useSessionStore((state) => state.setMapMoved);

    const [shouldResize, setShouldResize] = useState(false);

    const isMounted = useRef(true);

    useReservoirData();

    const handleMapMove = () => {
        if (isMounted.current) {
            setMapMoved(Date.now());
        }
    };

    const debouncedHandleMapMove = debounce(handleMapMove, 150);

    useEffect(() => {
        return () => {
            debouncedHandleMapMove.cancel();
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
        const teacupData = reservoirCollections?.[SourceId.TeacupEDRReservoirs];

        const isValidFeatureCollection =
            teacupData?.type === 'FeatureCollection' &&
            Array.isArray(teacupData.features);

        if (!map || !isValidFeatureCollection) {
            return;
        }

        const teacupSource = map.getSource<GeoJSONSource>(
            SourceId.TeacupEDRReservoirs
        );

        if (!teacupSource) {
            return;
        }

        teacupSource.setData(
            reservoirCollections![SourceId.TeacupEDRReservoirs]!
        );
    }, [map, reservoirCollections?.[SourceId.TeacupEDRReservoirs]]);

    const getProperty = (
        boundingGeographyLevel: BoundingGeographyLevel
    ): keyof ReservoirConfig => {
        switch (boundingGeographyLevel) {
            case BoundingGeographyLevel.Region:
                return 'regionConnectorProperty';
            case BoundingGeographyLevel.Basin:
                return 'basinConnectorProperty';
            default:
            case BoundingGeographyLevel.State:
                return 'stateConnectorProperty';
        }
    };

    useEffect(() => {
        if (!map) {
            return;
        }

        const reservoirLayers = ReservoirConfigs.flatMap((config) =>
            getAllMapLayers(config)
        );
        const handleReservoirsClick = (e: MapMouseEvent | MapTouchEvent) => {
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

        map.on('click', reservoirLayers, handleReservoirsClick);
        map.on('touchend', reservoirLayers, handleReservoirsClick);
        // Detect map movements, update features connected to map extent
        map.on('moveend', debouncedHandleMapMove);
        map.on('zoomend', debouncedHandleMapMove);

        loadImages(map);
        map.on('style.load', () => {
            loadImages(map);
        });

        const ZOOM_HIGH = 8;
        const ZOOM_MID = 6;

        const getFilterValue = (
            region: string[],
            basin: string[],
            state: string[],
            boundingGeographyLevel: BoundingGeographyLevel
        ) => {
            if (
                boundingGeographyLevel === BoundingGeographyLevel.Region &&
                region.length > 0
            ) {
                return region;
            }
            if (
                boundingGeographyLevel === BoundingGeographyLevel.Basin &&
                basin.length > 0
            ) {
                return basin;
            }
            if (
                boundingGeographyLevel === BoundingGeographyLevel.State &&
                state.length > 0
            ) {
                return state;
            }
            return [];
        };

        const applyLabelSettings = (
            layerId: LayerId | SubLayerId,
            options: {
                filter?: FilterSpecification | null;
                allowOverlap?: boolean;
            }
        ) => {
            if (!map.getLayer(layerId)) return;

            if (typeof options.allowOverlap === 'boolean') {
                map.setLayoutProperty(
                    layerId,
                    'text-allow-overlap',
                    options.allowOverlap
                );
            }
            if (options.filter !== undefined) {
                map.setFilter(layerId, options.filter ?? null);
            }
        };

        const handleMapZoom = () => {
            const zoom = map.getZoom();

            const { boundingGeographyLevel, region, basin, state } =
                useMainStore.getState();

            const hasBoundingGeography =
                (region?.length ?? 0) > 0 ||
                (basin?.length ?? 0) > 0 ||
                (state?.length ?? 0) > 0;

            const zoomBucket =
                zoom > ZOOM_HIGH ? 'high' : zoom > ZOOM_MID ? 'mid' : 'low';

            const buildFilter = (config: ReservoirConfig) => {
                if (hasBoundingGeography) {
                    const filterValue = getFilterValue(
                        region ?? [],
                        basin ?? [],
                        state ?? [],
                        boundingGeographyLevel
                    );

                    const property = getProperty(boundingGeographyLevel);

                    const includeLabelFilter = zoomBucket === 'low';

                    // Modify filter to show based on zoom/capacity within bounds
                    return getBoundingGeographyFilter(
                        config,
                        property,
                        filterValue,
                        includeLabelFilter
                    );
                }

                // No bounding geography
                if (zoomBucket === 'low') {
                    // Modify filter to show based on zoom/capacity
                    return getReservoirLabelFilter(config);
                }

                // At mid zoom you clear the filter; at high zoom modify only collision settings
                return zoomBucket === 'mid' ? null : undefined; // `undefined` => don't change
            };

            const allowOverlapForBucket = zoomBucket === 'high' ? false : true;

            ReservoirConfigs.forEach((config) => {
                const filter = buildFilter(config);

                applyLabelSettings(config.labelLayer, {
                    filter,
                    allowOverlap: allowOverlapForBucket,
                });
            });
        };

        map.on('zoom', handleMapZoom);

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
            map.off('click', reservoirLayers, handleReservoirsClick);
            map.off('touchend', reservoirLayers, handleReservoirsClick);
            map.off('moveend', debouncedHandleMapMove);
            map.off('zoomend', debouncedHandleMapMove);
            map.off('zoom', handleMapZoom);
        };
    }, [map]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (region.length === 0) {
            // Unset Filter
            map.setFilter(SubLayerId.RegionsFill, null);
            map.setFilter(SubLayerId.RegionsBoundary, null);

            if (reservoir === ReservoirDefault) {
                ReservoirConfigs.forEach((config) => {
                    map.setFilter(config.iconLayer, getReservoirFilter(config));
                    map.setFilter(
                        config.labelLayer,
                        getReservoirLabelFilter(config)
                    );
                });
            }
        } else {
            // The region labels dont include the spaces in the source
            map.setFilter(SubLayerId.RegionsFill, [
                'match',
                ['get', RegionField.Name],
                region.map((reg) => reg.replaceAll(' - ', '-')),
                true,
                false,
            ]);
            map.setFilter(SubLayerId.RegionsBoundary, [
                'match',
                ['get', RegionField.Name],
                region.map((reg) => reg.replaceAll(' - ', '-')),
                true,
                false,
            ]);

            if (boundingGeographyLevel === BoundingGeographyLevel.Region) {
                ReservoirConfigs.forEach((config) => {
                    map.setFilter(
                        config.iconLayer,
                        getBoundingGeographyFilter(
                            config,
                            'regionConnectorProperty',
                            region
                        )
                    );
                    map.setFilter(
                        config.labelLayer,
                        getBoundingGeographyFilter(
                            config,
                            'regionConnectorProperty',
                            region,
                            true
                        )
                    );
                });
            }
        }
    }, [region]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (basin.length === 0) {
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
                    map.setFilter(config.iconLayer, getReservoirFilter(config));
                    map.setFilter(
                        config.labelLayer,
                        getReservoirLabelFilter(config)
                    );
                });
            }
        } else {
            map.setFilter(SubLayerId.BasinsFill, [
                'in',
                ['get', Huc02BasinField.Id],
                ['literal', basin],
            ]);
            map.setFilter(SubLayerId.BasinsBoundary, [
                'in',
                ['get', Huc02BasinField.Id],
                ['literal', basin],
            ]);

            if (boundingGeographyLevel === BoundingGeographyLevel.Basin) {
                ReservoirConfigs.forEach((config) => {
                    map.setFilter(
                        config.iconLayer,
                        getBoundingGeographyFilter(
                            config,
                            'basinConnectorProperty',
                            region
                        )
                    );
                    map.setFilter(
                        config.labelLayer,
                        getBoundingGeographyFilter(
                            config,
                            'basinConnectorProperty',
                            region,
                            true
                        )
                    );
                });
            }
        }
    }, [basin]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (state.length === 0) {
            // Unset Filter
            map.setFilter(SubLayerId.StatesFill, null);
            map.setFilter(SubLayerId.StatesBoundary, null);

            if (reservoir === ReservoirDefault) {
                ReservoirConfigs.forEach((config) => {
                    map.setFilter(config.iconLayer, getReservoirFilter(config));
                    map.setFilter(
                        config.labelLayer,
                        getReservoirLabelFilter(config)
                    );
                });
            }
        } else {
            map.setFilter(SubLayerId.StatesFill, [
                'in',
                ['get', StateField.Acronym],
                ['literal', state],
            ]);
            map.setFilter(SubLayerId.StatesBoundary, [
                'in',
                ['get', StateField.Acronym],
                ['literal', state],
            ]);

            if (boundingGeographyLevel === BoundingGeographyLevel.State) {
                ReservoirConfigs.forEach((config) => {
                    map.setFilter(
                        config.iconLayer,
                        getBoundingGeographyFilter(
                            config,
                            'stateConnectorProperty',
                            region
                        )
                    );
                    map.setFilter(
                        config.labelLayer,
                        getBoundingGeographyFilter(
                            config,
                            'stateConnectorProperty',
                            region,
                            true
                        )
                    );
                });
            }
        }
    }, [state]);

    useEffect(() => {
        if (!map) {
            return;
        }
        const reservoirLayers = ReservoirConfigs.flatMap((config) =>
            getAllMapLayers(config)
        );

        const handleClickOffReservoir = (e: MapMouseEvent) => {
            if (reservoir !== ReservoirDefault) {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: reservoirLayers,
                });
                if (!features.length) {
                    setRegion([]);
                    setBasin([]);
                    setState([]);
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

        if (showAllLabels) {
            if (
                boundingGeographyLevel === BoundingGeographyLevel.Region &&
                map.getLayer(SubLayerId.RegionLabels)
            ) {
                if (region.length > 0) {
                    map.setPaintProperty(
                        SubLayerId.RegionLabels,
                        'text-opacity',
                        ['match', ['get', RegionField.Name], region, 1, 0]
                    );
                } else {
                    map.setPaintProperty(
                        SubLayerId.RegionLabels,
                        'text-opacity',
                        1
                    );
                }
            }
            if (
                boundingGeographyLevel === BoundingGeographyLevel.Basin &&
                map.getLayer(SubLayerId.BasinLabels)
            ) {
                if (basin.length > 0) {
                    map.setPaintProperty(
                        SubLayerId.BasinLabels,
                        'text-opacity',
                        ['match', ['get', Huc02BasinField.Id], basin, 1, 0]
                    );
                } else {
                    map.setPaintProperty(
                        SubLayerId.BasinLabels,
                        'text-opacity',
                        1
                    );
                }
            }
            if (
                boundingGeographyLevel === BoundingGeographyLevel.State &&
                map.getLayer(SubLayerId.StateLabels)
            ) {
                if (state.length > 0) {
                    map.setPaintProperty(
                        SubLayerId.StateLabels,
                        'text-opacity',
                        ['match', ['get', StateField.Acronym], state, 1, 0]
                    );
                } else {
                    map.setPaintProperty(
                        SubLayerId.StateLabels,
                        'text-opacity',
                        1
                    );
                }
            }
        }
    }, [boundingGeographyLevel, showAllLabels, region, basin, state]);

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
