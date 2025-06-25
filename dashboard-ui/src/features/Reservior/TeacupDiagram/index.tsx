/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import { Box, Stack, useMantineColorScheme } from '@mantine/core';
import { GeoJsonProperties } from 'geojson';
import { Graphic } from '@/features/Reservior/TeacupDiagram/Graphic';
import styles from '@/features/Reservior/Reservoir.module.css';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
    showLabels: boolean;
};

export const TeacupDiagram: React.FC<Props> = (props) => {
    const { reservoirProperties, config, showLabels } = props;

    const { colorScheme } = useMantineColorScheme();

    return (
        <Stack h="100%" className={styles.graphicPanel}>
            <Box style={{ flex: 1, minWidth: 0 }}>
                <Graphic
                    reservoirProperties={reservoirProperties}
                    config={config}
                    showLabels={showLabels}
                    listeners
                    colorScheme={colorScheme}
                />
            </Box>
        </Stack>
    );
};
