/**
 * Jest Test Setup
 * 
 * - Mocks Chrome APIs
 * - Sets up testing library
 * - Configures DOM environment
 * - Adds custom matchers
 */

import '@testing-library/jest-dom';
import { chrome } from 'jest-webextension-mock';

// Make chrome global
global.chrome = chrome;

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock DataTransfer for file upload tests
global.DataTransfer = class DataTransfer {
  constructor() {
    this.items = {
      _files: [],
      add: function(file) {
        this._files.push(file);
      }
    };
  }
  
  get files() {
    return this.items._files;
  }
};

// Cleanup - clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  if (chrome && chrome.runtime && chrome.runtime.sendMessage && chrome.runtime.sendMessage.mockClear) {
    chrome.runtime.sendMessage.mockClear();
  }
  if (chrome && chrome.storage && chrome.storage.local) {
    if (chrome.storage.local.get && chrome.storage.local.get.mockClear) chrome.storage.local.get.mockClear();
    if (chrome.storage.local.set && chrome.storage.local.set.mockClear) chrome.storage.local.set.mockClear();
  }
  if (chrome && chrome.tabs && chrome.tabs.sendMessage && chrome.tabs.sendMessage.mockClear) {
    chrome.tabs.sendMessage.mockClear();
  }
});

// Add custom matchers
expect.extend({
  toBeValidJobData(received) {
    const requiredFields = ['company', 'title'];
    const missingFields = requiredFields.filter(field => !received[field]);
    
    const pass = missingFields.length === 0;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be valid job data`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be valid job data but missing fields: ${missingFields.join(', ')}`,
        pass: false,
      };
    }
  },
  
  toHaveBeenCalledWithChromeMessage(received, action, data = null) {
    const calls = received.mock.calls;
    const matchingCall = calls.find(call => {
      const message = call[call.length - 1];
      if (data) {
        return message.action === action && JSON.stringify(message.data) === JSON.stringify(data);
      }
      return message.action === action;
    });
    
    const pass = !!matchingCall;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have been called with action "${action}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have been called with action "${action}"`,
        pass: false,
      };
    }
  },
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Helper function to wait for async operations
global.waitForAsync = () => new Promise(resolve => setImmediate(resolve));
