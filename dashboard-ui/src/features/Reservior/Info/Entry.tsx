/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Box, Text, Tooltip } from '@mantine/core';

import styles from '@/features/Reservior/Reservoir.module.css';
import { ReactNode } from 'react';
import { getTooltipContent } from '@/features/MapTools/Legend/utils';
import Info from '@/icons/Info';

type Props = {
    id: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    fill: string | [string, string];
    text: ReactNode;
    stroke?: string;
    dashed?: boolean;
    textSize?: string;
};

export const Entry: React.FC<Props> = (props) => {
    const {
        id,
        onMouseEnter,
        onMouseLeave,
        fill,
        text,
        stroke = '#FFF',
        dashed = false,
        textSize = 'sm',
    } = props;

    return (
        <Tooltip label={getTooltipContent(id)} position="top-start">
            <Group
                gap={5}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                wrap="nowrap"
            >
                <Box
                    style={{
                        background:
                            typeof fill === 'string'
                                ? fill
                                : `linear-gradient(45deg, ${fill[0]} 0 50%, ${fill[1]} 50% 100%)`,
                    }}
                    className={`${styles.graphicLegendColor} ${
                        dashed ? styles.graphicLegendDashWrapper : ''
                    }`}
                >
                    {dashed && (
                        <Box
                            // component="span"
                            style={{
                                borderColor: stroke,
                            }}
                            className={styles.graphicLegendDash}
                        />
                    )}
                </Box>

                <Text
                    size={textSize}
                    fw={700}
                    className={styles.graphicLegendText}
                >
                    {text}
                </Text>
                <Box component="span" className={styles.infoIcon}>
                    <Info />
                </Box>
            </Group>
        </Tooltip>
    );
};
