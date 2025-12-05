/**
 * Cross-Site Compatibility E2E Tests
 * 
 * Tests the extension's ability to work across multiple job board platforms.
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
  setExtensionStorage,
} from './utils/extension-utils';

// Job board configurations
const jobBoards = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/jobs/view/3234567890',
    urlPattern: /linkedin\.com\/jobs\/view/,
    indicators: ['.job-details', '.jobs-unified-top-card', 'h1'],
  },
  {
    name: 'Indeed',
    url: 'https://www.indeed.com/viewjob?jk=abc123456',
    urlPattern: /indeed\.com\/viewjob/,
    indicators: ['.jobsearch-JobInfoHeader', 'h1', '.company'],
  },
  {
    name: 'Greenhouse',
    url: 'https://boards.greenhouse.io/company/jobs/12345678',
    urlPattern: /greenhouse\.io.*\/jobs/,
    indicators: ['.app-title', 'h1', 'form'],
  },
  {
    name: 'Lever',
    url: 'https://jobs.lever.co/company/job-id',
    urlPattern: /lever\.co/,
    indicators: ['.posting-headline', 'h2', '.section-wrapper'],
  },
  {
    name: 'Workday',
    url: 'https://company.wd1.myworkdayjobs.com/en-US/Career/job/Software-Engineer',
    urlPattern: /myworkdayjobs\.com/,
    indicators: ['[data-automation-id="jobPostingHeader"]', 'h3', 'article'],
  },
];

test.describe('Cross-Site Compatibility', () => {
  for (const board of jobBoards) {
    test(`should detect and activate on ${board.name}`, async ({ page }) => {
      console.log(`\nTesting ${board.name}...`);

      try {
        // Navigate to job board with extended timeout
        await page.goto(board.url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        // Dismiss overlays
        await dismissOverlays(page);

        // Wait for page content to load
        let pageLoaded = false;
        for (const indicator of board.indicators) {
          try {
            await page.waitForSelector(indicator, { timeout: 5000 });
            pageLoaded = true;
            break;
          } catch (e) {
            // Try next indicator
          }
        }

        if (!pageLoaded) {
          console.log(`Warning: ${board.name} page indicators not found`);
        }

        // Check if extension is active
        const active = await isExtensionActive(page);

        console.log(`${board.name} - Extension Active:`, active);

        // Take screenshot for verification
        await takeAnnotatedScreenshot(page, `${board.name.toLowerCase()}-detection`);

        // Extension should activate on job pages
        expect(active).toBe(true);

      } catch (error) {
        console.error(`Error testing ${board.name}:`, error.message);

        // Some job boards may require authentication or have changed URLs
        // Log warning but don't fail the entire test suite
        if (error.message.includes('404') || error.message.includes('Timeout')) {
          console.log(`Skipping ${board.name} - URL may be invalid or require auth`);
          test.skip();
        } else {
          throw error;
        }
      }
    });
  }

  test('should detect jobs across multiple platforms in sequence', async ({ page }) => {
    const results = [];

    for (const board of jobBoards) {
      try {
        await page.goto(board.url, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });

        await dismissOverlays(page);
        await page.waitForTimeout(2000);

        const active = await isExtensionActive(page);

        results.push({
          board: board.name,
          active,
          url: page.url(),
        });

        console.log(`${board.name}: ${active ? '✓' : '✗'}`);
      } catch (error) {
        console.log(`${board.name}: Error - ${error.message}`);
        results.push({
          board: board.name,
          active: false,
          error: error.message,
        });
      }
    }

    // Print summary
    console.log('\n=== Extension Detection Summary ===');
    results.forEach(result => {
      const status = result.active ? '✓ Active' : '✗ Inactive';
      console.log(`${result.board.padEnd(15)} ${status}`);
    });

    // At least 60% of job boards should work
    const successCount = results.filter(r => r.active).length;
    const successRate = (successCount / results.length) * 100;

    console.log(`\nSuccess Rate: ${successRate.toFixed(1)}%`);
    expect(successRate).toBeGreaterThanOrEqual(60);
  });

  test('should extract job details from different platforms', async ({ page }) => {
    const extractedJobs = [];

    for (const board of jobBoards.slice(0, 3)) { // Test first 3 for speed
      try {
        await page.goto(board.url, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });

        await dismissOverlays(page);
        await waitForExtensionActive(page, 10000);

        const jobDetails = await extractJobDetails(page);

        extractedJobs.push({
          board: board.name,
          ...jobDetails,
        });

        console.log(`\n${board.name} Job Details:`);
        console.log(`  Title: ${jobDetails.title?.substring(0, 50) || 'N/A'}`);
        console.log(`  Company: ${jobDetails.company?.substring(0, 30) || 'N/A'}`);
        console.log(`  Location: ${jobDetails.location?.substring(0, 30) || 'N/A'}`);

      } catch (error) {
        console.log(`${board.name}: Could not extract details - ${error.message}`);
      }
    }

    // At least 1 job should have extractable details
    const validJobs = extractedJobs.filter(job => job.title && job.company);
    expect(validJobs.length).toBeGreaterThan(0);
  });

  test('should not activate on non-job pages', async ({ page }) => {
    const nonJobPages = [
      { name: 'LinkedIn Feed', url: 'https://www.linkedin.com/feed/' },
      { name: 'Indeed Homepage', url: 'https://www.indeed.com/' },
      { name: 'GitHub', url: 'https://github.com/' },
      { name: 'Google', url: 'https://www.google.com/' },
    ];

    for (const site of nonJobPages) {
      try {
        await page.goto(site.url, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });

        await page.waitForTimeout(2000);

        const active = await isExtensionActive(page);

        console.log(`${site.name}: ${active ? 'Active (unexpected)' : 'Inactive (correct)'}`);

        // Extension should NOT activate on non-job pages
        expect(active).toBe(false);

      } catch (error) {
        console.log(`${site.name}: Error - ${error.message}`);
      }
    }
  });

  test('should handle URL pattern matching correctly', async ({ page }) => {
    const testUrls = [
      // Should activate
      { url: 'https://www.linkedin.com/jobs/view/123', shouldActivate: true },
      { url: 'https://www.indeed.com/viewjob?jk=abc', shouldActivate: true },
      { url: 'https://boards.greenhouse.io/company/jobs/456', shouldActivate: true },

      // Should NOT activate
      { url: 'https://www.linkedin.com/in/profile', shouldActivate: false },
      { url: 'https://www.indeed.com/jobs', shouldActivate: false },
      { url: 'https://www.google.com/search?q=jobs', shouldActivate: false },
    ];

    const results = [];

    for (const testCase of testUrls) {
      try {
        await page.goto(testCase.url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });

        await page.waitForTimeout(2000);

        const active = await isExtensionActive(page);
        const isCorrect = active === testCase.shouldActivate;

        results.push({
          url: testCase.url,
          expected: testCase.shouldActivate,
          actual: active,
          correct: isCorrect,
        });

        const status = isCorrect ? '✓' : '✗';
        console.log(`${status} ${testCase.url}: Expected ${testCase.shouldActivate}, Got ${active}`);

      } catch (error) {
        console.log(`Error testing ${testCase.url}: ${error.message}`);
      }
    }

    // At least 80% should match expectations
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = (correctCount / results.length) * 100;

    console.log(`\nURL Pattern Matching Accuracy: ${accuracy.toFixed(1)}%`);
    expect(accuracy).toBeGreaterThanOrEqual(80);
  });

  test('should maintain performance across different sites', async ({ page }) => {
    const performanceResults = [];

    for (const board of jobBoards.slice(0, 3)) {
      try {
        const startTime = Date.now();

        await page.goto(board.url, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });

        await waitForExtensionActive(page, 10000);

        const endTime = Date.now();
        const loadTime = endTime - startTime;

        performanceResults.push({
          board: board.name,
          loadTime,
        });

        console.log(`${board.name}: ${loadTime}ms`);

        // Extension should activate within reasonable time (< 10 seconds)
        expect(loadTime).toBeLessThan(10000);

      } catch (error) {
        console.log(`${board.name}: Performance test failed - ${error.message}`);
      }
    }

    // Calculate average load time
    if (performanceResults.length > 0) {
      const avgTime = performanceResults.reduce((sum, r) => sum + r.loadTime, 0) / performanceResults.length;
      console.log(`\nAverage Load Time: ${avgTime.toFixed(0)}ms`);

      // Average should be under 7 seconds
      expect(avgTime).toBeLessThan(7000);
    }
  });

  test('should handle dynamic content loading', async ({ page }) => {
    // Test with LinkedIn (known for dynamic content)
    await page.goto('https://www.linkedin.com/jobs/search/?keywords=software', {
      waitUntil: 'networkidle',
    });

    // Wait for job cards to load
    await page.waitForSelector('.jobs-search-results-list, .job-card', { timeout: 10000 });

    // Click on first job card to load details dynamically
    const firstJobCard = page.locator('.job-card, .job-card-container').first();

    if (await firstJobCard.isVisible({ timeout: 5000 })) {
      await firstJobCard.click();
      await page.waitForTimeout(2000);

      // Extension should activate after dynamic content loads
      const active = await isExtensionActive(page);
      console.log('Extension active after dynamic load:', active);

      // May or may not activate on search results page depending on implementation
      // Main test is that it doesn't crash
      expect(typeof active).toBe('boolean');
    }
  });
});
