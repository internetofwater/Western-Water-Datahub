/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import { GeoJsonProperties } from 'geojson';
import { Graphic } from '@/features/Reservior/TeacupDiagram/Graphic';
import useMainStore from '@/stores/main/main';

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
        <Graphic
            reservoirProperties={reservoirProperties}
            config={config}
            showLabels={showLabels}
            labels={labels}
            listeners={listeners}
            colorScheme={colorScheme}
        />
    );
};
