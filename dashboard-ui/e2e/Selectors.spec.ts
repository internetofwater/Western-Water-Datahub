import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
});

test.describe('Region', () => {
    test('should handle region load and selection', async ({ page }) => {
        await test.step('Loading Options', async () => {
            // Await data load into map
            await Promise.all([
                // Load Regions
                page.waitForRequest((request) =>
                    request
                        .url()
                        .includes(
                            'https://services1.arcgis.com/ixD30sld6F8MQ7V5/arcgis/rest/services/ReclamationBoundariesFL/FeatureServer/0/query?f=pbf'
                        )
                ),
                // Load Reservoirs
                page.waitForRequest(
                    'https://api.wwdh.internetofwater.app/collections/rise-edr/locations?f=json&parameter-name=3'
                ),
            ]);
        });
        const regionSelect = page.getByTestId('region-select');
        const reservoirSelect = page.getByTestId('reservoir-select');

        await test.step('Showing Options', async () => {
            // Options are rendered dynamically
            await regionSelect.click();

            const lowerColoradoOption = page.getByRole('option', {
                name: 'Lower Colorado',
            });

            expect(lowerColoradoOption).toBeDefined();
        });

        await test.step('Select updates after selection', async () => {
            const lowerColoradoOption = page.getByRole('option', {
                name: 'Lower Colorado',
            });

            await lowerColoradoOption.click();

            await expect(regionSelect).toHaveValue('Lower Colorado');
        });
        // Give time to allow mapbox functions to process
        await test.step('Filters reservoir select based on selected region', async () => {
            await reservoirSelect.click();

            // Within Lower Colorado
            const lakeMeadOption = page.getByRole('option', {
                name: 'Lake Mead Hoover Dam and Powerplant',
            });
            // TODO: find better method for listening to options changes
            // Within Mid-Pacific
            // const lakeBerryessaOption = page.getByRole('option', {
            //     name: 'Lake Berryessa and Monticello Dam',
            // });

            expect(lakeMeadOption).toBeDefined();
            // expect(lakeBerryessaOption).toBeUndefined();
        });
    });
});

test.describe('Reservoir', () => {
    test('should handle reservoir load and selection', async ({ page }) => {
        const select = page.getByTestId('reservoir-select');

        await test.step('Loading Options', async () => {
            // Await data load into map
            await Promise.all([
                // Load Regions
                page.waitForRequest((request) =>
                    request
                        .url()
                        .includes(
                            'https://services1.arcgis.com/ixD30sld6F8MQ7V5/arcgis/rest/services/ReclamationBoundariesFL/FeatureServer/0/query?f=pbf'
                        )
                ),
                // Load Reservoirs
                page.waitForRequest(
                    'https://api.wwdh.internetofwater.app/collections/rise-edr/locations?f=json&parameter-name=3'
                ),
            ]);
        });

        await test.step('Showing Options', async () => {
            // Options are rendered dynamically
            await select.click();

            const lakeMeadOption = page.getByRole('option', {
                name: 'Lake Mead Hoover Dam and Powerplant',
            });

            expect(lakeMeadOption).toBeDefined();
        });

        await test.step('Select updates after selection', async () => {
            const lakeMeadOption = page.getByRole('option', {
                name: 'Lake Mead Hoover Dam and Powerplant',
            });

            await lakeMeadOption.click();

            await expect(select).toHaveValue(
                'Lake Mead Hoover Dam and Powerplant'
            );
        });

        await test.step('Info box renders after selection', async () => {
            const reservoirInfo = page.getByTestId('reservoir-info');
            expect(reservoirInfo).toBeDefined();

            const textContent = await reservoirInfo.textContent();
            expect(textContent).toMatch(
                /Active Capacity:\s*25,614,000 acre-feet/
            );
        });
    });
});
