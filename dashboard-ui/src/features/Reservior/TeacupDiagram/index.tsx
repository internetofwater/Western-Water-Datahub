/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import { Box } from '@mantine/core';
import { GeoJsonProperties } from 'geojson';
import { Graphic } from '@/features/Reservior/TeacupDiagram/Graphic';
import useMainStore from '@/lib/main';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
    showLabels: boolean;
    labels?: boolean;
    listeners?: boolean;
};

export const TeacupDiagram: React.FC<Props> = (props) => {
    const {
        reservoirProperties,
        config,
        showLabels,
        labels,
        listeners = true,
    } = props;

    const colorScheme = useMainStore((state) => state.colorScheme);

    return (
        <Box style={{ flex: 1, minWidth: 0 }}>
            <Graphic
                reservoirProperties={reservoirProperties}
                config={config}
                showLabels={showLabels}
                labels={labels}
                listeners={listeners}
                colorScheme={colorScheme}
            />
        </Box>
    );
};
