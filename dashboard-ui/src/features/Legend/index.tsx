/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Entry } from '@/features/Legend/types';
import { LayerId } from '@/features/Map/consts';
import { LayerType } from '@/components/Map/types';
import Line from '@/icons/Line';
import Circle from '@/icons/Circle';
import Square from '@/icons/Square';
import { Gradient } from '@/features/Legend/Gradient';
import styles from '@/features/Legend/Legend.module.css';
import { getLayerName } from '@/features/Map/config';
import useMainStore from '@/lib/main';
import { Box, Group, Tooltip } from '@mantine/core';
import { getTooltipContent } from './utils';
import Info from '@/icons/Info';

const entries: Entry[] = [
    {
        id: LayerId.Snotel,
        type: LayerType.Circle,
        items: [
            {
                color: '#7b3294',
                label: '<25',
            },
            {
                color: '#c2a5cf',
                label: '>=25',
            },
            {
                color: '#f7f7f7',
                label: '>=50',
            },
            {
                color: '#a6dba0',
                label: '>=75',
            },
            {
                color: '#008837',
                label: '>=90',
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

    return (
        <Group align="flex-start">
            {entries
                .filter((entry) => Boolean(toggleableLayers[entry.id]))
                .map((entry) => (
                    <li
                        className={styles.listItem}
                        key={`legend-entry-${entry.id}`}
                    >
                        <Tooltip label={getTooltipContent(entry.id)}>
                            <Group align="center" gap="xs">
                                <h4>{getLayerName(entry.id)}</h4>
                                <Box
                                    component="span"
                                    style={{
                                        display:
                                            getTooltipContent(entry.id).length >
                                            0
                                                ? 'inline-block'
                                                : 'none',
                                    }}
                                    className={styles.listItemIconWrapper}
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
                                            className={styles.listItem}
                                            key={`legend-item-${entry.id}-${item.label}`}
                                        >
                                            <div
                                                className={
                                                    styles.entryContainer
                                                }
                                            >
                                                <Line color={item.color} />
                                                <span>{item.label}</span>
                                            </div>
                                        </li>
                                    ))}
                                {entry.type === LayerType.Circle &&
                                    entry?.items &&
                                    entry.items.map((item) => (
                                        <li
                                            className={styles.listItem}
                                            key={`legend-item-${entry.id}-${item.label}`}
                                        >
                                            <div
                                                className={
                                                    styles.entryContainer
                                                }
                                            >
                                                <Circle color={item.color} />
                                                <span>{item.label}</span>
                                            </div>
                                        </li>
                                    ))}
                                {entry.type === LayerType.Fill &&
                                    entry?.items &&
                                    entry.items.map((item) => (
                                        <li
                                            className={styles.listItem}
                                            key={`legend-item-${entry.id}-${item.label}`}
                                        >
                                            <div
                                                className={
                                                    styles.entryContainer
                                                }
                                            >
                                                <Square fill={item.color} />
                                                <span>{item.label}</span>
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
        </Group>
    );
};

export default Legend;
