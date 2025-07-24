/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/lib/main';
import Legend from '@/icons/Legend';
import { Tools } from '@/lib/types';

/**
 *
 * @component
 */
export const MapButton: React.FC = () => {
    const tools = useMainStore((state) => state.tools);

    const setOpenTools = useMainStore((state) => state.setOpenTools);

    const onClick = () => {
        setOpenTools(Tools.Legend, !tools[Tools.Legend]);
    };

    return (
        <button
            type="button"
            aria-label="Show legend tool"
            aria-disabled="false"
            onClick={onClick}
            style={{ padding: '3px' }}
        >
            <Legend />
        </button>
    );
};
