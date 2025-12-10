/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, List, Text } from '@mantine/core';
import styles from '@/features/Help/Help.module.css';
import { glossaryEntries } from '@/features/Help/consts';

export const Glossary: React.FC = () => {
    const label = {
        size: 'md',
        fw: 700,
    };
    return (
        <Box
            className={styles.glossaryWrapper}
            my="calc(var(--default-spacing) * 2)"
            pl="var(--default-spacing)"
        >
            <List>
                {glossaryEntries.map((entry) => (
                    <List.Item
                        key={`glossary-${entry.id}`}
                        mt="var(--default-spacing)"
                    >
                        <Text {...label}>{entry.label}</Text>
                        <List>
                            {entry.descriptions.map((description, index) => (
                                <List.Item
                                    key={`glossary-${entry.id}-${index}`}
                                >
                                    {description}
                                </List.Item>
                            ))}
                        </List>
                    </List.Item>
                ))}
            </List>
        </Box>
    );
};
