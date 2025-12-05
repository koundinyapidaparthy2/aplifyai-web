/**
 * Global Teardown for Playwright E2E Tests
 * 
 * Runs once after all tests complete:
 * - Cleanup test data
 * - Generate reports
 * - Close resources
 */

const fs = require('fs');
const path = require('path');

module.exports = async function globalTeardown() {
  console.log('\n🧹 Starting Playwright E2E Test Teardown...\n');
  
  // 1. Cleanup temporary test data (optional)
  const testDataDir = path.join(__dirname, 'test-data');
  if (fs.existsSync(testDataDir)) {
    console.log('📁 Test data directory preserved for debugging');
    console.log(`   Location: ${testDataDir}\n`);
  }
  
  // 2. Log test results location
  const reportDir = path.join(__dirname, '../../playwright-report');
  if (fs.existsSync(reportDir)) {
    console.log('📊 Test Report Generated:');
    console.log(`   Location: ${reportDir}/index.html`);
    console.log('   View with: npx playwright show-report\n');
  }
  
  // 3. Log test results JSON
  const resultsPath = path.join(__dirname, '../../playwright-results.json');
  if (fs.existsSync(resultsPath)) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    console.log('📈 Test Statistics:');
    console.log(`   Total Suites: ${results.suites?.length || 0}`);
    console.log(`   Duration: ${(results.stats?.duration / 1000).toFixed(2)}s\n`);
  }
  
  console.log('✅ Global teardown complete!\n');
  console.log('─'.repeat(60));
};
