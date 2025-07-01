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
import useMainStore from '@/lib/main';

const DarkModeToggle: React.FC = () => {
    const preferredColorScheme = useColorScheme();
    const { setColorScheme } = useMantineColorScheme();
    const setAppColorScheme = useMainStore((state) => state.setColorScheme);
    const computedColorScheme = useComputedColorScheme(preferredColorScheme);

    useEffect(() => {
        if (!computedColorScheme) {
            return;
        }
        setAppColorScheme(computedColorScheme);
    }, [computedColorScheme]);

    return (
        // Adjust style to handle logo positioning
        <Box component="span" className={styles.darkModeToggleContainer}>
            {computedColorScheme && (
                <Switch
                    checked={
                        (Boolean(computedColorScheme) &&
                            computedColorScheme === 'dark') ||
                        false
                    }
                    onChange={() =>
                        setColorScheme(
                            computedColorScheme === 'light' ? 'dark' : 'light'
                        )
                    }
                    label="Dark Mode"
                />
            )}
        </Box>
    );
};

export default DarkModeToggle;
