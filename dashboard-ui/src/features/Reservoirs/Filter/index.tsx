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
    Box,
    Group,
    Title,
} from '@mantine/core';
import { BoundingGeography } from './Selectors/BoundingGeography';
import { BoundingGeographyLevel } from '@/stores/main/types';
import { Region } from './Selectors/Region';
import { Basin } from './Selectors/Basin';
import { State } from './Selectors/State';
import { Search } from './Search';
import { SortBy } from './SortBy';
import { SortBy as SortByType } from '../types';
import styles from '@/features/Reservoirs/Reservoirs.module.css';

type Props = {
    search: string;
    handleSearchChange: (value: string) => void;
    sortBy: SortByType;
    handleSortByChange: (value: SortByType) => void;
};

export const Filter: React.FC<Props> = (props) => {
    const { search, handleSearchChange, sortBy, handleSortByChange } = props;

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
                        <Group gap={8} mt={8}>
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
                        </Group>
                    </Box>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};
