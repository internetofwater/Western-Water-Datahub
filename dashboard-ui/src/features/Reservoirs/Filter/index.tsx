/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main/main';
import { ActionIcon, Box, Group, Stack, Title } from '@mantine/core';
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
import FilterIcon from '@/icons/Filter';
import { useLoading } from '@/hooks/useLoading';

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

    const { isFetchingReservoirs } = useLoading();

    return (
        <Stack
            gap="calc(var(--default-spacing) / 2)"
            className={styles.filterWrapper}
        >
            <Group justify="space-between">
                <Title order={3} size="h5">
                    Filters
                </Title>
                <Box component="span" className={styles.filterIcon}>
                    <FilterIcon />
                </Box>
            </Group>
            <Group
                gap="var(--default-spacing)"
                my="calc(var(--default-spacing) / 2)"
                align="flex-end"
            >
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
                <Search search={search} handleChange={handleSearchChange} />
                <SortBy sortBy={sortBy} handleChange={handleSortByChange} />
                <ActionIcon
                    size="sm"
                    disabled={isFetchingReservoirs}
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
            <BoundingGeography />
        </Stack>
    );
};
