/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Select, Skeleton } from '@mantine/core';
import useMainStore from '@/stores/main/main';
import { MAP_ID, SourceId, ReservoirConfigs } from '@/features/Map/consts';
import { useEffect, useRef, useState } from 'react';
import {
    formatOptions,
    ItemWithSource,
} from '@/features/Header/Selectors/utils';
import { useReservoirData } from '@/hooks/useReservoirData';
import { useMap } from '@/contexts/MapContexts';
import {
    getReservoirConfig,
    getReservoirIdentifier,
    isReservoirIdentifier,
    isSourceDataLoaded,
    resetMap,
} from '@/features/Map/utils';
import { SourceDataEvent } from '@/features/Map/types';
import styles from '@/features/Header/Header.module.css';
import { ReservoirDefault } from '@/stores/main/consts';

/**

 * @component
 */
export const Reservoir: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);

    const [reservoirOptions, setReservoirOptions] = useState<ItemWithSource[]>(
        []
    );
    const [loading, setLoading] = useState(true);

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);

    const { map } = useMap(MAP_ID);

    const { reservoirCollections } = useReservoirData();

    const createDefaultOptions = () => {
        if (!reservoirCollections) {
            return;
        }

        const reservoirOptions: ItemWithSource[] = [];
        for (const config of ReservoirConfigs) {
            const collection = reservoirCollections[config.id];

            if (collection) {
                const features = collection.features;
                if (features.length) {
                    const options = formatOptions(
                        features.filter(
                            (feature) =>
                                feature.properties![config.capacityProperty] !==
                                    undefined &&
                                feature.properties![config.storageProperty] !==
                                    undefined &&
                                feature.properties![
                                    config.tenthPercentileProperty
                                ] !== undefined &&
                                feature.properties![
                                    config.ninetiethPercentileProperty
                                ] !== undefined &&
                                feature.properties![
                                    config.thirtyYearAverageProperty
                                ] !== undefined
                        ),
                        (feature) => String(feature?.id),
                        (feature) =>
                            String(feature?.properties?.[config.labelProperty]),
                        'All Reservoirs',
                        String(ReservoirDefault),
                        config.id
                    );
                    reservoirOptions.push(...options);
                }
            }
        }
        setReservoirOptions(reservoirOptions);
    };

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (controller.current) {
                controller.current.abort('Component unmount');
            }
        };
    }, []);

    useEffect(() => {
        if (!map) {
            return;
        }

        // Ensure both map and populating fetch are finished
        const sourceCallback = (e: SourceDataEvent) => {
            if (
                ReservoirConfigs.every((config) =>
                    isSourceDataLoaded(map, config.id, e)
                )
            ) {
                setLoading(false);
                map.off('sourcedata', sourceCallback); //remove event listener
            }
        };

        map.on('sourcedata', sourceCallback);

        return () => {
            map.off('sourcedata', sourceCallback);
        };
    }, [map]);

    useEffect(() => {
        createDefaultOptions();
    }, [reservoirCollections]);

    useEffect(() => {
        if (!reservoirCollections) {
            return;
        }

        if (region && region !== 'all') {
            const reservoirOptions: ItemWithSource[] = [];
            for (const config of ReservoirConfigs) {
                const collection = reservoirCollections[config.id];

                if (collection && config.regionConnectorProperty) {
                    const features = collection.features.filter(
                        (feature) =>
                            feature.properties &&
                            (Array.isArray(
                                feature.properties[
                                    config.regionConnectorProperty
                                ]
                            )
                                ? (
                                      feature.properties[
                                          config.regionConnectorProperty
                                      ] as string[] | number[]
                                  )?.[0] === region
                                : feature.properties[
                                      config.regionConnectorProperty
                                  ] === region)
                    );

                    if (features.length) {
                        const options = formatOptions(
                            features,
                            (feature) =>
                                String(
                                    getReservoirIdentifier(
                                        config,
                                        feature.properties,
                                        feature.id!
                                    )
                                ),
                            (feature) =>
                                String(
                                    feature?.properties?.[config.labelProperty]
                                ),
                            'All Reservoirs',
                            String(ReservoirDefault),
                            config.id
                        );
                        reservoirOptions.push(...options);
                    }
                }
            }

            setReservoirOptions(reservoirOptions);
        } else {
            createDefaultOptions();
        }
    }, [region]);

    const handleChange = (option: ItemWithSource) => {
        if (!reservoirCollections || !map) {
            return;
        }

        if (!option || option.value === String(ReservoirDefault)) {
            setReservoir(ReservoirDefault);
            resetMap(map);
        } else if (option.source) {
            const config = getReservoirConfig(option.source as SourceId);
            const identifier =
                config && config.identifierType === 'number'
                    ? Number(option.value)
                    : option.value;
            if (config) {
                const collection = reservoirCollections[config.id];
                if (collection) {
                    const features = collection.features.filter(
                        (feature) =>
                            feature.properties &&
                            isReservoirIdentifier(
                                config,
                                feature.properties,
                                feature.id!,
                                identifier
                            )
                    );

                    if (features.length) {
                        const feature = features[0];
                        if (feature.properties) {
                            const region = feature.properties[
                                config.regionConnectorProperty
                            ] as string[] | string;
                            if (isMounted.current) {
                                setRegion(
                                    Array.isArray(region) ? region[0] : region
                                );
                            }
                        }
                    }
                }
            }

            setReservoir({
                identifier,
                source: option.source,
            });
        }
    };

    return (
        <Skeleton
            height={60} // Default dimensions of select
            width={207}
            visible={loading || reservoirOptions.length === 0}
            className={styles.skeleton}
        >
            <Select
                id="reservoirSelector"
                searchable
                data={reservoirOptions}
                value={String(reservoir?.identifier ?? null)}
                data-testid="reservoir-select"
                aria-label="Select a Reservior"
                placeholder="Select a Reservior"
                label="Find a Reservoir"
                onChange={(_, option) => handleChange(option)}
                clearable
            />
        </Skeleton>
    );
};
