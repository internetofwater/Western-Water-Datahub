/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main';
import { ActionIcon, Box, Group, Stack, Switch, Title } from '@mantine/core';
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
    limitByExtent: boolean;
    handleLimitByExtentChange: (limitByExtent: boolean) => void;
};

export const Filter: React.FC<Props> = (props) => {
    const {
        search,
        handleSearchChange,
        sortBy,
        handleSortByChange,
        sortOrder,
        handleSortOrderChange,
        limitByExtent,
        handleLimitByExtentChange,
    } = props;

    const boundingGeographyLevel = useMainStore(
        (state) => state.boundingGeographyLevel
    );
    const showAllLabels = useMainStore((state) => state.showAllLabels);
    const setShowAllLabels = useMainStore((state) => state.setShowAllLabels);

    const { isFetchingReservoirs } = useLoading();

    const handleLabelsChange = () => {
        setShowAllLabels(!showAllLabels);
    };

    const getLabel = (boundingGeographyLevel: BoundingGeographyLevel) => {
        switch (boundingGeographyLevel) {
            case BoundingGeographyLevel.Region:
                return 'Show Region Labels';
            case BoundingGeographyLevel.Basin:
                return 'Show Basin Labels';
            case BoundingGeographyLevel.State:
                return 'Show State Labels';
            case BoundingGeographyLevel.None:
            default:
                return 'Show Labels';
        }
    };

    const labelsSwitchProps = isFetchingReservoirs
        ? { 'data-disabled': true }
        : {};
    return (
        <Stack
            gap="calc(var(--default-spacing) / 2)"
            className={styles.filterWrapper}
        >
            <Group
                justify="space-between"
                my="calc(var(--default-spacing) / 2)"
            >
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
                align="flex-start"
                wrap="nowrap"
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
                    classNames={{
                        root: styles.actionIconRoot,
                        icon: styles.actionIcon,
                    }}
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
            <Group>
                {boundingGeographyLevel !== BoundingGeographyLevel.None && (
                    <Switch
                        size="xs"
                        mt="calc(var(--default-spacing) / 2)"
                        disabled={isFetchingReservoirs}
                        classNames={{ label: styles.label }}
                        label={getLabel(boundingGeographyLevel)}
                        checked={showAllLabels}
                        onClick={handleLabelsChange}
                        {...labelsSwitchProps}
                    />
                )}
                <Switch
                    size="xs"
                    mt="calc(var(--default-spacing) / 2)"
                    disabled={isFetchingReservoirs}
                    classNames={{ label: styles.label }}
                    label="Hide Reservoirs not on Map"
                    checked={limitByExtent}
                    onClick={(event) =>
                        handleLimitByExtentChange(event.currentTarget.checked)
                    }
                    {...labelsSwitchProps}
                />
            </Group>
        </Stack>
    );
};
