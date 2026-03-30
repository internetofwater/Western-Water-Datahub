/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import styles from '@/features/MapTools/Legend/Legend.module.css';
import useMainStore from '@/stores/main';
import {
    ActionIcon,
    Box,
    CloseButton,
    Group,
    Popover,
    PopoverDropdown,
    PopoverTarget,
    Title,
    Tooltip,
} from '@mantine/core';
import useSessionStore from '@/stores/session';
import LegendIcon from '@/icons/Legend';
import { useEffect, useState } from 'react';
import { Overlay } from '@/stores/session/types';
import { useMediaQuery } from '@mantine/hooks';
import { Content } from '@/features/MapTools/Legend/Content';
import { entries } from '@/features/MapTools/Legend/consts';

const Legend: React.FC = () => {
    const toggleableLayers = useMainStore((state) => state.toggleableLayers);

    const overlay = useSessionStore((state) => state.overlay);
    const setOverlay = useSessionStore((state) => state.setOverlay);

    const mobile = useMediaQuery('(max-width: 899px)');

    const [show, setShow] = useState(false);

    useEffect(() => {
        if (overlay === Overlay.Legend) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [overlay]);

    const handleShow = (show: boolean) => {
        setOverlay(show ? Overlay.Legend : null);
        setShow(show);
    };

    return (
        <>
            <Popover
                opened={show}
                onChange={setShow}
                closeOnClickOutside={false}
                position="left-start"
                keepMounted
                shadow="md"
            >
                <PopoverTarget>
                    <Tooltip label="Show legend" disabled={show}>
                        <ActionIcon
                            classNames={{
                                root: styles.actionIconRoot,
                                icon: styles.actionIcon,
                            }}
                            onClick={() => handleShow(!show)}
                            size={mobile ? 'lg' : 'md'}
                        >
                            <LegendIcon />
                        </ActionIcon>
                    </Tooltip>
                </PopoverTarget>
                <PopoverDropdown>
                    <Group
                        justify="space-between"
                        mb="calc(var(--default-spacing) / 2)"
                    >
                        <Title order={3} className={styles.mapToolTitle}>
                            Legend
                        </Title>
                        <CloseButton
                            mr="-0.5rem"
                            onClick={() => setOverlay(null)}
                            aria-label="Close legend"
                        />
                    </Group>
                    <Content
                        entries={entries}
                        toggleableLayers={toggleableLayers}
                    />
                </PopoverDropdown>
            </Popover>
            {/* Hidden legend for consistent exports */}
            {/* Having the parent hide children allows the legend to render outside of view */}
            {/* This allows the screenshot tool to export this element as a jpeg  */}
            <Box
                style={{ height: 0, width: 0, overflow: 'hidden' }}
                mt="calc(var(--default-spacing) * -1)"
            >
                <Box className={styles.hiddenLegend} id="legend">
                    <Title order={3} className={styles.mapToolTitle}>
                        Legend
                    </Title>
                    <Content
                        entries={entries}
                        toggleableLayers={toggleableLayers}
                    />
                </Box>
                <img
                    src="report-legends/drought-legend.png"
                    id="drought-legend"
                    alt=""
                    aria-hidden
                />
                <img
                    src="report-legends/precip-legend.png"
                    id="precip-legend"
                    alt=""
                    aria-hidden
                />
                <img
                    src="report-legends/temp-legend.png"
                    id="temp-legend"
                    alt=""
                    aria-hidden
                />
                <img
                    src="report-legends/none-legend.png"
                    id="none-legend"
                    alt=""
                    aria-hidden
                />
                <img
                    src="mapbox-logo-white.png"
                    id="mapbox-logo"
                    alt=""
                    aria-hidden
                />
            </Box>
        </>
    );
};

export default Legend;
