import { createTheme, MantineProvider } from '@mantine/core';
import { PropsWithChildren } from 'react';

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
