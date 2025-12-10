/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main/main';
import {
    Accordion,
    AccordionControl,
    AccordionItem,
    AccordionPanel,
    ActionIcon,
    Box,
    Group,
    Title,
} from '@mantine/core';
import { BoundingGeography } from '@/features/Reservoirs/Filter/Selectors/BoundingGeography';
import { BoundingGeographyLevel } from '@/stores/main/types';
import { Region } from '@/features/Reservoirs/Filter/Selectors/Region';
import { Basin } from '@/features/Reservoirs/Filter/Selectors/Basin';
import { State } from '@/features/Reservoirs/Filter/Selectors/State';
import { Search } from '@/features/Reservoirs/Filter/Search';
import { SortBy } from '@/features/Reservoirs/Filter/SortBy';
import { SortBy as SortByType, SortOrder } from '@/features/Reservoirs/types';
import styles from '@/features/Reservoirs/Reservoirs.module.css';
import Up from '@/icons/Up';

type Props = {
    search: string;
    handleSearchChange: (value: string) => void;
    sortBy: SortByType;
    handleSortByChange: (value: SortByType) => void;
    sortOrder: SortOrder;
    handleSortOrderChange: (value: SortOrder) => void;
};

export const Filter: React.FC<Props> = (props) => {
    const {
        search,
        handleSearchChange,
        sortBy,
        handleSortByChange,
        sortOrder,
        handleSortOrderChange,
    } = props;

    const boundingGeographyLevel = useMainStore(
        (state) => state.boundingGeographyLevel
    );

    return (
        <Accordion classNames={{ content: styles.content }}>
            <AccordionItem id="filters-accordion" value="filters-accordion">
                <AccordionControl>
                    <Title order={3} size="h5">
                        Filters
                    </Title>
                </AccordionControl>
                <AccordionPanel>
                    <Box m={16}>
                        <BoundingGeography />
                        <Group gap={8} mt={8} align="flex-end">
                            <Box
                                style={{
                                    display:
                                        boundingGeographyLevel ===
                                        BoundingGeographyLevel.Region
                                            ? 'block'
                                            : 'none',
                                }}
                            >
                                <Region />
                            </Box>
                            <Box
                                style={{
                                    display:
                                        boundingGeographyLevel ===
                                        BoundingGeographyLevel.Basin
                                            ? 'block'
                                            : 'none',
                                }}
                            >
                                <Basin />
                            </Box>
                            <Box
                                style={{
                                    display:
                                        boundingGeographyLevel ===
                                        BoundingGeographyLevel.State
                                            ? 'block'
                                            : 'none',
                                }}
                            >
                                <State />
                            </Box>
                            <Search
                                search={search}
                                handleChange={handleSearchChange}
                            />
                            <SortBy
                                sortBy={sortBy}
                                handleChange={handleSortByChange}
                            />
                            <ActionIcon
                                size="sm"
                                variant="filled"
                                className={`${styles.sortOrderButton} ${
                                    sortOrder === 'asc' ? styles.rotate180 : ''
                                }`}
                                onClick={() =>
                                    handleSortOrderChange(
                                        sortOrder === 'asc' ? 'desc' : 'asc'
                                    )
                                }
                            >
                                <Up />
                            </ActionIcon>
                        </Group>
                    </Box>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};
