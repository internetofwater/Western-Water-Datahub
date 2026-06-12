/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { Filters } from '../types';
import { List, Text } from '@mantine/core';
import { getSortByLabel, getSortOrderLabel } from '../utils';
import { joinSentence } from '@/utils/joinSentence';

const getGeoBoundBullet = (
    bounds: Filters['region' | 'basin' | 'state'],
    title: string
) => {
    const label = bounds.length === 1 ? title : `${title}s`;

    return `Reservoirs within the ${joinSentence(bounds, 'and')} ${label}`;
};

type Props = {
    filters: Filters;
};

export const TooltipDetail: React.FC<Props> = (props) => {
    const { filters } = props;

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
            bullets.push(getGeoBoundBullet(filters.region, 'region'));
        }

        if (filters.basin.length > 0) {
            bullets.push(getGeoBoundBullet(filters.basin, 'basin'));
        }

        if (filters.state.length > 0) {
            bullets.push(getGeoBoundBullet(filters.state, 'state'));
        }

        setBullets(bullets);
    }, [filters]);

    return (
        <>
            <Text size="sm">
                Showing the top reservoirs as they are shown in the table based
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
