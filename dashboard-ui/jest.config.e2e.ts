/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: '.',
});

const config: Config = {
    preset: 'jest-puppeteer',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
            },
        ],
    },
    testMatch: ['**/?(*.)+(spec|test).e2e.ts?(x)'],
    verbose: true,
    moduleDirectories: ['node_modules', 'utils'],
    moduleNameMapper: {
        '^mapbox-gl$': '<rootDir>/src/utils/__mocks__/mapbox-gl.ts',
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    globals: {
        'jest-puppeteer': {
            launch: {
                headless: false,
                slowMo: 200,
                devtools: true,
                product: 'chrome',
                args: ['--window-size=1920,1080'],
            },
        },
    },
    testTimeout: 30000,
};

export default createJestConfig(config);
