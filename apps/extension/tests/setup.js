// Jest setup file
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  action: {
    setBadge: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
  tabs: {
    sendMessage: jest.fn(),
    onUpdated: {
      addListener: jest.fn(),
    },
  },
  sidePanel: {
    setOptions: jest.fn(),
    open: jest.fn(),
  },
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
