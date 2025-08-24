/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
  },
  resolve: {
    alias: {
      '@': '/src',
      '@test-utils': '/test-utils',
    },
  },
});
