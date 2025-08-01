/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Select } from '@mantine/core';
import { useMap } from '@/contexts/MapContexts';
import { LayerId, MAP_ID, SubLayerId } from '@/features/Map/consts';
import { BoundingGeographyLevel } from '@/lib/types';
import useMainStore from '@/lib/main';
import { useEffect } from 'react';

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
};

export const BoundingGeography: React.FC = () => {
    const { map } = useMap(MAP_ID);
    const boundingGeographyLevel = useMainStore(
        (state) => state.boundingGeographyLevel
    );
    const setBoundingGeographyLevel = useMainStore(
        (state) => state.setBoundingGeographyLevel
    );

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

    return (
        <Select
            id="geographyLevelSelector"
            data={[
                {
                    value: BoundingGeographyLevel.Region,
                    label: 'Region',
                },
                {
                    value: BoundingGeographyLevel.Basin,
                    label: 'Basin',
                },
                {
                    value: BoundingGeographyLevel.State,
                    label: 'State',
                },
            ]}
            value={boundingGeographyLevel}
            aria-label="Select Geography Level"
            placeholder="Select Geography Level"
            onChange={(value) => {
                setBoundingGeographyLevel(value as BoundingGeographyLevel);
            }}
        />
    );
};
