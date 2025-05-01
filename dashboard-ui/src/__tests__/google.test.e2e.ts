import puppeteer, { Browser, Page } from 'puppeteer';

// Confirms puppeteer configuration is correct with simple check via google
describe('Sanity Check: Google', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    afterAll(async () => {
        await browser.close();
    });

    it('should display "google" text on page', async () => {
        await page.setViewport({ width: 1000, height: 750 });
        await page.goto('https://google.com');
        await page.waitForSelector('textarea[title="Search"]');
        await page.type('textarea[title="Search"]', 'puppeteer');
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        const html = await page.$eval('body', (e) => e.innerHTML);
        expect(html).toMatch('puppeteer');
    });
});
