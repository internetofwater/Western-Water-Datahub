/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import mantine from 'eslint-config-mantine';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...mantine,
  { ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}', './.storybook/main.ts'] },
  {
    files: ['**/*.story.tsx'],
    rules: { 'no-console': 'off' },
  }
);
