/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');
});

test.describe.configure({ timeout: 120000 }); // 2 minutes

test.describe('Home', () => {
  test('should have placeholder text on screen', async ({ page }) => {
    const text = page.getByText('Home Page');

    expect(text).toBeDefined();
  });
});
