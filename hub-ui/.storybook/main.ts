/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  core: {
    disableWhatsNewNotifications: true,
    disableTelemetry: true,
    enableCrashReports: false,
  },
  stories: ['../src/**/*.mdx', '../src/**/*.story.@(js|jsx|ts|tsx)'],
  addons: ['storybook-dark-mode'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
