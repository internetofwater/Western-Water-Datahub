/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import Basemap from '@/icons/Basemap';
import useMainStore, { Tools } from '@/lib/main';

/**
 *
 * @component
 */
export const MapButton: React.FC = () => {
    const tools = useMainStore((state) => state.tools);
    const setOpenTools = useMainStore((state) => state.setOpenTools);

    const onClick = () => {
        setOpenTools(Tools.Controls, !tools[Tools.Controls]);
    };

    return (
        <button
            type="button"
            aria-label="Show basemap selector"
            aria-disabled="false"
            onClick={onClick}
            style={{ padding: '5px' }} // Styling must be inline
        >
            <Basemap />
        </button>
    );
};
