/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@next/next/recommended',
    ],
    ignorePatterns: ['**/__tests__/**', '**/__mocks__/**', '*.cjs'],
    rules: {
        semi: ['error', 'always'],
        'no-console': 'warn',
        'react-hooks/exhaustive-deps': 'off',
    },
};
