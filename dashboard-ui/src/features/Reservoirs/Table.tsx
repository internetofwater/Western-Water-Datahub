/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    ActionIcon,
    Group,
    NumberInput,
    Pagination,
    Stack,
    Table as TableComponent,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
    Text,
    Tooltip,
} from '@mantine/core';
import { MouseEvent, useEffect, useState } from 'react';
import { MAP_ID, SourceId } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { Feature, Point } from 'geojson';
import { OrganizedProperties } from '@/features/Reservoirs/types';
import { chunk } from '@/features/Reservoirs/utils';
import styles from '@/features/Reservoirs/Reservoirs.module.css';
import useMainStore from '@/stores/main/main';
import useSessionStore from '@/stores/session';
import { getReservoirConfig } from '@/features/Map/utils';
import MapSearch from '@/icons/MapSearch';

type Props = {
    filteredReservoirs: Feature<Point, OrganizedProperties>[];
};
export const Table: React.FC<Props> = (props) => {
    const { filteredReservoirs } = props;

    const setReservoir = useMainStore((state) => state.setReservoir);
    const setHighlight = useSessionStore((state) => state.setHighlight);

    const [chunkedLocations, setChunkedLocations] = useState<
        Feature<Point, OrganizedProperties>[][]
    >([]);
    const [currentChunk, setCurrentChunk] = useState<
        Feature<Point, OrganizedProperties>[]
    >([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { map } = useMap(MAP_ID);

    useEffect(() => {
        const chunkedLocations = chunk(filteredReservoirs, pageSize);
        setChunkedLocations(chunkedLocations);
    }, [filteredReservoirs, pageSize]);

    useEffect(() => {
        if (chunkedLocations.length === 0 || chunkedLocations.length < page) {
            setCurrentChunk([]);
            return;
        }

        const currentChunk = chunkedLocations[page - 1];
        setCurrentChunk(currentChunk);
    }, [chunkedLocations, page]);

    const handleViewOnMap = (
        event: MouseEvent<HTMLButtonElement>,
        feature: Feature<Point>
    ) => {
        event.stopPropagation();

        if (!map) {
            return;
        }
        map.flyTo({
            center: feature.geometry.coordinates as [number, number],
            zoom: 10, // Desired zoom level
            speed: 1.2, // Animation speed (default is 1.2)
            curve: 1.42, // Flight curve (default is 1.42)
            essential: true, // Ensures animation is not skipped for accessibility
        });
    };

    const handleSeeMore = (
        identifier: OrganizedProperties['identifier'],
        source: OrganizedProperties['sourceId']
    ) => {
        setReservoir({
            identifier,
            source,
        });
        setHighlight(null);
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPageSize(pageSize);
        setPage(1);
    };

    const handleMouseOver = (feature: Feature<Point>) => {
        if (!feature.properties) {
            return;
        }

        const config = getReservoirConfig(
            feature.properties.collectionId as SourceId
        );

        if (config) {
            const correctedFeature = {
                ...feature,
                properties: {
                    ...feature.properties,
                    [config.storageProperty]: Number(
                        feature.properties.storage
                    ),
                    [config.capacityProperty]: Number(
                        feature.properties.capacity
                    ),
                },
            };

            setHighlight({ feature: correctedFeature, config });
        }
    };

    const handleMouseExit = () => {
        setHighlight(null);
    };

    const textProps = {
        size: 'xs',
        fw: 700,
    };

    const stackProps = {
        gap: 'var(--default-spacing)',
    };

    return (
        <Stack className={styles.tableWrapper} pb={16}>
            <TableComponent
                striped
                stickyHeader
                withTableBorder
                withColumnBorders
                className={styles.table}
            >
                <TableThead>
                    <TableTr>
                        <TableTh className={styles.nameColumn}>
                            <Stack {...stackProps}>
                                <Text {...textProps}>Name</Text>
                                <Text {...textProps}>Date Measured</Text>
                            </Stack>
                        </TableTh>
                        <TableTh>
                            <Stack {...stackProps}>
                                <Text {...textProps}>
                                    Storage
                                    <br /> (acre-feet)
                                </Text>
                                <Text {...textProps}>
                                    Capacity
                                    <br /> (acre-feet)
                                </Text>
                            </Stack>
                        </TableTh>
                        <TableTh>
                            <Stack {...stackProps}>
                                <Text {...textProps}>% Full</Text>
                                <Text {...textProps}>% of Average</Text>
                            </Stack>
                        </TableTh>
                        <TableTh className={styles.buttonColumn}>
                            <Stack
                                {...stackProps}
                                align="center"
                                justify="center"
                            >
                                <Text {...textProps} ta="center">
                                    View on Map
                                </Text>
                            </Stack>
                        </TableTh>
                    </TableTr>
                </TableThead>
                <TableTbody>
                    {currentChunk.map((feature) => {
                        const {
                            identifier,
                            name,
                            dateMeasured,
                            storage,
                            capacity,
                            percentFull,
                            percentAverage,
                            sourceId,
                        } = feature.properties;

                        const textProps = {
                            size: 'xs',
                        };

                        const rowLabel = `Reservoir ${name}, measured ${dateMeasured}. Storage ${storage.toLocaleString(
                            'en-US'
                        )}, Capacity ${capacity.toLocaleString(
                            'en-US'
                        )}. ${percentFull.toFixed(1)} percent full.`;

                        const onRowActivate = () => {
                            handleSeeMore(identifier, sourceId);
                        };

                        const onRowKeyDown: React.KeyboardEventHandler<
                            HTMLTableRowElement
                        > = (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onRowActivate();
                            }
                        };

                        return (
                            <Tooltip
                                label="Click to learn more."
                                openDelay={500}
                                key={`row-${identifier}`}
                            >
                                <TableTr
                                    className={styles.row}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={rowLabel}
                                    onClick={onRowActivate}
                                    onKeyDown={onRowKeyDown}
                                    onMouseEnter={() =>
                                        handleMouseOver(feature)
                                    }
                                    onMouseLeave={() => handleMouseExit()}
                                >
                                    <TableTd>
                                        <Stack {...stackProps}>
                                            <Text {...textProps} fw="bold">
                                                {name}
                                            </Text>
                                            <Text {...textProps}>
                                                {dateMeasured}
                                            </Text>
                                        </Stack>
                                    </TableTd>
                                    <TableTd>
                                        <Stack
                                            {...stackProps}
                                            justify="space-between"
                                        >
                                            <Text {...textProps}>
                                                {storage.toLocaleString(
                                                    'en-US'
                                                )}
                                            </Text>
                                            <Text {...textProps}>
                                                {capacity.toLocaleString(
                                                    'en-US'
                                                )}
                                            </Text>
                                        </Stack>
                                    </TableTd>
                                    <TableTd>
                                        <Stack
                                            {...stackProps}
                                            justify="space-between"
                                        >
                                            <Text {...textProps}>
                                                {percentFull.toFixed(1)}%
                                            </Text>
                                            <Text {...textProps}>
                                                {percentAverage.toFixed(1)}%
                                            </Text>
                                        </Stack>
                                    </TableTd>
                                    <TableTd>
                                        <Group justify="center" align="center">
                                            <ActionIcon
                                                title={`Go to ${name} on the map`}
                                                onClick={(e) =>
                                                    handleViewOnMap(e, feature)
                                                }
                                            >
                                                <MapSearch />
                                            </ActionIcon>
                                        </Group>
                                    </TableTd>
                                </TableTr>
                            </Tooltip>
                        );
                    })}
                </TableTbody>
            </TableComponent>
            <Group justify="space-between" align="flex-end" mx={8}>
                <NumberInput
                    size="xs"
                    className={styles.pageSizeInput}
                    label="Reservoirs per page"
                    disabled={currentChunk.length === 0}
                    data-disabled={currentChunk.length === 0}
                    value={pageSize}
                    onChange={(value) => handlePageSizeChange(Number(value))}
                    min={1}
                    max={filteredReservoirs.length}
                />
                <Pagination
                    size="sm"
                    total={chunkedLocations.length}
                    value={page}
                    onChange={setPage}
                    mt="sm"
                />
            </Group>
        </Stack>
    );
};
