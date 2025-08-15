/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useMap } from '@/contexts/MapContexts';
import { INITIAL_CENTER, INITIAL_ZOOM, MAP_ID } from '@/features/Map/consts';
import {
    BasinDefault,
    RegionDefault,
    ReservoirDefault,
    StateDefault,
} from '@/lib/consts';
import useMainStore from '@/lib/main';
import { Button } from '@mantine/core';
import styles from '@/features/Header/Header.module.css';

/**

 * @component
 */
export const ClearAll: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);
    const basin = useMainStore((state) => state.basin);
    const setBasin = useMainStore((state) => state.setBasin);
    const state = useMainStore((state) => state.state);
    const setState = useMainStore((state) => state.setState);

    const noSelections =
        region === RegionDefault &&
        reservoir === ReservoirDefault &&
        basin === BasinDefault &&
        state === StateDefault;

    const { map } = useMap(MAP_ID);

    const handleClick = () => {
        setRegion('all');
        setReservoir(ReservoirDefault);
        setBasin(BasinDefault);
        setState(StateDefault);
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
            className={styles.clearAllButton}
        >
            Clear All
        </Button>
    );
};
