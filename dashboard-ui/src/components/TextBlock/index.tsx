/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReactNode } from 'react';
import {
    Box,
    BoxComponentProps,
    useMantineColorScheme,
    useMantineTheme,
} from '@mantine/core';

type Props = BoxComponentProps & {
    children: ReactNode;
};

export const TextBlock: React.FC<Props> = (props) => {
    const { children } = props;

    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const borderColor =
        colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3];

    return (
        <Box
            bd={`1px solid ${borderColor}`}
            p={8}
            style={{ borderRadius: '0.25rem' }}
            {...props}
        >
            {children}
        </Box>
    );
};
