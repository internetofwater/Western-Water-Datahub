/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Switch, Paper, Flex } from '@mantine/core';
import {
    capacityFill,
    storageFill,
} from '@/features/Reservior/TeacupDiagram/consts';
import {
    handleAverageLineEnter,
    handleAverageLineLeave,
    handleCapacityEnter,
    handleCapacityLeave,
    handleStorageEnter,
    handleStorageLeave,
} from '@/features/Reservior/TeacupDiagram/listeners';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Entry } from '@/features/Reservior/Info/Entry';
import { ReactNode, useState } from 'react';

type Props = {
    showLabels?: boolean;
    onChange?: (showLabels: boolean) => void;
    showSwitch?: boolean;
    excludeEntries?: string[];
    textSize?: string;
};

type EntryType = {
    id: string;
    fill: string | [string, string];
    text: ReactNode;
    stroke?: string;
    dashed?: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};

export const Legend: React.FC<Props> = (props) => {
    const {
        showLabels: controlledShowLabels,
        onChange,
        showSwitch = true,
        excludeEntries = [],
        textSize,
    } = props;

    const [internalShowLabels, setInternalShowLabels] = useState(false);

    const showLabels = controlledShowLabels ?? internalShowLabels;

    const setShowLabels = (showLabels: boolean) => {
        if (controlledShowLabels === undefined) {
            setInternalShowLabels(showLabels);
        }
        onChange?.(showLabels);
    };

    const handleShowLabels = (showLabels: boolean) => {
        if (showLabels) {
            handleStorageEnter();
            handleCapacityEnter();
            handleAverageLineEnter();
        } else {
            handleStorageLeave(false);
            handleCapacityLeave(false);
            handleAverageLineLeave(false);
        }

        setShowLabels(showLabels);
    };

    const entries = (
        [
            {
                id: 'capacity',
                fill: capacityFill,
                text: 'Capacity',
                onMouseEnter: handleCapacityEnter,
                onMouseLeave: () => handleCapacityLeave(showLabels),
            },
            {
                id: 'storage',
                fill: storageFill,
                text: 'Storage',
                onMouseEnter: handleStorageEnter,
                onMouseLeave: () => handleStorageLeave(showLabels),
            },
            {
                id: 'average',
                fill: [storageFill, capacityFill],
                stroke: '#D0A02A',
                text: '30-year Average',
                onMouseEnter: handleAverageLineEnter,
                onMouseLeave: () => handleAverageLineLeave(showLabels),
                dashed: true,
            },
            {
                id: 'high-percentile',
                fill: [storageFill, capacityFill],
                stroke: '#fff',
                text: (
                    <>
                        High (90<sup>th</sup> Percentile)
                    </>
                ),
                onMouseEnter: () => null,
                onMouseLeave: () => null,
                dashed: true,
            },
            {
                id: 'low-percentile',
                fill: [storageFill, capacityFill],
                stroke: '#fff',
                text: (
                    <>
                        Low (10<sup>th</sup> Percentile)
                    </>
                ),
                onMouseEnter: () => null,
                onMouseLeave: () => null,
                dashed: true,
            },
        ] as EntryType[]
    ).filter((entry) => !excludeEntries.includes(entry.id));

    return (
        <Flex
            className={styles.legendWrapper}
            p="var(--default-spacing)"
            gap="calc(var(--default-spacing) * 2)"
        >
            {showSwitch && (
                <Switch
                    label="Show Volumes"
                    checked={showLabels}
                    onClick={() => handleShowLabels(!showLabels)}
                />
            )}
            <Paper shadow="sm" className={styles.legendPaper}>
                <Flex
                    className={styles.legend}
                    p="var(--default-spacing)"
                    gap="var(--default-spacing)"
                    data-testid="graphic-legend"
                    wrap={'wrap'}
                >
                    {entries.map((entry) => (
                        <Entry
                            key={`teacup-legend-entry-${entry.id}`}
                            id={entry.id}
                            text={entry.text}
                            fill={entry.fill}
                            stroke={entry?.stroke}
                            dashed={entry?.dashed}
                            onMouseEnter={entry.onMouseEnter}
                            onMouseLeave={entry.onMouseLeave}
                            textSize={textSize}
                        />
                    ))}
                </Flex>
            </Paper>
        </Flex>
    );
};
