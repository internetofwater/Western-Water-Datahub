/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { RISEEDRReservoirSource } from '@/features/Map/consts';
import { getDateRange } from '@/features/Reservior/Chart/utils';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
});

test.describe.configure({ timeout: 120000 }); // 2 minutes

test.describe('Line Chart', () => {
    test('should handle load and change to 5 years', async ({ page }) => {
        const select = page.getByTestId('reservoir-select');

        await test.step('Loading Options', async () => {
            // Await data load into map
            await page.waitForRequest(RISEEDRReservoirSource);
        });

        await test.step('Select updates after selection', async () => {
            await select.click();
            const lakeMeadOption = page.getByRole('option', {
                name: 'Lake Mead',
            });

            await lakeMeadOption.click();

            await expect(select).toHaveValue('Lake Mead');
        });

        await test.step('Chart renders', () => {
            const lineChart = page.getByTestId('line-chart');
            expect(lineChart).toBeDefined();
        });

        await test.step('Load chart at 1 year range', async () => {
            const dateRange = getDateRange(1);
            const url = `https://cache.wwdh.internetofwater.app/collections/rise-edr/locations/3514?parameter-name=reservoirStorage&datetime=${dateRange.startDate}/..`;

            const response = await page.waitForResponse(
                (response) =>
                    response.url().startsWith(url) && response.status() === 200
            );

            expect(response.ok()).toBeTruthy();

            const json = (await response.json()) as unknown;
            expect(json).toBeDefined();
        });

        await test.step('Request is made after change to 5 years', async () => {
            const fiveYearRadio = page.getByTestId('5-year-radio');
            await fiveYearRadio.click({ force: true });
            await expect(fiveYearRadio).toBeChecked();

            const dateRange = getDateRange(5);
            const url = `https://cache.wwdh.internetofwater.app/collections/rise-edr/locations/3514?parameter-name=reservoirStorage&datetime=${dateRange.startDate}%2F`;

            const response = await page.waitForResponse(
                (response) =>
                    response.url().startsWith(url) && response.status() === 200
            );

            expect(response.ok()).toBeTruthy();

            const json = (await response.json()) as unknown;
            expect(json).toBeDefined();
        });
    });
});
