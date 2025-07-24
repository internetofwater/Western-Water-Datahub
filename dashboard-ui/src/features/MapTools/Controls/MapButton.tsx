/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import Controls from '@/icons/Controls';
import useMainStore from '@/lib/main';
import { Tools } from '@/lib/types';

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
            aria-label="Show Controls"
            aria-disabled="false"
            onClick={onClick}
            style={{ padding: '1px' }} // Styling must be inline
        >
            <Controls />
        </button>
    );
};
