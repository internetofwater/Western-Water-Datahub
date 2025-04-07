import { createTheme, MantineProvider } from '@mantine/core';
import { PropsWithChildren, useState } from 'react';
import ColorScheme from '@/contexts/ColorScheme';

const theme = createTheme({});

/**
 * Provides Mantine theme
 *
 * @component
 */
export const Mantine: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <MantineProvider defaultColorScheme="auto" theme={theme}>
            {children}
        </MantineProvider>
    );
};
