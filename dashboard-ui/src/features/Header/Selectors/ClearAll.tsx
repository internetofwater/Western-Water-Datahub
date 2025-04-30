/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import Close from '@/icons/Close';
import useMainStore from '@/lib/main';
import { ActionIcon } from '@mantine/core';

/**

 * @component
 */
export const ClearAll: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);

    const noSelections = region === 'all' && reservoir === 'all';

    const handleClick = () => {
        setRegion('all');
        setReservoir('all');
    };

    return (
        <ActionIcon
            variant="filled"
            aria-label="Clear all"
            title="Clear All"
            color="rgba(0, 119, 154, 1)"
            disabled={noSelections}
            onClick={handleClick}
        >
            <Close />
        </ActionIcon>
    );
};
