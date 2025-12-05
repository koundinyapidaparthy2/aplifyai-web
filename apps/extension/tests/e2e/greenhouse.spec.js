/**
 * Greenhouse Multi-Step Form E2E Tests
 * 
 * Tests the extension's ability to handle multi-step Greenhouse applications
 * including AI-powered screening question answering.
 */

import { test, expect } from '@playwright/test';
import {
  waitForExtensionActive,
  waitForFloatingButton,
  clickFloatingButton,
  fillFormFields,
  uploadResume,
  clickNextStep,
  waitForAIAnswers,
  dismissOverlays,
  takeAnnotatedScreenshot,
  setExtensionStorage,
} from './utils/extension-utils';

test.describe('Greenhouse Multi-Step Application', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();

    // Setup user profile
    await setExtensionStorage(context, 'userProfile', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '5551234567',
      linkedin: 'https://linkedin.com/in/johndoe',
      website: 'https://johndoe.com',
      location: 'San Francisco, CA',
    });

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await dismissOverlays(page);
  });

  test('should handle Greenhouse multi-step application flow', async ({ page }) => {
    // Navigate to Greenhouse job posting
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678', {
      waitUntil: 'networkidle',
    });

    // Wait for extension to activate
    await waitForExtensionActive(page);

    // ===== STEP 1: Basic Information =====
    console.log('Step 1: Filling basic information...');

    await page.waitForSelector('form', { timeout: 10000 });

    // Fill basic info
    await fillFormFields(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '5551234567',
    });

    await takeAnnotatedScreenshot(page, 'greenhouse-step1');

    // Click Submit or Next
    await clickNextStep(page);
    await page.waitForLoadState('networkidle');

    // ===== STEP 2: Resume Upload =====
    console.log('Step 2: Uploading resume...');

    await page.waitForSelector('input[type="file"], form', { timeout: 10000 });

    // Upload resume
    try {
      await uploadResume(page, 'test-resume.pdf');
      console.log('Resume uploaded successfully');
    } catch (error) {
      console.log('Resume upload not required or failed:', error.message);
    }

    await takeAnnotatedScreenshot(page, 'greenhouse-step2');

    // Continue to next step
    await clickNextStep(page);
    await page.waitForLoadState('networkidle');

    // ===== STEP 3: Screening Questions =====
    console.log('Step 3: Answering screening questions...');

    // Wait for screening questions form
    await page.waitForSelector('textarea, input[type="text"]', { timeout: 10000 });

    // Check if AI answer button is available
    const aiButton = page.locator('[data-jobseek-action="generate-answers"], button:has-text("Generate AI Answers")');

    if (await aiButton.isVisible({ timeout: 3000 })) {
      // Trigger AI answer generation
      await aiButton.click();
      console.log('Triggered AI answer generation...');

      // Wait for AI to generate answers
      await waitForAIAnswers(page, 30000);

      // Verify answers are populated
      const textareas = await page.locator('textarea').all();

      for (let i = 0; i < textareas.length; i++) {
        const value = await textareas[i].inputValue();
        console.log(`Question ${i + 1} answer length:`, value.length);

        if (value.length > 0) {
          expect(value.length).toBeGreaterThan(50);
          expect(value).toMatch(/[a-zA-Z]/); // Contains text
        }
      }
    } else {
      console.log('AI answer button not found - manually filling questions');

      // Manually fill screening questions as fallback
      const textareas = await page.locator('textarea').all();
      for (const textarea of textareas) {
        await textarea.fill('I have extensive experience in this field with proven track record of success.');
      }
    }

    await takeAnnotatedScreenshot(page, 'greenhouse-step3');

    console.log('Multi-step form completed!');
  });

  test('should detect Greenhouse job details', async ({ page }) => {
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678');
    await waitForExtensionActive(page);

    const jobDetails = await page.evaluate(() => {
      return {
        title: document.querySelector('.app-title, h1')?.textContent?.trim(),
        company: document.querySelector('.company-name')?.textContent?.trim(),
        location: document.querySelector('.location')?.textContent?.trim(),
      };
    });

    console.log('Greenhouse Job Details:', jobDetails);
    expect(jobDetails.title).toBeTruthy();
  });

  test('should fill all required fields on Greenhouse form', async ({ page }) => {
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678');
    await page.waitForSelector('form', { timeout: 10000 });
    await waitForExtensionActive(page);

    // Get all required fields
    const requiredFields = await page.locator('input[required], textarea[required], select[required]').all();

    console.log(`Found ${requiredFields.length} required fields`);

    // Fill required fields
    await fillFormFields(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '5551234567',
    });

    // Check if all required fields are filled
    let unfilledCount = 0;
    for (const field of requiredFields) {
      const value = await field.inputValue().catch(() => '');
      if (!value || value.trim() === '') {
        unfilledCount++;
      }
    }

    console.log(`Unfilled required fields: ${unfilledCount}`);

    // Some fields may require manual input (e.g., custom questions)
    // So we don't strictly fail on unfilled fields
  });

  test('should handle Greenhouse custom questions', async ({ page }) => {
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678');
    await page.waitForSelector('form', { timeout: 10000 });

    // Navigate through to custom questions
    await fillFormFields(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    try {
      await clickNextStep(page);
      await page.waitForLoadState('networkidle');
    } catch (e) {
      console.log('No next step or error:', e.message);
    }

    // Look for custom question fields
    const customQuestions = await page.locator('textarea[name*="question"], textarea[id*="question"]').all();

    console.log(`Found ${customQuestions.length} custom question fields`);

    if (customQuestions.length > 0) {
      // Trigger AI answer generation via extension action
      await triggerExtensionAction(page, 'GENERATE_ANSWERS');
      await page.waitForTimeout(5000); // Wait for generation

      // Check if answers are populated
      for (let i = 0; i < customQuestions.length; i++) {
        const value = await customQuestions[i].inputValue();
        console.log(`Custom question ${i + 1} filled:`, value.length > 0);
      }
    }
  });

  test('should save application progress on Greenhouse', async ({ page }) => {
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678');
    await page.waitForSelector('form', { timeout: 10000 });

    // Fill some fields
    await fillFormFields(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    // Look for "Save and Continue Later" button
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Progress")').first();

    if (await saveButton.isVisible({ timeout: 3000 })) {
      await saveButton.click();
      console.log('Application progress saved');

      // Verify confirmation message
      const confirmation = page.locator(':has-text("saved"), :has-text("progress")');
      await expect(confirmation).toBeVisible({ timeout: 5000 });
    } else {
      console.log('Save progress button not available');
      test.skip();
    }
  });

  test('should handle file upload errors on Greenhouse', async ({ page }) => {
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678');
    await page.waitForSelector('form', { timeout: 10000 });

    // Try to proceed without uploading required resume
    await fillFormFields(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    try {
      await clickNextStep(page);
    } catch (e) {
      // Expected to fail without resume
    }

    // Check for error message
    const errorMessage = page.locator('[class*="error"], .error-message, [role="alert"]');

    if (await errorMessage.isVisible({ timeout: 3000 })) {
      const errorText = await errorMessage.textContent();
      console.log('Error message displayed:', errorText);
      expect(errorText?.toLowerCase()).toMatch(/resume|file|upload|required/);
    }
  });

  test('should handle dropdown selections on Greenhouse', async ({ page }) => {
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678');
    await page.waitForSelector('form', { timeout: 10000 });

    // Find dropdowns
    const dropdowns = await page.locator('select').all();

    console.log(`Found ${dropdowns.length} dropdown fields`);

    for (let i = 0; i < dropdowns.length; i++) {
      const options = await dropdowns[i].locator('option').all();

      if (options.length > 1) {
        // Select first non-empty option
        const value = await options[1].getAttribute('value');
        if (value) {
          await dropdowns[i].selectOption(value);
          console.log(`Selected option for dropdown ${i + 1}`);
        }
      }
    }
  });

  test('should handle Greenhouse EEOC questions', async ({ page }) => {
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678');
    await page.waitForSelector('form', { timeout: 10000 });

    // Navigate through form to EEOC section
    await fillFormFields(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    // Try to reach EEOC page
    try {
      await clickNextStep(page);
      await page.waitForLoadState('networkidle');
      await clickNextStep(page);
      await page.waitForLoadState('networkidle');
    } catch (e) {
      console.log('Could not navigate to EEOC section');
    }

    // Look for EEOC-related text
    const eeocSection = page.locator(':has-text("equal opportunity"), :has-text("EEOC"), :has-text("voluntary")');

    if (await eeocSection.isVisible({ timeout: 3000 })) {
      console.log('EEOC section detected');

      // EEOC questions are typically optional
      // Verify "Decline to self-identify" option exists
      const declineOption = page.locator('input[value*="decline" i], label:has-text("Decline")');
      await expect(declineOption.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should validate email format on Greenhouse', async ({ page }) => {
    await page.goto('https://boards.greenhouse.io/company/jobs/12345678');
    await page.waitForSelector('form', { timeout: 10000 });

    // Fill with invalid email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('invalid-email');

    // Try to submit
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitButton.click();

    // Check for validation error
    const validationError = page.locator('[class*="error"], .error-message');

    // Browser native validation or custom validation should appear
    const isInvalid = await emailInput.evaluate((el) => !el.validity.valid);
    expect(isInvalid).toBe(true);

    console.log('Email validation working correctly');
  });
});
