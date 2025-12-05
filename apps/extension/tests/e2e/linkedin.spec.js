/**
 * LinkedIn Job Detection E2E Tests
 * 
 * Tests the extension's ability to detect and interact with LinkedIn job postings.
 */

import { test, expect } from '@playwright/test';
import {
  waitForExtensionActive,
  waitForFloatingButton,
  clickFloatingButton,
  waitForPopup,
  extractJobDetails,
  dismissOverlays,
  takeAnnotatedScreenshot,
} from './utils/extension-utils';

test.describe('LinkedIn Job Detection', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss any overlays that might interfere
    await dismissOverlays(page);
  });

  test('should detect job on LinkedIn job posting', async ({ page }) => {
    // Navigate to a LinkedIn job posting
    // Note: Use a stable test job URL or mock page in production
    await page.goto('https://www.linkedin.com/jobs/view/3234567890', {
      waitUntil: 'networkidle',
    });

    // Wait for extension to inject and detect the job
    await waitForExtensionActive(page, 10000);

    // Take screenshot for verification
    await takeAnnotatedScreenshot(page, 'linkedin-job-detected');

    // Verify floating button appears
    const floatingButton = await waitForFloatingButton(page);
    await expect(floatingButton).toBeVisible();

    // Verify button has correct attributes
    const buttonText = await floatingButton.textContent();
    expect(buttonText?.toLowerCase()).toContain('resume' || 'jobseek' || 'generate');
  });

  test('should extract job details from LinkedIn', async ({ page }) => {
    await page.goto('https://www.linkedin.com/jobs/view/3234567890');
    await waitForExtensionActive(page);

    // Extract job details
    const jobDetails = await extractJobDetails(page);

    // Verify job details are extracted
    expect(jobDetails.title).toBeTruthy();
    expect(jobDetails.company).toBeTruthy();

    console.log('Extracted Job Details:', jobDetails);
  });

  test('should open popup when floating button is clicked', async ({ page }) => {
    await page.goto('https://www.linkedin.com/jobs/view/3234567890');
    await waitForExtensionActive(page);

    // Click floating button
    await clickFloatingButton(page);

    // Wait for popup to appear
    const popup = await waitForPopup(page);
    await expect(popup).toBeVisible();

    // Verify popup contains job information
    const companyName = popup.locator('.company-name, [data-company]').first();
    await expect(companyName).toBeVisible();

    // Take screenshot of popup
    await takeAnnotatedScreenshot(page, 'linkedin-popup-opened');
  });

  test('should show generate resume button in popup', async ({ page }) => {
    await page.goto('https://www.linkedin.com/jobs/view/3234567890');
    await waitForExtensionActive(page);
    await clickFloatingButton(page);

    const popup = await waitForPopup(page);

    // Look for generate resume button
    const generateButton = popup.locator('button:has-text("Generate"), button:has-text("Create Resume")').first();
    await expect(generateButton).toBeVisible();
  });

  test('should not activate on non-job LinkedIn pages', async ({ page }) => {
    // Navigate to LinkedIn feed (not a job page)
    await page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'networkidle',
    });

    // Wait a bit for extension to potentially activate
    await page.waitForTimeout(3000);

    // Verify floating button does NOT appear
    const floatingButton = page.locator('[data-jobseek-extension="true"]');
    await expect(floatingButton).not.toBeVisible();
  });

  test('should handle LinkedIn job search results page', async ({ page }) => {
    // Navigate to job search results
    await page.goto('https://www.linkedin.com/jobs/search/?keywords=software%20engineer', {
      waitUntil: 'networkidle',
    });

    // Wait for page to load
    await page.waitForSelector('.jobs-search-results-list, .scaffold-layout__list', {
      timeout: 10000,
    });

    // Check if extension detects this as a job listing page
    const isActive = await page.evaluate(() => {
      return !!document.querySelector('[data-jobseek-active]');
    });

    // Extension may or may not activate on search results
    // (depends on implementation - can activate on individual job cards)
    console.log('Extension active on search results:', isActive);
  });

  test('should detect company name from LinkedIn job', async ({ page }) => {
    await page.goto('https://www.linkedin.com/jobs/view/3234567890');
    await waitForExtensionActive(page);

    // Extract company via page evaluation
    const company = await page.evaluate(() => {
      const selectors = [
        '.job-details-jobs-unified-top-card__company-name',
        '.topcard__org-name-link',
        'a[data-tracking-control-name*="company"]',
      ];

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el.textContent.trim();
      }
      return null;
    });

    expect(company).toBeTruthy();
    expect(company.length).toBeGreaterThan(0);

    console.log('Detected Company:', company);
  });

  test('should detect job title from LinkedIn job', async ({ page }) => {
    await page.goto('https://www.linkedin.com/jobs/view/3234567890');
    await waitForExtensionActive(page);

    const title = await page.evaluate(() => {
      const selectors = [
        '.job-details-jobs-unified-top-card__job-title',
        'h1.topcard__title',
        '.jobs-unified-top-card__job-title',
      ];

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el.textContent.trim();
      }
      return null;
    });

    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    console.log('Detected Job Title:', title);
  });

  test('should extract job description from LinkedIn', async ({ page }) => {
    await page.goto('https://www.linkedin.com/jobs/view/3234567890');
    await waitForExtensionActive(page);

    // Click "Show more" if description is collapsed
    const showMoreButton = page.locator('button:has-text("Show more"), button:has-text("See more")').first();
    if (await showMoreButton.isVisible({ timeout: 2000 })) {
      await showMoreButton.click();
      await page.waitForTimeout(500);
    }

    const description = await page.evaluate(() => {
      const selectors = [
        '.jobs-description__content',
        '.jobs-box__html-content',
        '[class*="description"]',
      ];

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el.textContent.trim();
      }
      return null;
    });

    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(50);

    console.log('Description length:', description.length, 'characters');
  });

  test('should handle LinkedIn authentication requirement', async ({ page }) => {
    // Navigate to job that might require login
    await page.goto('https://www.linkedin.com/jobs/view/3234567890');

    // Check if redirected to login
    const currentUrl = page.url();

    if (currentUrl.includes('/login') || currentUrl.includes('/authwall')) {
      console.log('LinkedIn requires authentication - test skipped');
      test.skip();
    } else {
      // Continue with test if not redirected
      await waitForExtensionActive(page);
      const floatingButton = await waitForFloatingButton(page);
      await expect(floatingButton).toBeVisible();
    }
  });
});
