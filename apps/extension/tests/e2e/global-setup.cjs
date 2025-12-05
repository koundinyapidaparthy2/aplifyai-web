/**
 * Global Setup for Playwright E2E Tests
 * 
 * Runs once before all tests:
 * - Build extension
 * - Setup test data
 * - Verify environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async function globalSetup() {
  console.log('\n🚀 Starting Playwright E2E Test Setup...\n');
  
  // 1. Verify extension build exists
  const extensionPath = path.join(__dirname, '../../dist');
  
  if (!fs.existsSync(extensionPath)) {
    console.log('📦 Extension build not found. Building extension...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Extension built successfully!\n');
    } catch (error) {
      console.error('❌ Failed to build extension:', error.message);
      throw error;
    }
  } else {
    console.log('✅ Extension build found at:', extensionPath, '\n');
  }
  
  // 2. Verify manifest.json exists
  const manifestPath = path.join(extensionPath, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found in build directory');
    throw new Error('Extension manifest.json not found');
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('📋 Extension Info:');
  console.log(`   Name: ${manifest.name}`);
  console.log(`   Version: ${manifest.version}`);
  console.log(`   Manifest Version: ${manifest.manifest_version}\n`);
  
  // 3. Setup test environment variables
  process.env.TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
  process.env.TEST_USER_FIRST_NAME = process.env.TEST_USER_FIRST_NAME || 'John';
  process.env.TEST_USER_LAST_NAME = process.env.TEST_USER_LAST_NAME || 'Doe';
  
  console.log('🔧 Test Environment:');
  console.log(`   Test User: ${process.env.TEST_USER_FIRST_NAME} ${process.env.TEST_USER_LAST_NAME}`);
  console.log(`   Test Email: ${process.env.TEST_USER_EMAIL}\n`);
  
  // 4. Create test data directory
  const testDataDir = path.join(__dirname, 'test-data');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
    console.log('📁 Created test-data directory\n');
  }
  
  // 5. Create mock resume file if needed
  const mockResumePath = path.join(testDataDir, 'test-resume.pdf');
  if (!fs.existsSync(mockResumePath)) {
    // Create a simple PDF placeholder (in real scenario, use actual PDF)
    fs.writeFileSync(mockResumePath, '%PDF-1.4\n%Mock Resume for Testing\n');
    console.log('📄 Created mock resume file\n');
  }
  
  console.log('✅ Global setup complete!\n');
  console.log('─'.repeat(60));
};
