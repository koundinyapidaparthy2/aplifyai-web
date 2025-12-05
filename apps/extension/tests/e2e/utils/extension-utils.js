/**
 * E2E Test Utilities for Chrome Extension Testing
 * 
 * Provides helper functions for:
 * - Extension interaction
 * - Job board navigation
 * - Form filling
 * - File uploads
 * - Waiting for extension actions
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Wait for the extension to inject and become active
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForExtensionActive(page, timeout = 5000) {
  await page.waitForFunction(
    () => {
      return !!document.querySelector('[data-jobseek-active]') ||
        !!document.querySelector('[data-jobseek-extension]');
    },
    { timeout }
  );
}

/**
 * Get the extension ID from the loaded extension
 * @param {BrowserContext} context - Playwright browser context
 * @returns {Promise<string>} Extension ID
 */
async function getExtensionId(context) {
  // Method 1: Try to get from service worker
  let serviceWorker = context.serviceWorkers()[0];
  if (!serviceWorker) {
    // Wait for service worker to register
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 10000 });
  }

  const extensionId = serviceWorker.url().split('/')[2];
  return extensionId;
}

/**
 * Open extension popup
 * @param {BrowserContext} context - Playwright browser context
 * @param {string} popupPath - Path to popup HTML (e.g., 'popup.html')
 * @returns {Promise<Page>} Popup page
 */
async function openExtensionPopup(context, popupPath = 'popup.html') {
  const extensionId = await getExtensionId(context);
  const popupURL = `chrome-extension://${extensionId}/${popupPath}`;
  const popup = await context.newPage();
  await popup.goto(popupURL);
  return popup;
}

/**
 * Wait for floating button to appear
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForFloatingButton(page, timeout = 10000) {
  const selector = '[data-jobseek-extension="true"], .jobseek-floating-button, #jobseek-fab';
  await page.waitForSelector(selector, { timeout, state: 'visible' });
  return page.locator(selector).first();
}

/**
 * Click the floating action button
 * @param {Page} page - Playwright page object
 */
async function clickFloatingButton(page) {
  const button = await waitForFloatingButton(page);
  await button.click();
}

/**
 * Wait for popup/modal to open
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForPopup(page, timeout = 5000) {
  const selector = '.jobseek-popup, .jobseek-modal, [data-jobseek-popup]';
  await page.waitForSelector(selector, { timeout, state: 'visible' });
  return page.locator(selector).first();
}

/**
 * Fill form fields with user data
 * @param {Page} page - Playwright page object
 * @param {Object} data - User data to fill
 */
async function fillFormFields(page, data) {
  const fieldMappings = [
    // First Name variations
    { names: ['firstName', 'first_name', 'fname', 'given-name'], value: data.firstName },
    // Last Name variations
    { names: ['lastName', 'last_name', 'lname', 'family-name'], value: data.lastName },
    // Email variations
    { names: ['email', 'emailAddress', 'email_address', 'e-mail'], value: data.email },
    // Phone variations
    { names: ['phone', 'phoneNumber', 'phone_number', 'tel', 'mobile'], value: data.phone },
    // LinkedIn variations
    { names: ['linkedin', 'linkedinUrl', 'linkedin_url'], value: data.linkedin },
    // Website variations
    { names: ['website', 'portfolio', 'personal_website'], value: data.website },
  ];

  for (const mapping of fieldMappings) {
    if (!mapping.value) continue;

    for (const name of mapping.names) {
      // Try different selectors
      const selectors = [
        `input[name="${name}"]`,
        `input[id="${name}"]`,
        `input[placeholder*="${name}" i]`,
        `textarea[name="${name}"]`,
      ];

      for (const selector of selectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible({ timeout: 500 })) {
            await field.fill(mapping.value);
            break;
          }
        } catch (e) {
          // Field not found, try next selector
        }
      }
    }
  }
}

/**
 * Upload file to file input
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @param {string} filePath - Path to file to upload
 */
async function uploadFile(page, selector, filePath) {
  const fileInput = page.locator(selector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Upload resume to the most common file input
 * @param {Page} page - Playwright page object
 * @param {string} resumePath - Path to resume file
 */
async function uploadResume(page, resumePath) {
  const testDataDir = path.join(__dirname, 'test-data');
  const fullPath = path.isAbsolute(resumePath)
    ? resumePath
    : path.join(testDataDir, resumePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Resume file not found: ${fullPath}`);
  }

  // Try common resume upload selectors
  const selectors = [
    'input[type="file"][name*="resume" i]',
    'input[type="file"][id*="resume" i]',
    'input[type="file"][accept*="pdf" i]',
    'input[type="file"]',
  ];

  for (const selector of selectors) {
    try {
      const fileInput = page.locator(selector).first();
      if (await fileInput.isVisible({ timeout: 500 })) {
        await fileInput.setInputFiles(fullPath);
        return;
      }
    } catch (e) {
      // Try next selector
    }
  }

  throw new Error('No file input found for resume upload');
}

/**
 * Navigate to next step in multi-step form
 * @param {Page} page - Playwright page object
 */
async function clickNextStep(page) {
  const selectors = [
    'button:has-text("Next")',
    'button:has-text("Continue")',
    'button[type="submit"]:has-text("Next")',
    'a:has-text("Next")',
    '.next-button',
    '#next-button',
  ];

  for (const selector of selectors) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 })) {
        await button.click();
        return;
      }
    } catch (e) {
      // Try next selector
    }
  }

  throw new Error('Next button not found');
}

/**
 * Wait for AI answer generation to complete
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForAIAnswers(page, timeout = 30000) {
  // Wait for loading indicator to disappear
  await page.waitForSelector('.ai-loading, .generating-answers', {
    state: 'hidden',
    timeout
  }).catch(() => { });

  // Wait for generated answers to appear
  await page.waitForSelector('.ai-generated-answer, [data-ai-generated]', {
    state: 'visible',
    timeout
  });
}

/**
 * Extract job details from the page
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object>} Job details
 */
async function extractJobDetails(page) {
  return await page.evaluate(() => {
    // Try to extract job details from common selectors
    const getTextContent = (selectors) => {
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el.textContent.trim();
      }
      return null;
    };

    return {
      title: getTextContent([
        'h1.job-title',
        '.job-title',
        'h1[class*="title"]',
        'h1',
      ]),
      company: getTextContent([
        '.company-name',
        '[class*="company"]',
        'a[class*="company"]',
      ]),
      location: getTextContent([
        '.job-location',
        '[class*="location"]',
      ]),
      description: getTextContent([
        '.job-description',
        '[class*="description"]',
      ]),
    };
  });
}

/**
 * Check if extension is active on the page
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>}
 */
async function isExtensionActive(page) {
  return await page.evaluate(() => {
    return !!document.querySelector('[data-jobseek-active]') ||
      !!window.__JOBSEEK_EXTENSION_LOADED__;
  });
}

/**
 * Trigger extension action via page evaluation
 * @param {Page} page - Playwright page object
 * @param {string} action - Action name
 * @param {Object} data - Action data
 */
async function triggerExtensionAction(page, action, data = {}) {
  await page.evaluate(({ action, data }) => {
    window.postMessage({
      type: 'JOBSEEK_EXTENSION_ACTION',
      action,
      data,
    }, '*');
  }, { action, data });
}

/**
 * Wait for Chrome extension message
 * @param {Page} page - Playwright page object
 * @param {string} messageType - Expected message type
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForExtensionMessage(page, messageType, timeout = 10000) {
  return await page.evaluate(
    ({ messageType, timeout }) => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Timeout waiting for message: ${messageType}`));
        }, timeout);

        const handler = (event) => {
          if (event.data?.type === messageType) {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handler);
            resolve(event.data);
          }
        };

        window.addEventListener('message', handler);
      });
    },
    { messageType, timeout }
  );
}

/**
 * Get extension storage data
 * @param {BrowserContext} context - Playwright browser context
 * @param {string} key - Storage key
 * @returns {Promise<any>}
 */
async function getExtensionStorage(context, key) {
  const extensionId = await getExtensionId(context);
  const page = await context.newPage();

  try {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const data = await page.evaluate((storageKey) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(storageKey, (result) => {
          resolve(result[storageKey]);
        });
      });
    }, key);

    await page.close();
    return data;
  } catch (error) {
    await page.close();
    throw error;
  }
}

/**
 * Set extension storage data
 * @param {BrowserContext} context - Playwright browser context
 * @param {string} key - Storage key
 * @param {any} value - Storage value
 */
async function setExtensionStorage(context, key, value) {
  const extensionId = await getExtensionId(context);
  const page = await context.newPage();

  try {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    await page.evaluate(({ storageKey, storageValue }) => {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [storageKey]: storageValue }, () => {
          resolve();
        });
      });
    }, { storageKey: key, storageValue: value });

    await page.close();
  } catch (error) {
    await page.close();
    throw error;
  }
}

/**
 * Take screenshot with annotation
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 */
async function takeAnnotatedScreenshot(page, name) {
  await page.screenshot({
    path: `test-results/${name}.png`,
    fullPage: true,
  });
}

/**
 * Dismiss cookie banners and overlays
 * @param {Page} page - Playwright page object
 */
async function dismissOverlays(page) {
  const overlaySelectors = [
    'button:has-text("Accept")',
    'button:has-text("Accept All")',
    'button:has-text("I Accept")',
    'button:has-text("Close")',
    '.cookie-banner button',
    '#cookie-banner button',
  ];

  for (const selector of overlaySelectors) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 2000 })) {
        await button.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Overlay not found or already dismissed
    }
  }
}

export {
  waitForExtensionActive,
  getExtensionId,
  openExtensionPopup,
  waitForFloatingButton,
  clickFloatingButton,
  waitForPopup,
  fillFormFields,
  uploadFile,
  uploadResume,
  clickNextStep,
  waitForAIAnswers,
  extractJobDetails,
  isExtensionActive,
  triggerExtensionAction,
  waitForExtensionMessage,
  getExtensionStorage,
  setExtensionStorage,
  takeAnnotatedScreenshot,
  dismissOverlays,
};
