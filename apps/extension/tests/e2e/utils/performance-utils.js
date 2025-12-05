/**
 * Performance Monitoring Utilities
 * Helper functions for measuring memory, CPU, network, and load times
 */

/**
 * Measure current memory usage in bytes
 * @param {Page} page - Playwright page object
 * @returns {Promise<number>} Memory usage in bytes
 */
async function measureMemoryUsage(page) {
  return await page.evaluate(() => {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    // Fallback if memory API not available
    return 0;
  });
}

/**
 * Measure page load time
 * @param {Page} page - Playwright page object
 * @returns {Promise<object>} Load time metrics
 */
async function measurePageLoadTime(page) {
  return await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    if (!perfData) {
      return {
        total: 0,
        domContentLoaded: 0,
        domInteractive: 0,
        loadComplete: 0,
      };
    }

    return {
      total: perfData.loadEventEnd - perfData.fetchStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
      domInteractive: perfData.domInteractive - perfData.fetchStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      request: perfData.responseStart - perfData.requestStart,
      response: perfData.responseEnd - perfData.responseStart,
    };
  });
}

/**
 * Measure CPU usage over a time period
 * @param {Page} page - Playwright page object
 * @param {number} duration - Duration to measure in ms
 * @returns {Promise<object>} CPU metrics
 */
async function measureCPUUsage(page, duration = 1000) {
  return await page.evaluate((dur) => {
    return new Promise((resolve) => {
      const start = performance.now();
      let taskCount = 0;
      let totalTaskTime = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          taskCount++;
          totalTaskTime += entry.duration;
        }
      });

      // Observe long tasks
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API may not be supported
      }

      setTimeout(() => {
        observer.disconnect();
        const end = performance.now();
        const elapsed = end - start;

        resolve({
          taskCount,
          totalTaskTime,
          avgTaskTime: taskCount > 0 ? totalTaskTime / taskCount : 0,
          cpuUtilization: (totalTaskTime / elapsed) * 100,
        });
      }, dur);
    });
  }, duration);
}

/**
 * Monitor network performance
 * @param {Page} page - Playwright page object
 * @returns {Promise<object>} Network metrics
 */
async function monitorNetworkPerformance(page) {
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource');

    let totalSize = 0;
    let totalDuration = 0;
    const resourceTypes = {};
    const slowResources = [];

    entries.forEach(entry => {
      // Calculate size if available
      const size = entry.transferSize || entry.encodedBodySize || 0;
      totalSize += size;
      totalDuration += entry.duration;

      // Count by type
      const type = entry.initiatorType || 'other';
      resourceTypes[type] = (resourceTypes[type] || 0) + 1;

      // Track slow resources (> 1 second)
      if (entry.duration > 1000) {
        slowResources.push({
          name: entry.name,
          duration: entry.duration,
          size: size,
        });
      }
    });

    return {
      totalRequests: entries.length,
      totalSize: totalSize,
      totalDuration: totalDuration,
      avgDuration: entries.length > 0 ? totalDuration / entries.length : 0,
      resourceTypes: resourceTypes,
      slowResources: slowResources,
    };
  });

  return resources;
}

/**
 * Measure extension overhead compared to baseline
 * @param {Page} page - Playwright page object
 * @returns {Promise<number>} Overhead in milliseconds
 */
async function measureExtensionOverhead(page) {
  const metrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    if (!perfData) return 0;

    // Estimate extension overhead by looking at script execution time
    const scripts = performance.getEntriesByType('resource').filter(
      entry => entry.initiatorType === 'script'
    );

    const extensionScripts = scripts.filter(
      entry => entry.name.includes('chrome-extension://') ||
        entry.name.includes('jobseek')
    );

    const extensionTime = extensionScripts.reduce(
      (sum, script) => sum + script.duration, 0
    );

    return extensionTime;
  });

  return metrics;
}

/**
 * Get comprehensive performance metrics
 * @param {Page} page - Playwright page object
 * @returns {Promise<object>} All performance metrics
 */
async function getPerformanceMetrics(page) {
  const memory = await measureMemoryUsage(page);
  const loadTime = await measurePageLoadTime(page);
  const network = await monitorNetworkPerformance(page);
  const extensionOverhead = await measureExtensionOverhead(page);

  // Get DOM metrics
  const domMetrics = await page.evaluate(() => {
    return {
      domNodes: document.getElementsByTagName('*').length,
      listeners: window.getEventListeners ?
        Object.keys(window.getEventListeners(document)).length : 0,
      extensionNodes: document.querySelectorAll('[data-jobseek-*]').length,
    };
  });

  return {
    memory: memory / (1024 * 1024), // Convert to MB
    loadTime: loadTime.total,
    domContentLoaded: loadTime.domContentLoaded,
    domInteractive: loadTime.domInteractive,
    domNodes: domMetrics.domNodes,
    listeners: domMetrics.listeners,
    extensionNodes: domMetrics.extensionNodes,
    networkRequests: network.totalRequests,
    networkSize: network.totalSize / 1024, // KB
    networkDuration: network.totalDuration,
    slowResources: network.slowResources.length,
    extensionOverhead: extensionOverhead,
  };
}

/**
 * Track memory over time
 * @param {Page} page - Playwright page object
 * @param {number} duration - Duration to track in ms
 * @param {number} interval - Sampling interval in ms
 * @returns {Promise<Array>} Array of memory samples
 */
async function trackMemoryOverTime(page, duration = 10000, interval = 1000) {
  const samples = [];
  const startTime = Date.now();

  while (Date.now() - startTime < duration) {
    const memory = await measureMemoryUsage(page);
    samples.push({
      timestamp: Date.now() - startTime,
      memory: memory,
    });
    await page.waitForTimeout(interval);
  }

  return samples;
}

/**
 * Analyze memory leak from samples
 * @param {Array} samples - Memory samples from trackMemoryOverTime
 * @returns {object} Leak analysis
 */
function analyzeMemoryLeak(samples) {
  if (samples.length < 2) {
    return { hasLeak: false, growth: 0 };
  }

  const first = samples[0].memory;
  const last = samples[samples.length - 1].memory;
  const growth = last - first;
  const growthRate = growth / samples.length;

  // Calculate trend
  let increasingCount = 0;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].memory > samples[i - 1].memory) {
      increasingCount++;
    }
  }

  const increasingPercent = (increasingCount / (samples.length - 1)) * 100;

  return {
    hasLeak: increasingPercent > 70 && growthRate > 100000, // Growing >70% of time and >100KB/sample
    growth: growth,
    growthRate: growthRate,
    increasingPercent: increasingPercent,
    samples: samples.length,
  };
}

/**
 * Measure First Contentful Paint
 * @param {Page} page - Playwright page object
 * @returns {Promise<number>} FCP time in ms
 */
async function measureFCP(page) {
  return await page.evaluate(() => {
    const perfEntries = performance.getEntriesByType('paint');
    const fcpEntry = perfEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : null;
  });
}

/**
 * Measure Largest Contentful Paint
 * @param {Page} page - Playwright page object
 * @returns {Promise<number>} LCP time in ms
 */
async function measureLCP(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      let lcp = null;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcp = lastEntry.startTime;
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        resolve(null);
        return;
      }

      // Wait for LCP to stabilize
      setTimeout(() => {
        observer.disconnect();
        resolve(lcp);
      }, 5000);
    });
  });
}

/**
 * Measure Time to Interactive
 * @param {Page} page - Playwright page object
 * @returns {Promise<number>} TTI time in ms
 */
async function measureTTI(page) {
  return await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    if (!perfData) return null;

    // TTI is approximately when DOM is interactive and no long tasks
    return perfData.domInteractive - perfData.fetchStart;
  });
}

/**
 * Create performance report
 * @param {Page} page - Playwright page object
 * @returns {Promise<object>} Detailed performance report
 */
async function createPerformanceReport(page) {
  const metrics = await getPerformanceMetrics(page);
  const fcp = await measureFCP(page);
  const tti = await measureTTI(page);

  return {
    timestamp: new Date().toISOString(),
    url: page.url(),
    metrics: metrics,
    coreWebVitals: {
      fcp: fcp,
      tti: tti,
    },
    recommendations: generateRecommendations(metrics),
  };
}

/**
 * Generate performance recommendations
 * @param {object} metrics - Performance metrics
 * @returns {Array<string>} Recommendations
 */
function generateRecommendations(metrics) {
  const recommendations = [];

  if (metrics.memory > 100) {
    recommendations.push('High memory usage detected. Check for memory leaks.');
  }

  if (metrics.loadTime > 3000) {
    recommendations.push('Slow page load time. Optimize asset loading.');
  }

  if (metrics.extensionNodes > 50) {
    recommendations.push('Extension adding many DOM nodes. Consider virtualization.');
  }

  if (metrics.slowResources > 5) {
    recommendations.push(`${metrics.slowResources} slow resources detected. Optimize network requests.`);
  }

  if (metrics.extensionOverhead > 500) {
    recommendations.push('Extension overhead is high. Optimize script execution.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance is within acceptable ranges.');
  }

  return recommendations;
}

export {
  measureMemoryUsage,
  measurePageLoadTime,
  measureCPUUsage,
  monitorNetworkPerformance,
  measureExtensionOverhead,
  getPerformanceMetrics,
  trackMemoryOverTime,
  analyzeMemoryLeak,
  measureFCP,
  measureLCP,
  measureTTI,
  createPerformanceReport,
  generateRecommendations,
};
