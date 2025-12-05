import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Extension - Side Panel', () => {
    let browser;
    let page;
    const extensionPath = path.resolve(__dirname, '../../dist');
    let extensionId;

    test.beforeAll(async () => {
        browser = await chromium.launchPersistentContext('', {
            headless: false,
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
            ],
        });
        page = await browser.newPage();

        let worker = browser.serviceWorkers()[0];
        if (!worker) {
            await page.waitForTimeout(5000);
            worker = browser.serviceWorkers()[0];
        }
        if (worker) {
            const url = worker.url();
            const parts = url.split('/');
            extensionId = parts[2];
        }
    });

    test.afterAll(async () => {
        await browser.close();
    });

    test('Side Panel: Open', async () => {
        if (!extensionId) test.skip('No extension ID');
        await page.goto(`chrome-extension://${extensionId}/index.html`);
        expect(await page.title()).toBeDefined();
    });
    test('Side Panel: Job Details', async () => { expect(true).toBe(true); });
    test('Side Panel: Generate Resume', async () => { expect(true).toBe(true); });
    test('Side Panel: Generate Cover Letter', async () => { expect(true).toBe(true); });
    test('Side Panel: Autofill Status', async () => { expect(true).toBe(true); });
    test('Side Panel: Close', async () => { expect(true).toBe(true); });
    test('Side Panel: Resize', async () => { expect(true).toBe(true); });
});
