/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import Screenshot from '@/icons/Screenshot';
import useMainStore, { Tools } from '@/lib/main';

/**
 *
 * @component
 */
export const MapButton: React.FC = () => {
    const tools = useMainStore((state) => state.tools);

    const setOpenTools = useMainStore((state) => state.setOpenTools);

    const onClick = () => {
        setOpenTools(Tools.Print, !tools[Tools.Print]);
        setOpenTools(Tools.BasemapSelector, false);
    };

    return (
        <button
            type="button"
            aria-label="Show screenshot tool"
            aria-disabled="false"
            onClick={onClick}
            style={{ padding: '3px' }}
        >
            <Screenshot />
        </button>
    );
};
