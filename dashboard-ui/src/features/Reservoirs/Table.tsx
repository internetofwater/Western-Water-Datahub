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
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { MAP_ID } from '../Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { Feature, Point } from 'geojson';
import { OrganizedProperties } from './types';
import { chunk } from './utils';
import Controls from '@/icons/Controls';
import styles from '@/features/Reservoirs/Reservoirs.module.css';

type Props = {
    maxHeight: number;
    filteredReservoirs: Feature<Point, OrganizedProperties>[];
};
export const Table: React.FC<Props> = (props) => {
    const { filteredReservoirs } = props;

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
            return;
        }

        const currentChunk = chunkedLocations[page - 1];
        setCurrentChunk(currentChunk);
    }, [chunkedLocations, page]);

    const handleViewOnMap = (feature: Feature<Point>) => {
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

    const handlePageSizeChange = (pageSize: number) => {
        setPageSize(pageSize);
        setPage(1);
    };

    const textProps = {
        size: 'xs',
        fw: 700,
    };

    return (
        <Stack className={styles.tableWrapper}>
            <TableComponent
                striped
                stickyHeader
                withTableBorder
                withColumnBorders
                className={styles.table}
            >
                <TableThead>
                    <TableTr>
                        <TableTh>
                            <Stack>
                                <Text {...textProps}>Name</Text>
                                <Text {...textProps}>Date Measured</Text>
                            </Stack>
                        </TableTh>
                        <TableTh>
                            <Stack>
                                <Text {...textProps}>Storage</Text>
                                <Text {...textProps}>Capacity</Text>
                            </Stack>
                        </TableTh>
                        <TableTh>
                            <Stack>
                                <Text {...textProps}>% Full</Text>
                                <Text {...textProps}>% of Average</Text>
                            </Stack>
                        </TableTh>
                        <TableTh>
                            <Stack align="center" justify="center">
                                <Text {...textProps}>View on Map</Text>
                            </Stack>
                        </TableTh>
                        <TableTh>
                            <Stack align="center" justify="center">
                                <Text {...textProps}>See More</Text>
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
                        } = feature.properties;

                        const textProps = {
                            size: 'xs',
                        };

                        return (
                            <TableTr key={`row-${identifier}`}>
                                <TableTd>
                                    <Stack>
                                        <Text {...textProps}>{name}</Text>
                                        <Text {...textProps}>
                                            {dateMeasured}
                                        </Text>
                                    </Stack>
                                </TableTd>
                                <TableTd>
                                    <Stack>
                                        <Text {...textProps}>{storage}</Text>
                                        <Text {...textProps}>{capacity}</Text>
                                    </Stack>
                                </TableTd>
                                <TableTd>
                                    <Stack>
                                        <Text {...textProps}>
                                            {percentFull.toFixed(1)}%
                                        </Text>
                                        <Text {...textProps}>
                                            {percentAverage.toFixed(1)}%
                                        </Text>
                                    </Stack>
                                </TableTd>
                                <TableTd>
                                    <ActionIcon
                                        onClick={() => handleViewOnMap(feature)}
                                    >
                                        <Controls />
                                    </ActionIcon>
                                </TableTd>
                                <TableTd>
                                    <ActionIcon
                                        onClick={() => handleViewOnMap(feature)}
                                    >
                                        <Controls />
                                    </ActionIcon>
                                </TableTd>
                            </TableTr>
                        );
                    })}
                </TableTbody>
            </TableComponent>
            <Group justify="space-between" align="flex-end">
                <NumberInput
                    size="xs"
                    label="Locations per page"
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
