/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Entry, Id } from '@/features/Legend/types';
import { LayerId } from '@/features/Map/consts';
import { LayerType } from '@/components/Map/types';
import Line from '@/icons/Line';
import Circle from '@/icons/Circle';
import Square from '@/icons/Square';
import { Gradient } from './Gradient';
import styles from '@/features/Legend/Legend.module.css';
import { getLayerName } from '../Map/config';

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
        from: 'less',
        to: 'more',
    },
    {
        id: LayerId.NOAAPrecipSixToTen,
        type: LayerType.Raster,
        colors: [
            '#d7a64f',
            '#efd392',
            '#9f9f9f',
            '#b2d8aa',
            '#94cd7e',
            '#48b330',
        ],
        from: 'less',
        to: 'more',
    },
    {
        id: LayerId.NOAATempSixToTen,
        type: LayerType.Raster,
        colors: [
            '#76b4e1',
            '#9fbfde',
            '#becae3',
            '#9f9f9f',
            '#e6b067',
            '#e28a4b',
            '#d95631',
            '#c83b1a',
            '#b22e00',
        ],
        from: 'less',
        to: 'more',
    },
];

type Props = {
    toggleableLayers: { [key in Id]: boolean };
};

const Legend: React.FC<Props> = (props) => {
    const { toggleableLayers } = props;

    return (
        <ul>
            {entries
                .filter((entry) => Boolean(toggleableLayers[entry.id]))
                .map((entry) => (
                    <li
                        className={styles.listItem}
                        key={`legend-entry-${entry.id}`}
                    >
                        <h4>{getLayerName(entry.id)}</h4>
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
                                                    styles.legendEntryContainer
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
                                                    styles.legendEntryContainer
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
                                                    styles.legendEntryContainer
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
        </ul>
    );
};

export default Legend;
