/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Entry } from '@/features/MapTools/Legend/types';
import { LayerId } from '@/features/Map/consts';
import { LayerType } from '@/components/Map/types';
import Line from '@/icons/Line';
import Circle from '@/icons/Circle';
import Square from '@/icons/Square';
import { Gradient } from '@/features/MapTools/Legend/Gradient';
import styles from '@/features/MapTools/Legend/Legend.module.css';
import { getLayerName } from '@/features/Map/config';
import useMainStore from '@/stores/main';
import {
    ActionIcon,
    Box,
    CloseButton,
    Divider,
    Group,
    Popover,
    PopoverDropdown,
    PopoverTarget,
    Stack,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import { getTooltipContent } from '@/features/MapTools/Legend/utils';
import Info from '@/icons/Info';
import { Teacups } from '@/features/MapTools/Legend/Teacups';
import useSessionStore from '@/stores/session';
import LegendIcon from '@/icons/Legend';
import { useEffect, useState } from 'react';
import { Overlay } from '@/stores/session/types';

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
                label: '>=50',
            },
            {
                color: '#eaea3e',
                label: '>=70',
            },
            {
                color: '#77ea3e',
                label: '>=90',
            },
            {
                color: '#94fde5',
                label: '>=110',
            },
            {
                color: '#3ebdea',
                label: '>=130',
            },
            {
                color: '#3e3efd',
                label: '>=150',
            },
        ],
    },
    {
        id: LayerId.NOAARiverForecast,
        type: LayerType.Circle,
        items: [
            {
                color: '#d73027',
                label: '<25',
            },
            {
                color: '#f46d43',
                label: '>=25',
            },
            {
                color: '#fdae61',
                label: '>=50',
            },
            {
                color: '#fee090',
                label: '>=75',
            },
            {
                color: '#e0f3f8',
                label: '>=90',
            },
            {
                color: '#abd9e9',
                label: '>=110',
            },
            {
                color: '#74add1',
                label: '>=125',
            },
            {
                color: '#4575b4',
                label: '>=150',
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
        <Popover
            opened={show}
            onChange={setShow}
            closeOnClickOutside={false}
            position="left-start"
            shadow="md"
        >
            <PopoverTarget>
                <Tooltip label="Show legend" disabled={show}>
                    <ActionIcon
                        classNames={{
                            root: styles.actionIconRoot,
                            icon: styles.actionIcon,
                        }}
                        size="lg"
                        onClick={() => handleShow(!show)}
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
                <Stack className={styles.wrapper}>
                    <Teacups />
                    <Divider />
                    {entries
                        .filter((entry) => Boolean(toggleableLayers[entry.id]))
                        .map((entry) => (
                            <li
                                className={styles.listItem}
                                key={`legend-entry-${entry.id}`}
                            >
                                <Tooltip
                                    label={getTooltipContent(entry.id)}
                                    disabled={!getTooltipContent(entry.id)}
                                    position="top-start"
                                >
                                    <Group align="center" gap="xs">
                                        <Title order={4} size="h6">
                                            {getLayerName(entry.id)}
                                        </Title>
                                        <Box
                                            component="span"
                                            style={{
                                                display:
                                                    getTooltipContent(entry.id)
                                                        .length > 0
                                                        ? 'inline-block'
                                                        : 'none',
                                            }}
                                            className={
                                                styles.listItemIconWrapper
                                            }
                                        >
                                            <Info />
                                        </Box>
                                    </Group>
                                </Tooltip>
                                {[
                                    LayerType.Line,
                                    LayerType.Circle,
                                    LayerType.Fill,
                                ].includes(entry.type) ? (
                                    <ul className={styles.list}>
                                        {entry.type === LayerType.Line &&
                                            entry?.items &&
                                            entry.items.map((item) => (
                                                <li
                                                    className={
                                                        styles.subListItem
                                                    }
                                                    key={`legend-item-${entry.id}-${item.label}`}
                                                >
                                                    <div
                                                        className={
                                                            styles.entryContainer
                                                        }
                                                    >
                                                        <Line
                                                            color={item.color}
                                                        />
                                                        <Text
                                                            size="xs"
                                                            style={{
                                                                color: 'black',
                                                            }}
                                                        >
                                                            {item.label}
                                                        </Text>
                                                    </div>
                                                </li>
                                            ))}
                                        {entry.type === LayerType.Circle &&
                                            entry?.items &&
                                            entry.items.map((item) => (
                                                <li
                                                    className={
                                                        styles.subListItem
                                                    }
                                                    key={`legend-item-${entry.id}-${item.label}`}
                                                >
                                                    <div
                                                        className={
                                                            styles.entryContainer
                                                        }
                                                    >
                                                        <Circle
                                                            color={item.color}
                                                        />
                                                        <Text
                                                            size="xs"
                                                            style={{
                                                                color: 'black',
                                                            }}
                                                        >
                                                            {item.label}
                                                        </Text>
                                                    </div>
                                                </li>
                                            ))}
                                        {entry.type === LayerType.Fill &&
                                            entry?.items &&
                                            entry.items.map((item) => (
                                                <li
                                                    className={
                                                        styles.subListItem
                                                    }
                                                    key={`legend-item-${entry.id}-${item.label}`}
                                                >
                                                    <div
                                                        className={
                                                            styles.entryContainer
                                                        }
                                                    >
                                                        <Square
                                                            fill={item.color}
                                                            stroke={item.color}
                                                            height={25}
                                                            width={25}
                                                        />
                                                        <Text
                                                            size="xs"
                                                            style={{
                                                                color: 'black',
                                                            }}
                                                        >
                                                            {item.label}
                                                        </Text>
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>
                                ) : (
                                    <>
                                        {entry.type === LayerType.Raster &&
                                            entry?.colors && (
                                                <Gradient
                                                    colors={entry.colors}
                                                    from={entry?.from ?? ''}
                                                    to={entry?.to ?? ''}
                                                />
                                            )}
                                    </>
                                )}
                            </li>
                        ))}
                </Stack>
            </PopoverDropdown>
        </Popover>
    );
};

export default Legend;
