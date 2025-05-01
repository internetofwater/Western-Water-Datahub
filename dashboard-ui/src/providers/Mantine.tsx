/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { createTheme, MantineProvider } from '@mantine/core';
import { PropsWithChildren } from 'react';

const theme = createTheme({
    primaryColor: 'usbr-blue',
    colors: {
        'usbr-blue': [
            '#00799E',
            '#006A8A',
            '#005A75',
            '#004A61',
            '#003B4D',
            '#002B38',
            '#00B8F0',
            '#00A8DB',
            '#00769A',
            '#0098C7',
        ],
    },
});

/**
 * Provides Mantine theme
 *
 * @component
 */
export const Mantine: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <>
            <MantineProvider defaultColorScheme="auto" theme={theme}>
                {children}
            </MantineProvider>
        </>
    );
};
