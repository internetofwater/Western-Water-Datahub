/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { Filters } from '@/features/Reservoirs/types';
import { ComboboxItem, List, Text } from '@mantine/core';
import { getSortByLabel, getSortOrderLabel } from '@/features/Reservoirs/utils';
import { joinSentence } from '@/utils/joinSentence';
import useMainStore from '@/stores/main';

const getGeoBoundBullet = (
    bounds: Filters['region' | 'basin' | 'state'],
    title: string = ''
) => {
    if (title.length > 0) {
        const label = bounds.length === 1 ? title : `${title}s`;

        return `Reservoirs within the ${joinSentence(bounds, 'and')} ${label}`;
    }

    return `Reservoirs within ${joinSentence(bounds, 'and')}`;
};

const getLabels = (values: string[], options: ComboboxItem[]) => {
    return values.map((value) => {
        const option = options.find((option) => option.value === value);

        return option?.label || value;
    });
};

type Props = {
    filters: Filters;
};

export const TooltipDetail: React.FC<Props> = (props) => {
    const { filters } = props;

    const regionOptions = useMainStore((state) => state.regionOptions);
    const basinOptions = useMainStore((state) => state.basinOptions);
    const stateOptions = useMainStore((state) => state.stateOptions);

    const [bullets, setBullets] = useState<string[]>([]);

    useEffect(() => {
        const bullets = [
            `The ${getSortByLabel(filters.sortBy)} value in ${getSortOrderLabel(filters.sortOrder)} order`,
        ];

        if (filters.search.length > 0) {
            bullets.push(`Names matching the search term: "${filters.search}"`);
        }

        if (filters.hideNoData) {
            bullets.push('Reserviors that have data');
        }

        if (filters.limitByExtent) {
            bullets.push('Reservoirs visible on the map to the right');
        }

        if (filters.region.length > 0) {
            const labels = getLabels(filters.region, regionOptions);
            bullets.push(getGeoBoundBullet(labels, 'region'));
        }

        if (filters.basin.length > 0) {
            const labels = getLabels(filters.basin, basinOptions);
            bullets.push(getGeoBoundBullet(labels, 'basin'));
        }

        if (filters.state.length > 0) {
            const labels = getLabels(filters.state, stateOptions);
            bullets.push(getGeoBoundBullet(labels));
        }

        setBullets(bullets);
    }, [filters]);

    return (
        <>
            <Text size="sm">
                Showing the top reservoirs as they appear in the table, based
                on:
            </Text>
            <List size="sm">
                {bullets.map((bullet) => (
                    <List.Item key={bullet.toLowerCase().split(' ').join('-')}>
                        {bullet}
                    </List.Item>
                ))}
            </List>
        </>
    );
};
