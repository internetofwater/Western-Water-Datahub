/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerType } from '@/components/Map/types';
import { TItem, TItemsEntry } from '@/features/MapTools/Legend/types';
import styles from '@/features/MapTools/Legend/Legend.module.css';
import Line from '@/icons/Line';
import { Box, Text } from '@mantine/core';
import Square from '@/icons/Square';
import Circle from '@/icons/Circle';

type Props = {
    id: string;
    entry: Omit<TItemsEntry, 'id'>;
    direction?: 'vertical' | 'horizontal';
};

export const Items: React.FC<Props> = (props) => {
    const { id, entry, direction = 'horizontal' } = props;

    const entryClass = direction === 'vertical' ? styles.row : styles.column;
    const listClass = direction === 'vertical' ? styles.column : styles.row;

    const getSymbol = (type: TItemsEntry['type'], color: TItem['color']) => {
        switch (type) {
            case LayerType.Line:
                return <Line color={color} />;
            case LayerType.Circle:
                return <Circle color={color} />;
            case LayerType.Fill:
                return (
                    <Square
                        fill={color}
                        stroke={color}
                        height={25}
                        width={25}
                    />
                );
            default:
                return <></>;
        }
    };

    return (
        <Box component="ul" className={`${styles.list} ${listClass}`}>
            {entry.items.map((item) => (
                <Box
                    component="li"
                    className={styles.subListItem}
                    key={`legend-item-${id}-${item.label}`}
                >
                    <Box className={`${styles.entryContainer} ${entryClass}`}>
                        {getSymbol(entry.type, item.color)}
                        <Text
                            size="xs"
                            style={{
                                color: 'black',
                            }}
                        >
                            {item.label}
                        </Text>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};
