/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useSessionStore from '@/stores/session';
import { Hover } from '@/features/Popups/Reservoir/Hover';

type Props = {
    alignBottom?: boolean;
};

const Popups: React.FC<Props> = (props) => {
    const { alignBottom = false } = props;

    const hoverFeature = useSessionStore((state) => state.highlight);

    if (
        !hoverFeature ||
        (alignBottom && hoverFeature.inHoverSpace) ||
        (!alignBottom && !hoverFeature.inHoverSpace)
    ) {
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
