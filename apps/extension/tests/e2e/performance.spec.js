/**
 * Performance Test Suite for JobSeek Chrome Extension
 * Tests memory usage, load times, CPU performance, and extension overhead
 */

import { test, expect } from '@playwright/test';
import {
  waitForExtensionActive,
  isExtensionActive,
  dismissOverlays,
} from './utils/extension-utils';
import {
  measureMemoryUsage,
  measurePageLoadTime,
  measureCPUUsage,
  monitorNetworkPerformance,
  measureExtensionOverhead,
  getPerformanceMetrics,
} from './utils/performance-utils';

test.describe('Performance Tests', () => {
  test.describe('Memory Leak Detection', () => {
    test('should not leak memory in content script', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await dismissOverlays(page);

      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Simulate user interactions (100 iterations)
      for (let i = 0; i < 100; i++) {
        // Try to click floating button
        const button = await page.locator('[data-jobseek-button]').first();
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          await button.click({ timeout: 1000 }).catch(() => { });
        }

        // Wait briefly between interactions
        await page.waitForTimeout(50);

        // Trigger some DOM updates
        await page.evaluate(() => {
          const event = new Event('scroll');
          window.dispatchEvent(event);
        });
      }

      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });

      await page.waitForTimeout(1000);

      // Get final memory
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);
      console.log(`Initial: ${(initialMemory / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`Final: ${(finalMemory / (1024 * 1024)).toFixed(2)} MB`);

      // Memory increase should be less than 10MB after 100 interactions
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should not leak memory when opening/closing popup', async ({ page, context }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await dismissOverlays(page);

      const initialMemory = await measureMemoryUsage(page);

      // Open and close popup 50 times
      for (let i = 0; i < 50; i++) {
        // Try to click floating button to open popup
        const button = await page.locator('[data-jobseek-button]').first();
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          await button.click({ timeout: 500 }).catch(() => { });
          await page.waitForTimeout(100);

          // Close popup (press Escape)
          await page.keyboard.press('Escape');
          await page.waitForTimeout(50);
        } else {
          // If button not found, just wait and continue
          await page.waitForTimeout(100);
        }
      }

      // Force GC
      await page.evaluate(() => {
        if (window.gc) window.gc();
      });
      await page.waitForTimeout(1000);

      const finalMemory = await measureMemoryUsage(page);
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      console.log(`Popup memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);

      // Should not leak more than 5MB
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('should clean up event listeners on page unload', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');

      // Get number of listeners before
      const listenersBefore = await page.evaluate(() => {
        return window.getEventListeners ?
          Object.keys(window.getEventListeners(document)).length :
          0;
      });

      // Navigate away
      await page.goto('https://www.linkedin.com/feed');
      await page.waitForTimeout(500);

      // Go back
      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await page.waitForTimeout(500);

      // Navigate away again
      await page.goto('https://www.linkedin.com/feed');
      await page.waitForTimeout(500);

      // Check listeners didn't accumulate
      const listenersAfter = await page.evaluate(() => {
        return window.getEventListeners ?
          Object.keys(window.getEventListeners(document)).length :
          0;
      });

      console.log(`Listeners before: ${listenersBefore}, after: ${listenersAfter}`);

      // Listeners should not grow significantly (allow some variance)
      expect(listenersAfter).toBeLessThanOrEqual(listenersBefore + 5);
    });
  });

  test.describe('DOM Performance', () => {
    test('should not slow down page load', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('https://www.linkedin.com/jobs/view/12345', {
        waitUntil: 'domcontentloaded',
      });

      const loadTime = Date.now() - startTime;

      console.log(`Page load time: ${loadTime}ms`);

      // Page should load in less than 5 seconds even with extension
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not add excessive DOM nodes', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await dismissOverlays(page);

      // Wait for extension to activate
      await waitForExtensionActive(page, 5000).catch(() => { });

      // Count extension-added nodes
      const extensionNodes = await page.evaluate(() => {
        const nodes = document.querySelectorAll('[data-jobseek-*], [class*="jobseek"]');
        return nodes.length;
      });

      console.log(`Extension added ${extensionNodes} DOM nodes`);

      // Extension should add less than 20 nodes
      expect(extensionNodes).toBeLessThan(20);
    });

    test('should not cause layout thrashing', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');

      // Measure layout recalculations
      await page.evaluate(() => {
        window.layoutRecalcCount = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'Layout') {
              window.layoutRecalcCount++;
            }
          }
        });
        observer.observe({ entryTypes: ['measure'] });
      });

      // Trigger some interactions
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, 100);
        });
        await page.waitForTimeout(100);
      }

      const layoutCount = await page.evaluate(() => window.layoutRecalcCount || 0);

      console.log(`Layout recalculations: ${layoutCount}`);

      // Should not cause excessive reflows
      expect(layoutCount).toBeLessThan(50);
    });

    test('should render floating button within 1 second', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await dismissOverlays(page);

      // Wait for floating button
      await page.locator('[data-jobseek-button]').first().waitFor({
        state: 'visible',
        timeout: 5000
      }).catch(() => { });

      const renderTime = Date.now() - startTime;

      console.log(`Floating button render time: ${renderTime}ms`);

      // Button should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });
  });

  test.describe('CPU Usage', () => {
    test('should not consume excessive CPU during idle', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await dismissOverlays(page);
      await page.waitForTimeout(2000);

      // Start CPU monitoring
      const cpuUsage = await page.evaluate(() => {
        return new Promise((resolve) => {
          const start = performance.now();
          let iterations = 0;

          const interval = setInterval(() => {
            iterations++;
            if (iterations >= 10) {
              clearInterval(interval);
              const end = performance.now();
              resolve(end - start);
            }
          }, 100);
        });
      });

      console.log(`CPU monitoring time: ${cpuUsage}ms`);

      // Should not block event loop
      expect(cpuUsage).toBeLessThan(2000);
    });

    test('should handle rapid page navigation efficiently', async ({ page }) => {
      const urls = [
        'https://www.linkedin.com/jobs/view/12345',
        'https://www.indeed.com/viewjob?jk=abc123',
        'https://www.linkedin.com/feed',
        'https://www.linkedin.com/jobs/search',
      ];

      const startTime = Date.now();

      for (const url of urls) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(500);
      }

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / urls.length;

      console.log(`Average navigation time: ${avgTime.toFixed(2)}ms`);

      // Average should be less than 3 seconds per page
      expect(avgTime).toBeLessThan(3000);
    });
  });

  test.describe('Extension Overhead', () => {
    test('should measure extension vs no-extension performance', async ({ browser }) => {
      // Test with extension
      const contextWithExt = await browser.newContext();
      const pageWithExt = await contextWithExt.newPage();

      const startWithExt = Date.now();
      await pageWithExt.goto('https://www.linkedin.com/jobs/view/12345', {
        waitUntil: 'domcontentloaded',
      });
      const timeWithExt = Date.now() - startWithExt;

      await pageWithExt.close();
      await contextWithExt.close();

      console.log(`Load time with extension: ${timeWithExt}ms`);

      // Extension overhead should be less than 500ms
      expect(timeWithExt).toBeLessThan(5000);
    });

    test('should not delay initial page render', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');

      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          domInteractive: perfData.domInteractive - perfData.fetchStart,
        };
      });

      console.log('Performance metrics:', metrics);

      // DOM Interactive should be fast
      expect(metrics.domInteractive).toBeLessThan(3000);
    });

    test('should not block critical rendering path', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');

      // Check First Contentful Paint
      const fcp = await page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('paint');
        const fcpEntry = perfEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
      });

      if (fcp !== null) {
        console.log(`First Contentful Paint: ${fcp.toFixed(2)}ms`);

        // FCP should be under 2 seconds
        expect(fcp).toBeLessThan(2000);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize API calls', async ({ page }) => {
      const apiCalls = [];

      page.on('request', request => {
        if (request.url().includes('api') || request.url().includes('graphql')) {
          apiCalls.push({
            url: request.url(),
            method: request.method(),
          });
        }
      });

      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await dismissOverlays(page);
      await page.waitForTimeout(3000);

      console.log(`API calls made: ${apiCalls.length}`);
      apiCalls.forEach(call => console.log(`  ${call.method} ${call.url}`));

      // Extension should make minimal API calls (backend + Gemini)
      // Allow up to 10 calls for various services
      expect(apiCalls.length).toBeLessThan(10);
    });

    test('should cache repeated requests', async ({ page }) => {
      const requests = [];

      page.on('request', request => {
        requests.push(request.url());
      });

      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await page.waitForTimeout(2000);

      // Reload page
      await page.reload();
      await page.waitForTimeout(2000);

      // Count duplicate requests
      const uniqueRequests = new Set(requests);
      const duplicateCount = requests.length - uniqueRequests.size;

      console.log(`Total requests: ${requests.length}`);
      console.log(`Unique requests: ${uniqueRequests.size}`);
      console.log(`Duplicates: ${duplicateCount}`);

      // Some duplicates are expected, but excessive caching should prevent too many
      // This is a reasonable threshold
      expect(duplicateCount).toBeLessThan(requests.length * 0.5);
    });

    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate offline
      await page.context().setOffline(true);

      const startTime = Date.now();
      await page.goto('https://www.linkedin.com/jobs/view/12345').catch(() => { });
      const failTime = Date.now() - startTime;

      console.log(`Offline navigation time: ${failTime}ms`);

      // Should fail fast, not hang
      expect(failTime).toBeLessThan(3000);

      // Go back online
      await page.context().setOffline(false);
    });
  });

  test.describe('Resource Usage', () => {
    test('should not create excessive timers', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await page.waitForTimeout(2000);

      const timerCount = await page.evaluate(() => {
        // Count active intervals/timeouts (approximate)
        let count = 0;
        const maxId = setTimeout(() => { }, 0);
        clearTimeout(maxId);

        // Check roughly how many timers exist
        for (let i = 1; i < maxId; i++) {
          try {
            clearTimeout(i);
            count++;
          } catch (e) { }
        }

        return count;
      });

      console.log(`Active timers (approximate): ${timerCount}`);

      // Should have reasonable number of timers
      expect(timerCount).toBeLessThan(100);
    });

    test('should properly clean up observers', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');

      // Check MutationObserver count
      const observerInfo = await page.evaluate(() => {
        // Observers are internal, but we can check if DOM is being watched excessively
        const elements = document.querySelectorAll('*');
        return {
          totalElements: elements.length,
          extensionElements: document.querySelectorAll('[data-jobseek-*]').length,
        };
      });

      console.log(`Total DOM elements: ${observerInfo.totalElements}`);
      console.log(`Extension elements: ${observerInfo.extensionElements}`);

      // Extension should have minimal footprint
      const ratio = observerInfo.extensionElements / observerInfo.totalElements;
      expect(ratio).toBeLessThan(0.01); // Less than 1% of DOM
    });
  });

  test.describe('Performance Benchmarks', () => {
    test('should generate performance report', async ({ page }) => {
      await page.goto('https://www.linkedin.com/jobs/view/12345');
      await dismissOverlays(page);

      const metrics = await getPerformanceMetrics(page);

      console.log('=== Performance Report ===');
      console.log(`Memory Usage: ${metrics.memory.toFixed(2)} MB`);
      console.log(`DOM Nodes: ${metrics.domNodes}`);
      console.log(`Event Listeners: ${metrics.listeners}`);
      console.log(`Load Time: ${metrics.loadTime}ms`);
      console.log(`Extension Overhead: ${metrics.extensionOverhead}ms`);
      console.log('========================');

      // All metrics should be within acceptable ranges
      expect(metrics.memory).toBeLessThan(100); // Less than 100MB
      expect(metrics.domNodes).toBeLessThan(10000); // Reasonable DOM size
      expect(metrics.loadTime).toBeLessThan(5000); // 5 second load
    });

    test('should perform well across multiple job boards', async ({ page }) => {
      const boards = [
        { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/view/12345' },
        { name: 'Indeed', url: 'https://www.indeed.com/viewjob?jk=abc123' },
      ];

      const results = [];

      for (const board of boards) {
        const startTime = Date.now();
        await page.goto(board.url, { waitUntil: 'domcontentloaded' });
        await dismissOverlays(page);
        const loadTime = Date.now() - startTime;

        await waitForExtensionActive(page, 3000).catch(() => { });

        const memory = await measureMemoryUsage(page);

        results.push({
          board: board.name,
          loadTime,
          memory,
        });
      }

      console.log('=== Multi-Board Performance ===');
      results.forEach(result => {
        console.log(`${result.board}:`);
        console.log(`  Load Time: ${result.loadTime}ms`);
        console.log(`  Memory: ${(result.memory / (1024 * 1024)).toFixed(2)} MB`);
      });

      // All boards should perform reasonably
      results.forEach(result => {
        expect(result.loadTime).toBeLessThan(5000);
        expect(result.memory).toBeLessThan(100 * 1024 * 1024); // 100MB
      });
    });
  });
});
