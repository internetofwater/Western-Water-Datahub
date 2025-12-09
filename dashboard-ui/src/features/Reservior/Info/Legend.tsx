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
import { Entry } from './Entry';

type Props = {
    showLabels: boolean;
    onChange: (showLabels: boolean) => void;
};

type EntryTypew = {
    fill: string | [string, string];
    text: string;
    stroke?: string;
    dashed?: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};

export const Legend: React.FC<Props> = (props) => {
    const { showLabels, onChange } = props;

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

        onChange(showLabels);
    };

    const entries: EntryTypew[] = [
        {
            fill: capacityFill,
            text: 'Capacity',
            onMouseEnter: handleCapacityEnter,
            onMouseLeave: () => handleCapacityLeave(showLabels),
        },
        {
            fill: storageFill,
            text: 'Storage',
            onMouseEnter: handleStorageEnter,
            onMouseLeave: () => handleStorageLeave(showLabels),
        },
        {
            fill: [storageFill, capacityFill],
            stroke: '#D0A02A',
            text: '30 year Average',
            onMouseEnter: handleAverageLineEnter,
            onMouseLeave: () => handleAverageLineLeave(showLabels),
            dashed: true,
        },
        {
            fill: [storageFill, capacityFill],
            stroke: '#fff',
            text: 'High (90th Percentile)',
            onMouseEnter: () => null,
            onMouseLeave: () => null,
            dashed: true,
        },
        {
            fill: [storageFill, capacityFill],
            stroke: '#fff',
            text: 'Low (10th Percentile)',
            onMouseEnter: () => null,
            onMouseLeave: () => null,
            dashed: true,
        },
    ];

    return (
        <Flex
            className={styles.legendWrapper}
            p="var(--default-spacing)"
            gap="calc(var(--default-spacing) * 2)"
        >
            <Switch
                label="Show Volumes"
                checked={showLabels}
                onClick={() => handleShowLabels(!showLabels)}
            />
            <Paper shadow="sm" className={styles.legendPaper}>
                <Flex
                    className={styles.legend}
                    p="var(--default-spacing)"
                    gap="var(--default-spacing)"
                    data-testid="graphic-legend"
                >
                    {entries.map((entry) => (
                        <Entry
                            key={`teacup-legend-entry-${entry.text}`}
                            text={entry.text}
                            fill={entry.fill}
                            stroke={entry?.stroke}
                            dashed={entry?.dashed}
                            onMouseEnter={entry.onMouseEnter}
                            onMouseLeave={entry.onMouseLeave}
                        />
                    ))}
                </Flex>
            </Paper>
        </Flex>
    );
};
