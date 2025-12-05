/**
 * Chrome Extension Job Detection - E2E Tests
 */

import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Job Board Detection', () => {
  let browser;
  let context;
  let page;
  const extensionPath = path.resolve(__dirname, '../../public');

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
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.describe('LinkedIn Job Detection', () => {
    test('should detect job posting on LinkedIn', async () => {
      // Navigate to a LinkedIn job posting
      await page.goto('https://www.linkedin.com/jobs/view/1234567890');

      // Wait for extension to detect job
      await page.waitForSelector('.jobseek-fab', { timeout: 5000 });

      // Verify FAB is visible
      const fab = await page.$('.jobseek-fab');
      expect(fab).not.toBeNull();

      // Verify FAB has detected state
      const fabClass = await fab.getAttribute('class');
      expect(fabClass).toContain('detected');
    });

    test('should show job details in mini card', async () => {
      await page.goto('https://www.linkedin.com/jobs/view/1234567890');
      await page.waitForSelector('.jobseek-fab');

      // Click FAB to show card
      await page.click('.jobseek-fab');

      // Wait for card to be visible
      await page.waitForSelector('.jobseek-mini-card.visible');

      // Verify job details are displayed
      const title = await page.textContent('.jobseek-mini-card-title');
      const company = await page.textContent('.jobseek-mini-card-company');

      expect(title).toBeTruthy();
      expect(company).toBeTruthy();
    });

    test('should handle generate resume action', async () => {
      await page.goto('https://www.linkedin.com/jobs/view/1234567890');
      await page.waitForSelector('.jobseek-fab');
      await page.click('.jobseek-fab');
      await page.waitForSelector('.jobseek-mini-card.visible');

      // Click generate resume button
      await page.click('[data-action="generate"]');

      // Verify loading state
      await page.waitForSelector('.jobseek-fab.loading', { timeout: 1000 });

      // Wait for success or error state
      await page.waitForSelector('.jobseek-fab.success, .jobseek-fab.error', { timeout: 10000 });
    });

    test('should handle save job action', async () => {
      await page.goto('https://www.linkedin.com/jobs/view/1234567890');
      await page.waitForSelector('.jobseek-fab');
      await page.click('.jobseek-fab');
      await page.waitForSelector('.jobseek-mini-card.visible');

      // Click save job button
      await page.click('[data-action="save"]');

      // Verify loading and success states
      await page.waitForSelector('.jobseek-fab.success, .jobseek-fab.error', { timeout: 5000 });
    });
  });

  test.describe('Indeed Job Detection', () => {
    test('should detect job posting on Indeed', async () => {
      await page.goto('https://www.indeed.com/viewjob?jk=1234567890');
      await page.waitForSelector('.jobseek-fab', { timeout: 5000 });

      const fab = await page.$('.jobseek-fab');
      expect(fab).not.toBeNull();
    });

    test('should extract job details correctly', async () => {
      await page.goto('https://www.indeed.com/viewjob?jk=1234567890');
      await page.waitForSelector('.jobseek-fab');

      // Get extension storage to verify job data
      const detectedJobs = await page.evaluate(() => {
        return new Promise((resolve) => {
          chrome.storage.local.get(['detectedJobs'], (result) => {
            resolve(result.detectedJobs);
          });
        });
      });

      expect(detectedJobs).toBeTruthy();
      expect(detectedJobs.length).toBeGreaterThan(0);

      const job = detectedJobs[0];
      expect(job.jobTitle).toBeTruthy();
      expect(job.company).toBeTruthy();
      expect(job.source).toBe('Indeed');
    });
  });

  test.describe('Greenhouse Job Detection', () => {
    test('should detect job posting on Greenhouse', async () => {
      await page.goto('https://boards.greenhouse.io/company/jobs/1234567890');
      await page.waitForSelector('.jobseek-fab', { timeout: 5000 });

      const fab = await page.$('.jobseek-fab');
      expect(fab).not.toBeNull();
    });
  });

  test.describe('Lever Job Detection', () => {
    test('should detect job posting on Lever', async () => {
      await page.goto('https://jobs.lever.co/company/position');
      await page.waitForSelector('.jobseek-fab', { timeout: 5000 });

      const fab = await page.$('.jobseek-fab');
      expect(fab).not.toBeNull();
    });
  });

  test.describe('Workday Job Detection', () => {
    test('should detect job posting on Workday', async () => {
      await page.goto('https://company.workdayjobs.com/en-US/careers/job/1234567890');
      await page.waitForSelector('.jobseek-fab', { timeout: 5000 });

      const fab = await page.$('.jobseek-fab');
      expect(fab).not.toBeNull();
    });
  });

  test.describe('SPA Navigation', () => {
    test('should re-detect jobs after navigation', async () => {
      await page.goto('https://www.linkedin.com/jobs/view/1111111111');
      await page.waitForSelector('.jobseek-fab');

      // Navigate to another job
      await page.goto('https://www.linkedin.com/jobs/view/2222222222');

      // Wait for re-detection
      await page.waitForTimeout(2000);

      // Verify FAB is still present
      const fab = await page.$('.jobseek-fab');
      expect(fab).not.toBeNull();
    });
  });

  test.describe('Mobile Responsive', () => {
    test('should work on mobile viewports', async () => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('https://www.linkedin.com/jobs/view/1234567890');
      await page.waitForSelector('.jobseek-fab');

      const fab = await page.$('.jobseek-fab');
      const fabSize = await fab.boundingBox();

      // Verify FAB is appropriately sized for mobile
      expect(fabSize.width).toBeLessThanOrEqual(50);
      expect(fabSize.height).toBeLessThanOrEqual(50);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API to return error
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await page.goto('https://www.linkedin.com/jobs/view/1234567890');
      await page.waitForSelector('.jobseek-fab');
      await page.click('.jobseek-fab');
      await page.waitForSelector('.jobseek-mini-card.visible');

      // Try to generate resume
      await page.click('[data-action="generate"]');

      // Should show error state
      await page.waitForSelector('.jobseek-fab.error', { timeout: 5000 });
    });

    test('should handle missing job data gracefully', async () => {
      // Navigate to a page with incomplete job data
      await page.goto('https://www.linkedin.com/jobs/view/invalid');

      // Wait for detection attempt
      await page.waitForTimeout(3000);

      // FAB should not appear for invalid jobs
      const fab = await page.$('.jobseek-fab');
      expect(fab).toBeNull();
    });
  });
});
