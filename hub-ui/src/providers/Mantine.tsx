/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { PropsWithChildren } from 'react';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';

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
