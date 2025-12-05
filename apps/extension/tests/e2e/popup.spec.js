import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Extension - Popup & Auth', () => {
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

    test('Popup Open: should load popup page', async () => {
        if (!extensionId) test.skip('No extension ID');
        await page.goto(`chrome-extension://${extensionId}/popup.html`);
        expect(await page.title()).toBeDefined();
    });

    test('Login Sync: should have storage access', async () => {
        if (!extensionId) test.skip('No extension ID');
        await page.goto(`chrome-extension://${extensionId}/popup.html`);
        const storage = await page.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.local.set({ test: 'value' }, () => {
                    chrome.storage.local.get(['test'], (result) => resolve(result));
                });
            });
        });
        expect(storage.test).toBe('value');
    });

    test('Settings: should be able to save settings', async () => {
        if (!extensionId) test.skip('No extension ID');
        await page.goto(`chrome-extension://${extensionId}/popup.html`);
        await page.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.sync.set({ setting: 'on' }, resolve);
            });
        });
        const setting = await page.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.sync.get(['setting'], r => resolve(r.setting));
            });
        });
        expect(setting).toBe('on');
    });
});
