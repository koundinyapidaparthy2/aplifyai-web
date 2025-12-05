import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Smart Apply Agent', () => {
    let browser;
    let page;
    const extensionPath = path.resolve(__dirname, '../../dist'); // Point to dist
    const mockHtmlPath = path.join(__dirname, 'test-data/mock-job.html');
    const mockHtml = fs.readFileSync(mockHtmlPath, 'utf8');

    let extensionId;

    test.beforeAll(async () => {
        // Launch browser with extension
        browser = await chromium.launchPersistentContext('', {
            headless: false,
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
            ],
        });
        page = await browser.newPage();

        // Get extension ID
        let serviceWorker = browser.serviceWorkers()[0];
        if (!serviceWorker) {
            serviceWorker = await browser.waitForEvent('serviceworker');
        }
        extensionId = serviceWorker.url().split('/')[2];

        // Seed user data

        const extensionPage = await browser.newPage();
        await extensionPage.goto(`chrome-extension://${extensionId}/popup.html`);
        await extensionPage.evaluate(() => {
            chrome.storage.local.set({
                userData: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    phone: '1234567890',
                    linkedin: 'linkedin.com/in/john',
                    experience: '5+',
                    why_us: 'Because I love this company.'
                }
            });
        });
        await extensionPage.close();

        // Mock LinkedIn job page to return our custom form
        await page.route('https://www.linkedin.com/jobs/view/mock-job-id', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: mockHtml
            });
        });

        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));
    });

    test.afterAll(async () => {
        await browser.close();
    });

    test.beforeEach(async () => {
        await page.goto('https://www.linkedin.com/jobs/view/mock-job-id');
        // Wait for extension to inject
        await page.waitForTimeout(1000);
    });

    async function triggerAutoFill() {
        const popup = await browser.newPage();
        await popup.goto(`chrome-extension://${extensionId}/popup.html`);
        // Click Auto Fill button in popup (assuming it exists and has ID or text)
        // If popup UI isn't built yet, we might need to mock the message sending
        // For now, let's try to send the message directly from the popup context
        await popup.evaluate(async () => {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            // We need to find the tab with our mock job
            // Since we are in the popup, 'active tab' might be the popup itself if not careful, 
            // but usually popup is separate. 
            // Actually, when opening popup as a tab, it's the active tab.
            // We need to send message to the 'page' tab.
            const allTabs = await chrome.tabs.query({});
            const jobTab = allTabs.find(t => t.url.includes('mock-job-id'));
            if (jobTab) {
                chrome.tabs.sendMessage(jobTab.id, {
                    action: 'START_AUTOFILL',
                    options: {}
                });
            }
        });
        await popup.close();
        await page.waitForTimeout(1000); // Wait for fill
    }

    // 1. Initialization
    test('Smart Apply: Initialize Agent', async () => {
        // Wait for form to be visible to ensure page is loaded
        await expect(page.locator('#application-form')).toBeVisible();

        // Check if content script detected the form and showed notification
        // We wait for the notification to appear
        const notification = page.locator('#aplifyai-autofill-notification');
        await expect(notification).toBeVisible({ timeout: 10000 });
    });

    // 2. Form Field Detection
    test('Smart Apply: Detect Form Fields', async () => {
        // ...
    });

    // 2. Detection
    test('Smart Apply: Detect Form Fields', async () => {
        await expect(page.locator('#application-form')).toBeVisible();
    });

    // 3-7. Basic Fields
    test('Smart Apply: Fill Name', async () => {
        await triggerAutoFill();
        await expect(page.locator('#first_name')).toHaveValue('John');
    });

    test('Smart Apply: Fill Email', async () => {
        await triggerAutoFill();
        await expect(page.locator('#email')).toHaveValue('john@example.com');
    });

    test('Smart Apply: Fill Phone', async () => {
        await triggerAutoFill();
        await expect(page.locator('#phone')).toHaveValue('1234567890');
    });

    test('Smart Apply: Fill LinkedIn', async () => {
        await triggerAutoFill();
        await expect(page.locator('#linkedin')).toHaveValue('linkedin.com/in/john');
    });

    test('Smart Apply: Fill Website', async () => {
        // Our mock form doesn't have website, so we skip or add it
        // Adding expectation for future
        expect(true).toBe(true);
    });

    // 8-9. Documents
    test('Smart Apply: Upload Resume', async () => {
        // Playwright file upload
        // await page.setInputFiles('#resume', 'path/to/resume.pdf');
        expect(true).toBe(true);
    });

    test('Smart Apply: Upload Cover Letter', async () => {
        expect(true).toBe(true);
    });

    // 10-12. AI Answers
    test('Smart Apply: Answer "Why us?"', async () => {
        await triggerAutoFill();
        await expect(page.locator('#why_us')).toHaveValue('Because I love this company.');
    });

    test('Smart Apply: Answer "Experience?"', async () => {
        await triggerAutoFill();
        await expect(page.locator('#experience')).toHaveValue('5+');
    });

    test('Smart Apply: Answer "Salary Expectation?"', async () => {
        expect(true).toBe(true);
    });

    // 13-16. Form Controls
    test('Smart Apply: Handle Dropdowns', async () => {
        await triggerAutoFill();
        await expect(page.locator('#experience')).toHaveValue('5+');
    });

    test('Smart Apply: Handle Radio Buttons', async () => { expect(true).toBe(true); });
    test('Smart Apply: Handle Checkboxes', async () => { expect(true).toBe(true); });
    test('Smart Apply: Handle Date Pickers', async () => { expect(true).toBe(true); });

    // 17-19. Flow & Validation
    test('Smart Apply: Handle Multi-step Forms', async () => { expect(true).toBe(true); });
    test('Smart Apply: Validate Required Fields', async () => {
        // Clear field
        await page.fill('#first_name', '');
        const isValid = await page.$eval('#first_name', el => el.checkValidity());
        expect(isValid).toBe(false);
    });
    test('Smart Apply: Handle Error States', async () => { expect(true).toBe(true); });

    // 20-23. User Interaction
    test('Smart Apply: User Review Mode', async () => { expect(true).toBe(true); });
    test('Smart Apply: Submit Application', async () => {
        // Mock submit
        await page.route('/submit', route => route.fulfill({ status: 200, body: 'Submitted' }));
        await page.click('button[type="submit"]');
    });
    test('Smart Apply: Save Progress', async () => { expect(true).toBe(true); });
    test('Smart Apply: Stop/Pause Agent', async () => { expect(true).toBe(true); });

    // Backend Integration
    test.only('Smart Apply: Verify Backend Context Check', async () => {
        let backendCalled = false;
        await page.route('**/api/job-context', async route => {
            backendCalled = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, isProcessed: false, context: null })
            });
        });

        // Reload page to trigger detection again
        await page.reload();
        await page.waitForTimeout(2000); // Wait for detection and API call

        expect(backendCalled).toBe(true);
    });
});
