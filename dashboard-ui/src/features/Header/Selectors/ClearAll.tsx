/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useMap } from '@/contexts/MapContexts';
import { INITIAL_CENTER, INITIAL_ZOOM, MAP_ID } from '@/features/Map/consts';
import Close from '@/icons/Close';
import useMainStore, { ReservoirDefault } from '@/lib/main';
import { ActionIcon } from '@mantine/core';

/**

 * @component
 */
export const ClearAll: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);

    const noSelections = region === 'all' && reservoir === ReservoirDefault;

    const { map } = useMap(MAP_ID);

    const handleClick = () => {
        setRegion('all');
        setReservoir(ReservoirDefault);
        if (map) {
            map.once('idle', () => {
                requestAnimationFrame(() => {
                    map.flyTo({
                        center: INITIAL_CENTER,
                        zoom: INITIAL_ZOOM,
                    });
                });
            });
        }
    };

    return (
        <ActionIcon
            variant="filled"
            aria-label="Clear all"
            title="Clear All"
            disabled={noSelections}
            onClick={handleClick}
        >
            <Close />
        </ActionIcon>
    );
};
