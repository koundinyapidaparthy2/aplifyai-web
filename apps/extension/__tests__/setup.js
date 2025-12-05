/**
 * Jest Setup for Chrome Extension Tests
 * jobseek-chromeextension/__tests__/setup.js
 */

import '@testing-library/jest-dom';

// Polyfills for TextEncoder/TextDecoder
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      return new Uint8Array([...str].map(c => c.charCodeAt(0)));
    }
  };
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(arr) {
      return String.fromCharCode(...arr);
    }
  };
}

// Mock chrome API globally
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
    getURL: jest.fn((path) => `chrome-extension://mock-extension-id/${path}`),
    id: 'mock-extension-id',
  },
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        if (callback) callback({});
        return Promise.resolve({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      clear: jest.fn((callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      if (callback) callback([]);
      return Promise.resolve([]);
    }),
    sendMessage: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
  notifications: {
    create: jest.fn((id, options, callback) => {
      if (callback) callback(id);
      return Promise.resolve(id);
    }),
    clear: jest.fn(),
    getAll: jest.fn(),
  },
  alarms: {
    create: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    onAlarm: {
      addListener: jest.fn(),
    },
  },
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },
  windows: {
    create: jest.fn(),
    get: jest.fn(),
    getCurrent: jest.fn(),
    getAll: jest.fn(),
  },
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

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
    text: async () => '',
    status: 200,
  })
);

// Suppress console errors in tests unless debugging
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    // Still show errors that aren't React warnings
    if (
      typeof args[0] === 'string' &&
      !args[0].includes('Warning:') &&
      !args[0].includes('Not implemented:')
    ) {
      originalError.call(console, ...args);
    }
  });
});

afterAll(() => {
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});
