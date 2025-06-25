/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MapProvider } from '@/contexts/MapContexts';
import { Mantine as MantineProvider } from '@/providers/Mantine';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider>
            <MapProvider mapIds={['test']}>{children}</MapProvider>
        </MantineProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
