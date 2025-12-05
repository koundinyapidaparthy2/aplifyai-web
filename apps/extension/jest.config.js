/**
 * Jest Configuration for Chrome Extension
 * jobseek-chromeextension/jest.config.js
 */

export default {
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Module name mapping
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__tests__/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
  },

  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js',
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'public/**/*.js',
    '!src/**/*.d.ts',
    '!src/main.jsx',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
