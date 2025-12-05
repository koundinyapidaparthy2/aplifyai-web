const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

// Extension path - adjust based on your build output
const extensionPath = path.join(__dirname, 'dist'); // Or 'build' if using different output

/**
 * Playwright Configuration for Chrome Extension E2E Testing
 * 
 * Features:
 * - Chrome extension loading
 * - Real job board testing
 * - Screenshot/video capture on failure
 * - Parallel execution
 * - Retry on failure
 */

module.exports = defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Test execution settings
  fullyParallel: false, // Extension tests may interfere with each other
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry failed tests
  workers: process.env.CI ? 1 : 2, // Limit workers to avoid conflicts

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for the tests
    baseURL: 'https://www.linkedin.com', // Can be overridden in tests

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Browser context options
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 15 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Test projects - Chrome with Extension
  projects: [
    {
      name: 'chrome-extension',
      use: {
        ...devices['Desktop Chrome'],

        // Chrome-specific options for extension loading
        channel: 'chrome',

        // Launch options to load extension
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },

        // Permissions
        permissions: ['clipboard-read', 'clipboard-write'],

        // Context options
        contextOptions: {
          // Grant all permissions to the extension
          permissions: ['notifications', 'geolocation'],
        },
      },
    },

    // Optional: Test without extension for comparison
    {
      name: 'chrome-no-extension',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],

  // Web server configuration (if needed for local testing)
  webServer: process.env.START_SERVER ? {
    command: 'npm run start',
    port: 5173,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  } : undefined,

  // Output directory
  outputDir: 'test-results/',

  // Global setup/teardown
  globalSetup: require.resolve('./tests/e2e/global-setup.cjs'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.cjs'),
});
