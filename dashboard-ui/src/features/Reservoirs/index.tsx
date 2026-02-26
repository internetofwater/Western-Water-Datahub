/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useReservoirData } from '@/hooks/useReservoirData';
import { Filter } from '@/features/Reservoirs/Filter';
import { useEffect, useMemo, useState } from 'react';
import {
    OrganizedFeature,
    OrganizedProperties,
    SortBy,
    SortOrder,
} from '@/features/Reservoirs/types';
import { Table } from '@/features/Reservoirs/Table';
import { getReservoirConfig } from '@/features/Map/utils';
import { MAP_ID, ReservoirConfigs, SourceId } from '@/features/Map/consts';
import dayjs from 'dayjs';
import useMainStore from '@/stores/main';
import Report from '@/features/Reservoirs/Report';
import useSessionStore from '@/stores/session';
import { useMap } from '@/contexts/MapContexts';
import { pointsWithinPolygon, polygon } from '@turf/turf';
import { MAX_POSITIONS } from '@/services/report/report.consts';
import { getKey } from './utils';

type Props = {
    accessToken: string;
};

const Reservoirs: React.FC<Props> = (props) => {
    const { accessToken } = props;

    const region = useMainStore((state) => state.region);
    const basin = useMainStore((state) => state.basin);
    const state = useMainStore((state) => state.state);

    const mapMoved = useSessionStore((state) => state.mapMoved);

    // Text string representing current search term
    const [search, setSearch] = useState('');
    // Which column is the table sorted by
    const [sortBy, setSortBy] = useState<SortBy>(SortBy.Capacity);
    // Only show reservoirs in the table & report that are w/in map extent
    const [limitByExtent, setLimitByExtent] = useState(true);
    // Select reservoirs for the report from the table
    const [pickFromTable, setPickFromTable] = useState(false);

    // Reservoirs included in the report
    const [selectedReservoirs, setSelectedReservoirs] = useState<string[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const { reservoirCollections } = useReservoirData();

    const { map } = useMap(MAP_ID);

    const getSortByProperty = (sortBy: SortBy): keyof OrganizedProperties => {
        switch (sortBy) {
            case SortBy.PercentFull:
                return 'percentFull';
            case SortBy.PercentAverage:
                return 'percentAverage';
            case SortBy.Storage:
                return 'storage';
            default:
            case SortBy.Capacity:
                return 'capacity';
        }
    };

    const getSort =
        (sortBy: SortBy, sortOrder: SortOrder) =>
        (featureA: OrganizedFeature, featureB: OrganizedFeature) => {
            const property = getSortByProperty(sortBy);
            const valueA = featureA.properties[property];
            const valueB = featureB.properties[property];

            if (typeof valueA !== 'number' || typeof valueB !== 'number') {
                return 0;
            }

            if (sortOrder === 'desc') {
                return valueB - valueA;
            }

            return valueA - valueB;
        };

    const organizedReservoirs = useMemo<OrganizedFeature[]>(() => {
        if (!reservoirCollections) {
            return [];
        }

        return Object.entries(reservoirCollections).flatMap(
            ([collectionId, featureCollection]) => {
                const config = getReservoirConfig(collectionId as SourceId);
                if (!config) return [];

                return featureCollection.features
                    .filter((feature) => Boolean(feature.properties))
                    .map((feature) => {
                        const props = feature.properties!;
                        const getNumber = (key: keyof typeof props) =>
                            Number(props[key]);
                        const getString = (key: keyof typeof props) =>
                            String(props[key]);

                        const storage = getNumber(config.storageProperty);
                        const capacity = getNumber(config.capacityProperty);
                        const average = getNumber(
                            config.thirtyYearAverageProperty
                        );
                        const regionConnector = getString(
                            config.regionConnectorProperty
                        );
                        const basinConnector = getString(
                            config.basinConnectorProperty
                        );
                        const stateConnector = getString(
                            config.stateConnectorProperty
                        );

                        return {
                            ...feature,
                            properties: {
                                ...feature.properties,
                                collectionId,
                                identifier:
                                    config.identifierType === 'number'
                                        ? Number(
                                              props[config.identifierProperty]
                                          )
                                        : String(
                                              props[config.identifierProperty]
                                          ),
                                name: getString(config.labelProperty),
                                dateMeasured: dayjs(
                                    getString(config.storageDateProperty)
                                ).format('MM/DD/YYYY'),
                                storage,
                                capacity,
                                percentFull: (storage / capacity) * 100,
                                percentAverage: (storage / average) * 100,
                                sourceId: collectionId,
                                regionConnector,
                                basinConnector,
                                stateConnector,
                            },
                        } as OrganizedFeature;
                    });
            }
        );
    }, [reservoirCollections]);

    const filteredReservoirs = useMemo<OrganizedFeature[]>(() => {
        if (organizedReservoirs.length === 0) {
            return [];
        }

        const filterFunctions: Array<(feature: OrganizedFeature) => boolean> =
            [];

        if (search.length > 0) {
            const lower = search.toLowerCase();
            filterFunctions.push((feature) =>
                feature.properties.name.toLowerCase().includes(lower)
            );
        }

        if (region.length > 0) {
            filterFunctions.push((feature) =>
                region.includes(feature.properties.regionConnector)
            );
        }
        if (basin.length > 0) {
            filterFunctions.push((feature) =>
                basin.includes(feature.properties.basinConnector.slice(0, 2))
            );
        }
        if (state.length > 0) {
            filterFunctions.push((feature) =>
                state.includes(feature.properties.stateConnector)
            );
        }

        return organizedReservoirs
            .filter(
                (feature) =>
                    filterFunctions.length === 0 ||
                    filterFunctions.every((filter) => filter(feature))
            )
            .sort(getSort(sortBy, sortOrder));
    }, [organizedReservoirs, search, region, basin, state, sortBy, sortOrder]);

    const showByExtent = useMemo(
        () => (limitByExtent ? mapMoved : 0),
        [limitByExtent, mapMoved]
    );

    const limitedReservoirs = useMemo<OrganizedFeature[]>(() => {
        if (!map) {
            return [];
        }

        if (filteredReservoirs.length === 0) {
            return [];
        }

        if (!limitByExtent) {
            return filteredReservoirs;
        }

        const bounds = map.getBounds();
        if (bounds) {
            const southWest = bounds.getSouthWest();
            const northEast = bounds.getNorthEast();
            const southEast = bounds.getSouthEast();
            const northWest = bounds.getNorthWest();

            const bbox = polygon([
                [
                    [northEast.lng, northEast.lat],
                    [northWest.lng, northWest.lat],
                    [southWest.lng, southWest.lat],
                    [southEast.lng, southEast.lat],
                    [northEast.lng, northEast.lat],
                ],
            ]);

            const contained = pointsWithinPolygon(
                { type: 'FeatureCollection', features: filteredReservoirs },
                bbox
            );

            return contained.features as OrganizedFeature[];
        }

        // Fallback, more expensive function call
        const renderedFeatures = map.queryRenderedFeatures({
            layers: ReservoirConfigs.filter((config) =>
                map.getLayer(config.mainLayer)
            ).map((config) => config.mainLayer),
        });

        return filteredReservoirs.filter((reservoir) =>
            renderedFeatures.some(
                (renderedFeature) => renderedFeature.id === reservoir.id
            )
        );
    }, [showByExtent]);

    useEffect(() => {
        if (pickFromTable) {
            return;
        }

        const newSelectedReservoirs = [];
        for (const reservoirIdentifier of selectedReservoirs) {
            const [id, sourceId] = reservoirIdentifier.split('_');

            if (
                limitedReservoirs.some(
                    (reservoir) =>
                        String(reservoir.id) === id &&
                        reservoir.properties.sourceId === sourceId
                )
            ) {
                newSelectedReservoirs.push(`${id}_${sourceId}`);
            }
        }

        if (newSelectedReservoirs.length < MAX_POSITIONS) {
            const selectionSet = new Set(newSelectedReservoirs);

            for (const feature of limitedReservoirs) {
                if (newSelectedReservoirs.length >= MAX_POSITIONS) {
                    break;
                }

                const key = getKey(feature);
                if (!selectionSet.has(key)) {
                    newSelectedReservoirs.push(key);
                    selectionSet.add(key);
                }
            }
        }

        setSelectedReservoirs(newSelectedReservoirs);
    }, [limitedReservoirs]);

    const handleSearchChange = (search: string) => setSearch(search);
    const handleSortByChange = (sortBy: SortBy) => setSortBy(sortBy);
    const handleSortOrderChange = (sortOrder: SortOrder) =>
        setSortOrder(sortOrder);
    const handleLimitByExtentChange = (limitByExtent: boolean) =>
        setLimitByExtent(limitByExtent);
    const handlePickFromTableChange = (pickFromTable: boolean) =>
        setPickFromTable(pickFromTable);
    const handleSelectedReservoirsChange = (selectedReservoirs: string[]) =>
        setSelectedReservoirs(selectedReservoirs);

    return (
        <>
            <Filter
                search={search}
                onSearchChange={handleSearchChange}
                sortBy={sortBy}
                onSortByChange={handleSortByChange}
                sortOrder={sortOrder}
                onSortOrderChange={handleSortOrderChange}
                limitByExtent={limitByExtent}
                onLimitByExtentChange={handleLimitByExtentChange}
            />
            <Report
                accessToken={accessToken}
                reservoirs={limitedReservoirs}
                pickFromTable={pickFromTable}
                onPickFromTableChange={handlePickFromTableChange}
                selectedReservoirs={selectedReservoirs}
                onSelectedReservoirsChange={handleSelectedReservoirsChange}
            />
            {filteredReservoirs && (
                <Table
                    reservoirs={limitedReservoirs}
                    pickFromTable={pickFromTable}
                    selectedReservoirs={selectedReservoirs}
                    onSelectedReservoirsChange={handleSelectedReservoirsChange}
                />
            )}
        </>
    );
};

export default Reservoirs;
