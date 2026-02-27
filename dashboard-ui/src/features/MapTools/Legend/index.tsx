/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Entry } from '@/features/MapTools/Legend/types';
import { LayerId } from '@/features/Map/consts';
import { LayerType } from '@/components/Map/types';
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

const entries: Entry[] = [
    {
        id: LayerId.Snotel,
        type: LayerType.Fill,
        items: [
            {
                color: '#ea3e3e',
                label: '<50',
            },
            {
                color: '#eab03e',
                label: '50-70',
            },
            {
                color: '#eaea3e',
                label: '70-90',
            },
            {
                color: '#77ea3e',
                label: '90-110',
            },
            {
                color: '#94fde5',
                label: '110-130',
            },
            {
                color: '#3ebdea',
                label: '130-150',
            },
            {
                color: '#3e3efd',
                label: '>150',
            },
        ],
    },
    {
        id: LayerId.NOAARiverForecast,
        type: LayerType.Circle,
        items: [
            {
                color: '#fff',
                label: 'No Data',
            },
            {
                color: '#a30000',
                label: '<25',
            },
            {
                color: '#fb0000',
                label: '25-50',
            },
            {
                color: '#fd9400',
                label: '50-75',
            },
            {
                color: '#e8ec08',
                label: '75-90',
            },
            {
                color: '#20ee00',
                label: '90-100',
            },
            {
                color: '#1eeae8',
                label: '100-125',
            },
            {
                color: '#1084e7',
                label: '125-150',
            },
            {
                color: '#0000fe',
                label: '>150',
            },
        ],
    },
    {
        id: LayerId.USDroughtMonitor,
        type: LayerType.Raster,
        colors: ['#fefe00', '#fed27e', '#fea900', '#e50000', '#720000'],
        from: 'Dry',
        to: 'Exceptional',
    },
    {
        id: LayerId.NOAAPrecipSixToTen,
        type: LayerType.Raster,
        colors: [
            '#4F2F2F',
            '#804000',
            '#934639',
            '#9B5031',
            '#BB6D33',
            '#D8A74F',
            '#F0D493',
            '#A0A0A0',
            '#B3D9AB',
            '#95CE7F',
            '#48B430',
            '#009620',
            '#007814',
            '#28600A',
            '#285300',
        ],
        from: 'Below, 90%',
        to: 'Above, 90%',
    },
    {
        id: LayerId.NOAATempSixToTen,
        type: LayerType.Raster,
        colors: [
            '#221852',
            '#2E216F',
            '#005DA1',
            '#389FDC',
            '#77B5E2',
            '#A0C0DF',
            '#BFCBE4',
            '#A0A0A0',
            '#E7B168',
            '#E38B4B',
            '#DA5731',
            '#C93B1A',
            '#B32E05',
            '#912600',
            '#702100',
        ],
        from: 'Below, 90%',
        to: 'Above, 90%',
    },
];

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
                aria-hidden
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
