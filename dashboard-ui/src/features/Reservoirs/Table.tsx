/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    ActionIcon,
    Checkbox,
    Group,
    Loader,
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
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { MAP_ID, SourceId } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { Feature, Point } from 'geojson';
import { OrganizedProperties } from '@/features/Reservoirs/types';
import { chunk, getKey } from '@/features/Reservoirs/utils';
import styles from '@/features/Reservoirs/Reservoirs.module.css';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { getReservoirConfig } from '@/features/Map/utils';
import MapSearch from '@/icons/MapSearch';
import { useLoading } from '@/hooks/useLoading';
import {
    displayDate,
    displayPercentage,
    displayVolume,
} from '@/utils/reservoirDataDisplay';
import { MAX_POSITIONS } from '@/services/report/report.consts';

type Props = {
    reservoirs: Feature<Point, OrganizedProperties>[];
    pickFromTable: boolean;
    selectedReservoirs: string[];
    onSelectedReservoirsChange: (selectedReservoirs: string[]) => void;
};
export const Table: React.FC<Props> = (props) => {
    const {
        reservoirs,
        pickFromTable,
        selectedReservoirs,
        onSelectedReservoirsChange,
    } = props;

    const setReservoir = useMainStore((state) => state.setReservoir);
    const setHighlight = useSessionStore((state) => state.setHighlight);

    const [chunkedLocations, setChunkedLocations] = useState<
        Feature<Point, OrganizedProperties>[][]
    >([]);
    const [currentChunk, setCurrentChunk] = useState<
        Feature<Point, OrganizedProperties>[]
    >([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    // Dont display no data found on page load prior to reservoir fetch
    const [initialLoad, setInitialLoad] = useState(true);

    const { map } = useMap(MAP_ID);

    const { isFetchingReservoirs } = useLoading();

    useEffect(() => {
        if (initialLoad) {
            setInitialLoad(false);
        }

        const chunkedLocations = chunk(reservoirs, pageSize);
        setChunkedLocations(chunkedLocations);
    }, [reservoirs, pageSize]);

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
            zoom: 10,
            speed: 1.2,
            curve: 1.42,
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

    const handleSelectionChange = (
        event: ChangeEvent<HTMLInputElement>,
        key: string
    ) => {
        const selected = event.currentTarget.checked;
        if (selected) {
            const newSelectedReservoirs = [...selectedReservoirs, key];

            onSelectedReservoirsChange(newSelectedReservoirs);
        } else {
            const newSelectedReservoirs = selectedReservoirs.filter(
                (selectedReservoir) => selectedReservoir !== key
            );

            onSelectedReservoirsChange(newSelectedReservoirs);
        }
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
                        {pickFromTable && <TableTh />}
                        <TableTh
                            className={
                                pickFromTable
                                    ? styles.nameColumnSmall
                                    : styles.nameColumn
                            }
                        >
                            <Stack {...stackProps}>
                                <Text {...textProps}>Name</Text>
                                <Text {...textProps}>Date Measured</Text>
                            </Stack>
                        </TableTh>
                        <TableTh align="right">
                            <Stack {...stackProps} align="flex-end">
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
                        <TableTh align="right">
                            <Stack {...stackProps} align="flex-end">
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
                    {currentChunk.length === 0 ? (
                        <TableTr tabIndex={0}>
                            <TableTd colSpan={4} ta={'center'}>
                                {initialLoad || isFetchingReservoirs ? (
                                    <Loader />
                                ) : (
                                    <> No Reservoirs Found</>
                                )}
                            </TableTd>
                        </TableTr>
                    ) : (
                        <>
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

                                const key = getKey(feature);

                                const selectedReservoir =
                                    selectedReservoirs.includes(key);

                                const rowLabel = `Reservoir ${name}, measured ${displayDate(dateMeasured)}. Storage ${displayVolume(storage)}, Capacity ${displayVolume(capacity)}. ${displayPercentage(percentFull)} percent full.`;

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
                                            onMouseLeave={() =>
                                                handleMouseExit()
                                            }
                                        >
                                            {pickFromTable && (
                                                <TableTd>
                                                    <Group
                                                        justify="center"
                                                        align="center"
                                                    >
                                                        <Checkbox
                                                            size="xs"
                                                            disabled={
                                                                !selectedReservoir &&
                                                                selectedReservoirs.length ===
                                                                    MAX_POSITIONS
                                                            }
                                                            checked={
                                                                selectedReservoir
                                                            }
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            onChange={(e) =>
                                                                handleSelectionChange(
                                                                    e,
                                                                    key
                                                                )
                                                            }
                                                        />
                                                    </Group>
                                                </TableTd>
                                            )}
                                            <TableTd>
                                                <Stack {...stackProps}>
                                                    <Text
                                                        {...textProps}
                                                        fw="bold"
                                                    >
                                                        {name}
                                                    </Text>
                                                    <Text {...textProps}>
                                                        {displayDate(
                                                            dateMeasured
                                                        )}
                                                    </Text>
                                                </Stack>
                                            </TableTd>
                                            <TableTd align="right">
                                                <Stack
                                                    {...stackProps}
                                                    justify="space-between"
                                                >
                                                    <Text {...textProps}>
                                                        {displayVolume(storage)}
                                                    </Text>
                                                    <Text {...textProps}>
                                                        {displayVolume(
                                                            capacity
                                                        )}
                                                    </Text>
                                                </Stack>
                                            </TableTd>
                                            <TableTd align="right">
                                                <Stack
                                                    {...stackProps}
                                                    justify="space-between"
                                                >
                                                    <Text {...textProps}>
                                                        {displayPercentage(
                                                            percentFull
                                                        )}
                                                    </Text>
                                                    <Text {...textProps}>
                                                        {displayPercentage(
                                                            percentAverage
                                                        )}
                                                    </Text>
                                                </Stack>
                                            </TableTd>
                                            <TableTd>
                                                <Group
                                                    justify="center"
                                                    align="center"
                                                >
                                                    <ActionIcon
                                                        title={`Go to ${name} on the map`}
                                                        onClick={(e) =>
                                                            handleViewOnMap(
                                                                e,
                                                                feature
                                                            )
                                                        }
                                                        classNames={{
                                                            root: styles.actionIconRoot,
                                                            icon: styles.actionIcon,
                                                        }}
                                                    >
                                                        <MapSearch />
                                                    </ActionIcon>
                                                </Group>
                                            </TableTd>
                                        </TableTr>
                                    </Tooltip>
                                );
                            })}
                        </>
                    )}
                </TableTbody>
            </TableComponent>
            <Group
                justify="space-between"
                align="flex-end"
                mx={8}
                className={styles.pageControls}
            >
                <NumberInput
                    size="xs"
                    className={styles.pageSizeInput}
                    label="Reservoirs per page"
                    disabled={currentChunk.length === 0}
                    data-disabled={currentChunk.length === 0}
                    value={pageSize}
                    onChange={(value) => handlePageSizeChange(Number(value))}
                    min={1}
                    max={reservoirs.length}
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
