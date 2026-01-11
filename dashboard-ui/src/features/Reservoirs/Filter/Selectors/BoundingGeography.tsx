/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Group, Radio, RadioGroup } from '@mantine/core';
import { useMap } from '@/contexts/MapContexts';
import { LayerId, MAP_ID, SubLayerId } from '@/features/Map/consts';
import { BoundingGeographyLevel } from '@/stores/main/types';
import useMainStore from '@/stores/main';
import { useEffect } from 'react';
import { useLoading } from '@/hooks/useLoading';
import { BasinDefault, StateDefault } from '@/stores/main/consts';
import styles from '@/features/Reservoirs/Reservoirs.module.css';

export const BoundingGeometryVisibilityMap: {
    [key in BoundingGeographyLevel]: {
        [key in LayerId | SubLayerId]?: boolean;
    };
} = {
    [BoundingGeographyLevel.Region]: {
        [SubLayerId.RegionsFill]: true,
        [SubLayerId.RegionsBoundary]: true,
        [SubLayerId.BasinsFill]: false,
        [SubLayerId.BasinsBoundary]: false,
        [SubLayerId.StatesFill]: false,
        [SubLayerId.StatesBoundary]: false,
    },
    [BoundingGeographyLevel.Basin]: {
        [SubLayerId.RegionsFill]: false,
        [SubLayerId.RegionsBoundary]: false,
        [SubLayerId.BasinsFill]: true,
        [SubLayerId.BasinsBoundary]: true,
        [SubLayerId.StatesFill]: false,
        [SubLayerId.StatesBoundary]: false,
    },
    [BoundingGeographyLevel.State]: {
        [SubLayerId.RegionsFill]: false,
        [SubLayerId.RegionsBoundary]: false,
        [SubLayerId.BasinsFill]: false,
        [SubLayerId.BasinsBoundary]: false,
        [SubLayerId.StatesFill]: true,
        [SubLayerId.StatesBoundary]: true,
    },
    [BoundingGeographyLevel.None]: {
        [SubLayerId.RegionsFill]: false,
        [SubLayerId.RegionsBoundary]: false,
        [SubLayerId.BasinsFill]: false,
        [SubLayerId.BasinsBoundary]: false,
        [SubLayerId.StatesFill]: false,
        [SubLayerId.StatesBoundary]: false,
    },
};

const data = [
    {
        value: BoundingGeographyLevel.Region,
        label: 'DOI Region',
    },
    {
        value: BoundingGeographyLevel.Basin,
        label: 'Basin (HUC02)',
    },
    {
        value: BoundingGeographyLevel.State,
        label: 'State',
    },
    {
        value: BoundingGeographyLevel.None,
        label: 'None',
    },
];

export const BoundingGeography: React.FC = () => {
    const { map } = useMap(MAP_ID);
    const boundingGeographyLevel = useMainStore(
        (state) => state.boundingGeographyLevel
    );
    const setBoundingGeographyLevel = useMainStore(
        (state) => state.setBoundingGeographyLevel
    );
    const setRegion = useMainStore((state) => state.setRegion);
    const setBasin = useMainStore((state) => state.setBasin);
    const setState = useMainStore((state) => state.setState);

    const { isFetchingReservoirs } = useLoading();

    useEffect(() => {
        if (!map) {
            return;
        }

        const selectedVisibility =
            BoundingGeometryVisibilityMap[boundingGeographyLevel];

        Object.entries(selectedVisibility).forEach(([layerId, visibility]) => {
            map.setLayoutProperty(
                layerId,
                'visibility',
                visibility ? 'visible' : 'none'
            );
        });
    }, [boundingGeographyLevel]);

    const handleChange = (value: string) => {
        setRegion([]);
        setBasin(BasinDefault);
        setState(StateDefault);
        setBoundingGeographyLevel(value as BoundingGeographyLevel);
    };

    return (
        <RadioGroup
            size="xs"
            value={boundingGeographyLevel}
            onChange={handleChange}
        >
            <Group gap={8}>
                {data.map(({ value, label }) => (
                    <Radio
                        size="xs"
                        classNames={{ label: styles.label }}
                        disabled={isFetchingReservoirs}
                        data-disabled={isFetchingReservoirs}
                        key={`radio-geobound-${label}`}
                        value={value}
                        label={label}
                    />
                ))}
            </Group>
        </RadioGroup>
    );
};
