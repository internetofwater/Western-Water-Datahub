'use client';

import {
    Box,
    Switch,
    useComputedColorScheme,
    useMantineColorScheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import styles from '@/features/Header/Header.module.css';

const DarkModeToggle: React.FC = () => {
    const preferredColorScheme = useColorScheme();
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme(preferredColorScheme);

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
