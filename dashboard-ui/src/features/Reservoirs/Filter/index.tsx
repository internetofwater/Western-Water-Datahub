/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/stores/main';
import {
    ActionIcon,
    Box,
    Divider,
    Group,
    Stack,
    Switch,
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
import FilterIcon from '@/icons/Filter';
import { useLoading } from '@/hooks/useLoading';
import { ReservoirDateSelector } from '@/features/Reservoirs/ReservoirDateSelector';
import { ManagingRegion } from './Selectors/ManagingRegion';

type Props = {
    search: string;
    handleSearchChange: (value: string) => void;
    sortBy: SortByType;
    handleSortByChange: (value: SortByType) => void;
    sortOrder: SortOrder;
    handleSortOrderChange: (value: SortOrder) => void;
    hideNoData: boolean;
    handleHideNoDataChange: (hideNoData: boolean) => void;
    limitByExtent: boolean;
    onLimitByExtentChange: (limitByExtent: boolean) => void;
};

export const Filter: React.FC<Props> = (props) => {
    const {
        search,
        handleSearchChange,
        sortBy,
        handleSortByChange,
        sortOrder,
        handleSortOrderChange,
        hideNoData,
        handleHideNoDataChange,
        limitByExtent,
        onLimitByExtentChange,
    } = props;

    const boundingGeographyLevel = useMainStore(
        (state) => state.boundingGeographyLevel
    );
    const showAllLabels = useMainStore((state) => state.showAllLabels);
    const setShowAllLabels = useMainStore((state) => state.setShowAllLabels);

    const { isFetchingReservoirs, isGeneratingReport } = useLoading();

    const handleLabelsChange = () => {
        setShowAllLabels(!showAllLabels);
    };

    const getLabel = (boundingGeographyLevel: BoundingGeographyLevel) => {
        switch (boundingGeographyLevel) {
            case BoundingGeographyLevel.Region:
                return 'Show Region Labels';
            case BoundingGeographyLevel.ManagingRegion:
                return 'Show Managing Region Labels';
            case BoundingGeographyLevel.Basin:
                return 'Show Basin Labels';
            case BoundingGeographyLevel.State:
                return 'Show State Labels';
            case BoundingGeographyLevel.None:
            default:
                return 'Show Labels';
        }
    };

    const isDisabled = isFetchingReservoirs || isGeneratingReport;

    const labelsSwitchProps = isDisabled ? { 'data-disabled': true } : {};
    return (
        <Stack
            gap="calc(var(--default-spacing) / 2)"
            className={styles.filterWrapper}
        >
            <Group
                justify="space-between"
                mt="calc(var(--default-spacing) / 2)"
            >
                <Title order={3} size="h4">
                    Filters
                </Title>
                <Box component="span" className={styles.filterIcon}>
                    <FilterIcon />
                </Box>
            </Group>
            <ReservoirDateSelector />
            <Divider my="calc(var(--default-spacing) / 2)" />
            <Group
                gap="var(--default-spacing)"
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
                            BoundingGeographyLevel.ManagingRegion
                                ? 'block'
                                : 'none',
                    }}
                >
                    <ManagingRegion />
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
                    disabled={isDisabled}
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
            <Divider my="calc(var(--default-spacing) / 2)" />
            <Group
                gap="var(--default-spacing)"
                mt="calc(var(--default-spacing) / 2)"
            >
                {boundingGeographyLevel !== BoundingGeographyLevel.None && (
                    <Switch
                        size="xs"
                        disabled={isDisabled}
                        classNames={{ label: styles.label }}
                        label={getLabel(boundingGeographyLevel)}
                        checked={showAllLabels}
                        onClick={handleLabelsChange}
                        {...labelsSwitchProps}
                    />
                )}
                <Switch
                    size="xs"
                    disabled={isDisabled}
                    classNames={{ label: styles.label }}
                    label={'Hide reservoirs with no data'}
                    checked={hideNoData}
                    onClick={(e) =>
                        handleHideNoDataChange(e.currentTarget.checked)
                    }
                    {...labelsSwitchProps}
                />
                <Switch
                    size="xs"
                    disabled={isDisabled}
                    classNames={{ label: styles.label }}
                    label="Hide off-screen reservoirs"
                    checked={limitByExtent}
                    onClick={(event) =>
                        onLimitByExtentChange(event.currentTarget.checked)
                    }
                    {...labelsSwitchProps}
                />
            </Group>
        </Stack>
    );
};
