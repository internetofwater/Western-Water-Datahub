/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import {
    Box,
    Switch,
    useComputedColorScheme,
    useMantineColorScheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import styles from '@/features/Header/Header.module.css';
import { useEffect } from 'react';
import useMainStore from '@/stores/main/main';
import Sun from '@/icons/Sun';
import Moon from '@/icons/Moon';

const DarkModeToggle: React.FC = () => {
    const preferredColorScheme = useColorScheme();
    const { setColorScheme } = useMantineColorScheme();
    const colorScheme = useMainStore((state) => state.colorScheme);
    const setAppColorScheme = useMainStore((state) => state.setColorScheme);
    const computedColorScheme = useComputedColorScheme(preferredColorScheme);

    useEffect(() => {
        if (!computedColorScheme) {
            return;
        }
        setAppColorScheme(computedColorScheme);
    }, [computedColorScheme]);

    const checked = colorScheme ? colorScheme === 'dark' : undefined;

    const handleChange = () => {
        setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
    };

    return (
        <Box component="span" className={styles.darkModeToggleContainer}>
            <Switch
                size="lg"
                color="dark.4"
                title="Toggle dark and light mode"
                checked={checked}
                onChange={handleChange}
                onLabel={
                    <Box
                        component="span"
                        className={styles.darkModeIcon}
                        style={{
                            fill: '#d0a02a',
                        }}
                    >
                        <Sun />
                    </Box>
                }
                offLabel={
                    <Box
                        component="span"
                        className={styles.darkModeIcon}
                        style={{
                            fill: '#1c638e',
                        }}
                    >
                        <Moon />
                    </Box>
                }
            />
        </Box>
    );
};

export default DarkModeToggle;
