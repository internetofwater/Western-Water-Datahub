/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import Menu from '@/icons/Menu';
import { ActionIcon, Tooltip } from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import useSessionStore from '@/stores/session';
import { Overlay } from '@/stores/session/types';
import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '@/features/Main/consts';

export const MobilePanelButton: React.FC = () => {
    const setOverlay = useSessionStore((state) => state.setOverlay);

    const mobile = useMediaQuery(MOBILE_MEDIA_QUERY);

    const handleClick = () => {
        setOverlay(Overlay.Controls);
    };

    if (!mobile) {
        return null;
    }

    return (
        <Tooltip label="Show control panel">
            <ActionIcon
                classNames={{
                    root: styles.actionIconRoot,
                    icon: styles.actionIcon,
                }}
                onClick={() => handleClick()}
                size="lg"
            >
                <Menu />
            </ActionIcon>
        </Tooltip>
    );
};
