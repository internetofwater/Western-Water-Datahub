/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useSessionStore from '@/stores/session';
import { Hover } from './Reservoir/Hover';

const Popups: React.FC = () => {
    const hoverFeature = useSessionStore((state) => state.highlight);

    if (!hoverFeature) {
        return null;
    }

    return (
        <Hover
            reservoirProperties={hoverFeature.feature.properties}
            config={hoverFeature.config}
        />
    );
};

export default Popups;
