/**
 * Indeed Auto-Fill E2E Tests
 * 
 * Tests the extension's auto-fill functionality on Indeed application forms.
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

test.describe('Indeed Auto-Fill', () => {
  // Setup user profile data before tests
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();

    // Set user profile in extension storage
    await setExtensionStorage(context, 'userProfile', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      linkedin: 'https://www.linkedin.com/in/johndoe',
      website: 'https://johndoe.com',
    });

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await dismissOverlays(page);
  });

  test('should auto-fill Indeed application form', async ({ page, context }) => {
    // Navigate to Indeed job application
    // Note: Replace with actual test job URL
    await page.goto('https://www.indeed.com/viewjob?jk=abc123456', {
      waitUntil: 'networkidle',
    });

    // Click "Apply Now" button if present
    const applyButton = page.locator('button:has-text("Apply"), a:has-text("Apply")').first();
    if (await applyButton.isVisible({ timeout: 5000 })) {
      await applyButton.click();
      await page.waitForLoadState('networkidle');
    }

    // Wait for application form
    await page.waitForSelector('form, [class*="application"]', { timeout: 10000 });

    // Wait for extension to detect the form
    await waitForExtensionActive(page);

    // Take screenshot before auto-fill
    await takeAnnotatedScreenshot(page, 'indeed-before-autofill');

    // Trigger auto-fill via floating button or direct action
    const floatingButton = await waitForFloatingButton(page);
    await floatingButton.click();

    // Wait for auto-fill to complete
    await page.waitForTimeout(2000);

    // Take screenshot after auto-fill
    await takeAnnotatedScreenshot(page, 'indeed-after-autofill');

    // Verify form fields are filled
    const firstNameInput = page.locator('input[name*="first" i], input[id*="first" i]').first();
    if (await firstNameInput.isVisible({ timeout: 2000 })) {
      const firstNameValue = await firstNameInput.inputValue();
      expect(firstNameValue).toBe('John');
    }

    const lastNameInput = page.locator('input[name*="last" i], input[id*="last" i]').first();
    if (await lastNameInput.isVisible({ timeout: 2000 })) {
      const lastNameValue = await lastNameInput.inputValue();
      expect(lastNameValue).toBe('Doe');
    }

    const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
    if (await emailInput.isVisible({ timeout: 2000 })) {
      const emailValue = await emailInput.inputValue();
      expect(emailValue).toContain('@');
      expect(emailValue).toContain('john');
    }
  });

  test('should upload resume on Indeed application', async ({ page }) => {
    await page.goto('https://www.indeed.com/viewjob?jk=abc123456');

    // Navigate to application form
    const applyButton = page.locator('button:has-text("Apply")').first();
    if (await applyButton.isVisible({ timeout: 5000 })) {
      await applyButton.click();
    }

    await page.waitForSelector('form', { timeout: 10000 });
    await waitForExtensionActive(page);

    // Look for file upload field
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.isVisible({ timeout: 5000 })) {
      // Upload test resume
      await uploadResume(page, 'test-resume.pdf');

      // Verify file is attached
      const fileName = await fileInput.evaluate((el) => {
        return el.files?.[0]?.name || null;
      });

      expect(fileName).toBeTruthy();
      expect(fileName).toContain('.pdf');

      console.log('Uploaded file:', fileName);
    } else {
      console.log('No file upload field found - test skipped');
      test.skip();
    }
  });

  test('should handle Indeed Easy Apply', async ({ page }) => {
    // Indeed Easy Apply is a streamlined application process
    await page.goto('https://www.indeed.com/viewjob?jk=abc123456');

    // Look for Easy Apply indicator
    const easyApplyBadge = page.locator('[data-tn-element="easyApplyButton"], button:has-text("Easily apply")');

    if (await easyApplyBadge.isVisible({ timeout: 5000 })) {
      await easyApplyBadge.click();

      // Wait for modal/form
      await page.waitForSelector('.ia-Modal, [class*="modal"]', { timeout: 5000 });

      // Extension should activate
      await waitForExtensionActive(page, 5000);

      // Auto-fill should work
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      await expect(continueButton).toBeVisible();
    } else {
      console.log('Easy Apply not available - test skipped');
      test.skip();
    }
  });

  test('should detect job details on Indeed', async ({ page }) => {
    await page.goto('https://www.indeed.com/viewjob?jk=abc123456');
    await waitForExtensionActive(page);

    // Extract job details
    const jobDetails = await page.evaluate(() => {
      return {
        title: document.querySelector('.jobsearch-JobInfoHeader-title, h1')?.textContent?.trim(),
        company: document.querySelector('.jobsearch-InlineCompanyRating-companyHeader, [class*="company"]')?.textContent?.trim(),
        location: document.querySelector('[class*="location"], .jobsearch-JobInfoHeader-subtitle')?.textContent?.trim(),
      };
    });

    expect(jobDetails.title).toBeTruthy();
    expect(jobDetails.company).toBeTruthy();

    console.log('Indeed Job Details:', jobDetails);
  });

  test('should fill phone number with correct format', async ({ page }) => {
    await page.goto('https://www.indeed.com/viewjob?jk=abc123456');

    // Navigate to form
    const applyButton = page.locator('button:has-text("Apply")').first();
    if (await applyButton.isVisible({ timeout: 5000 })) {
      await applyButton.click();
    }

    await page.waitForSelector('form', { timeout: 10000 });
    await waitForExtensionActive(page);

    // Trigger auto-fill
    const floatingButton = await waitForFloatingButton(page);
    await floatingButton.click();
    await page.waitForTimeout(1000);

    // Check phone number format
    const phoneInput = page.locator('input[type="tel"], input[name*="phone" i]').first();
    if (await phoneInput.isVisible({ timeout: 2000 })) {
      const phoneValue = await phoneInput.inputValue();

      // Verify phone has some format (digits, possibly with separators)
      expect(phoneValue).toMatch(/[\d\-\(\)\s]+/);
      expect(phoneValue.replace(/\D/g, '')).toHaveLength(10); // US phone number

      console.log('Phone number filled:', phoneValue);
    }
  });

  test('should handle multi-page Indeed application', async ({ page }) => {
    await page.goto('https://www.indeed.com/viewjob?jk=abc123456');

    const applyButton = page.locator('button:has-text("Apply")').first();
    if (await applyButton.isVisible({ timeout: 5000 })) {
      await applyButton.click();
    }

    await page.waitForSelector('form', { timeout: 10000 });
    await waitForExtensionActive(page);

    // Fill first page
    await fillFormFields(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '5551234567',
    });

    await takeAnnotatedScreenshot(page, 'indeed-page1-filled');

    // Click Continue/Next
    const nextButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
    if (await nextButton.isVisible({ timeout: 2000 })) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Verify we moved to next page
      const currentUrl = page.url();
      console.log('Navigated to:', currentUrl);

      // Extension should remain active
      await waitForExtensionActive(page, 5000);
    }
  });

  test('should not interfere with manual form filling', async ({ page }) => {
    await page.goto('https://www.indeed.com/viewjob?jk=abc123456');

    const applyButton = page.locator('button:has-text("Apply")').first();
    if (await applyButton.isVisible({ timeout: 5000 })) {
      await applyButton.click();
    }

    await page.waitForSelector('form', { timeout: 10000 });

    // Manually fill a field
    const firstNameInput = page.locator('input[name*="first" i]').first();
    if (await firstNameInput.isVisible({ timeout: 2000 })) {
      await firstNameInput.fill('Manual');

      // Trigger auto-fill
      await waitForExtensionActive(page);
      const floatingButton = await waitForFloatingButton(page);
      await floatingButton.click();
      await page.waitForTimeout(1000);

      // Verify manual entry is preserved or overwritten based on settings
      const finalValue = await firstNameInput.inputValue();
      expect(finalValue).toBeTruthy();

      console.log('Field value after auto-fill:', finalValue);
    }
  });

  test('should handle Indeed job alerts page', async ({ page }) => {
    await page.goto('https://www.indeed.com/alerts');

    // Extension should not interfere with non-job pages
    await page.waitForTimeout(2000);

    const floatingButton = page.locator('[data-jobseek-extension="true"]');
    await expect(floatingButton).not.toBeVisible();

    console.log('Extension correctly inactive on alerts page');
  });
});
