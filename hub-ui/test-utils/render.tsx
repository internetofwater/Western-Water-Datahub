/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { render as testingLibraryRender } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MapProvider } from '@/contexts/MapContexts';
import { theme } from '../src/theme';

export function render(ui: React.ReactNode) {
  return testingLibraryRender(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider theme={theme} env="test">
        <MapProvider mapIds={['test']}>{children}</MapProvider>
      </MantineProvider>
    ),
  });
}
