/**
 * Jest Configuration for Chrome Extension Testing
 * 
 * Configured for:
 * - Chrome extension environment
 * - jsdom for DOM testing
 * - Chrome API mocking
 * - ES modules support
 * - Coverage reporting
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Module name mapping for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@public/(.*)$': '<rootDir>/public/$1',
    '^@ai-answer/(.*)$': '<rootDir>/ai-answer/$1',
    '^@autofill/(.*)$': '<rootDir>/autofill/$1',
    '^@detectors/(.*)$': '<rootDir>/public/detectors/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/test/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ]
    }],
  },
  
  // Test file patterns (only test/ directory, not src/__tests__)
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/test/**/*.test.jsx',
  ],
  
  // Ignore patterns - exclude Vitest tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '<rootDir>/src/__tests__/',  // Exclude Vitest tests
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'public/**/*.js',
    'ai-answer/**/*.js',
    'autofill/**/*.js',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/main.jsx',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Globals
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset mocks between tests
  resetMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Maximum worker threads
  maxWorkers: '50%',
  
  // Test timeout (30 seconds)
  testTimeout: 30000,
};
