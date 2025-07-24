/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useMap } from '@/contexts/MapContexts';
import { INITIAL_CENTER, INITIAL_ZOOM, MAP_ID } from '@/features/Map/consts';
import { RegionDefault, ReservoirDefault } from '@/lib/consts';
import useMainStore from '@/lib/main';
import { Button } from '@mantine/core';

/**

 * @component
 */
export const ClearAll: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);

    const noSelections =
        region === RegionDefault && reservoir === ReservoirDefault;

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
                        speed: 2,
                    });
                });
            });
        }
    };

    return (
        <Button
            variant="filled"
            aria-label="Clear all"
            title="Clear All"
            disabled={noSelections}
            onClick={handleClick}
        >
            Clear All
        </Button>
    );
};
