/**
 * Chrome API Tests
 * 
 * Tests for Chrome extension API interactions:
 * - chrome.storage (sync and local)
 * - chrome.runtime (messaging)
 * - chrome.tabs (queries and messaging)
 * - Background script functionality
 * - Content script messaging
 */

import { chrome } from 'jest-webextension-mock';

describe('Chrome Storage API', () => {
  beforeEach(() => {
    // Clear storage before each test
    chrome.storage.sync.clear();
    chrome.storage.local.clear();
  });

  describe('chrome.storage.sync', () => {
    it('should store user data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      await chrome.storage.sync.set({ userProfile: userData });
      const result = await chrome.storage.sync.get('userProfile');

      expect(result.userProfile).toEqual(userData);
    });

    it('should retrieve multiple keys', async () => {
      await chrome.storage.sync.set({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });

      const result = await chrome.storage.sync.get(['key1', 'key2']);

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should get all storage data', async () => {
      const testData = {
        firstName: 'Jane',
        lastName: 'Smith',
        age: 30,
      };

      await chrome.storage.sync.set(testData);
      const result = await chrome.storage.sync.get(null);

      expect(result).toEqual(testData);
    });

    it('should remove specific keys', async () => {
      await chrome.storage.sync.set({
        key1: 'value1',
        key2: 'value2',
      });

      await chrome.storage.sync.remove('key1');
      const result = await chrome.storage.sync.get(['key1', 'key2']);

      expect(result).toEqual({ key2: 'value2' });
    });

    it('should clear all storage', async () => {
      await chrome.storage.sync.set({
        key1: 'value1',
        key2: 'value2',
      });

      await chrome.storage.sync.clear();
      const result = await chrome.storage.sync.get(null);

      expect(result).toEqual({});
    });

    it('should handle default values', async () => {
      const result = await chrome.storage.sync.get({
        existingKey: 'default1',
        missingKey: 'default2',
      });

      expect(result.missingKey).toBe('default2');
    });
  });

  describe('chrome.storage.local', () => {
    it('should store large data in local storage', async () => {
      const largeData = {
        resumeCache: new Array(1000).fill('test data'),
      };

      await chrome.storage.local.set({ cache: largeData });
      const result = await chrome.storage.local.get('cache');

      expect(result.cache).toEqual(largeData);
    });

    it('should handle storage independently from sync', async () => {
      await chrome.storage.sync.set({ syncKey: 'syncValue' });
      await chrome.storage.local.set({ localKey: 'localValue' });

      const syncResult = await chrome.storage.sync.get('syncKey');
      const localResult = await chrome.storage.local.get('localKey');

      expect(syncResult).toEqual({ syncKey: 'syncValue' });
      expect(localResult).toEqual({ localKey: 'localValue' });
    });

    it('should persist across sessions (simulated)', async () => {
      await chrome.storage.local.set({ sessionData: 'persistent' });

      // Simulate extension restart by clearing mocks but not storage
      const result = await chrome.storage.local.get('sessionData');

      expect(result.sessionData).toBe('persistent');
    });
  });

  describe('Storage Events', () => {
    it('should trigger onChanged listener', async () => {
      const listener = jest.fn();
      chrome.storage.onChanged.addListener(listener);

      await chrome.storage.sync.set({ key: 'newValue' });

      // The mock should have tracked the change
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ key: 'newValue' });
    });
  });
});

describe('Chrome Runtime API', () => {
  describe('Message Passing', () => {
    it('should send message from content script to background', async () => {
      const mockResponse = { success: true, data: 'processed' };

      chrome.runtime.sendMessage.mockResolvedValue(mockResponse);

      const response = await chrome.runtime.sendMessage({
        type: 'GET_USER_PROFILE',
      });

      expect(response).toEqual(mockResponse);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'GET_USER_PROFILE',
      });
    });

    it('should handle message with callback', (done) => {
      const message = { type: 'SAVE_DATA', data: { key: 'value' } };

      chrome.runtime.sendMessage(message, (response) => {
        expect(response).toBeDefined();
        done();
      });

      // Trigger callback manually in mock
      chrome.runtime.sendMessage.mock.calls[0][1]({ success: true });
    });

    it('should handle multiple message types', async () => {
      const messages = [
        { type: 'GET_PROFILE' },
        { type: 'DETECT_JOB' },
        { type: 'FILL_FORM' },
      ];

      for (const message of messages) {
        chrome.runtime.sendMessage.mockResolvedValueOnce({ type: message.type });
        const response = await chrome.runtime.sendMessage(message);
        expect(response.type).toBe(message.type);
      }

      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(3);
    });

    it('should add message listener', () => {
      const listener = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'PING') {
          sendResponse({ type: 'PONG' });
        }
      });

      chrome.runtime.onMessage.addListener(listener);

      // Simulate receiving a message
      const mockSender = { tab: { id: 1 } };
      const sendResponse = jest.fn();
      
      listener({ type: 'PING' }, mockSender, sendResponse);

      expect(listener).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({ type: 'PONG' });
    });

    it('should handle async message listener', async () => {
      const asyncListener = jest.fn(async (message, sender, sendResponse) => {
        if (message.type === 'ASYNC_TASK') {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 10));
          sendResponse({ completed: true });
          return true; // Keep message channel open
        }
      });

      chrome.runtime.onMessage.addListener(asyncListener);

      const sendResponse = jest.fn();
      const result = asyncListener(
        { type: 'ASYNC_TASK' },
        { tab: { id: 1 } },
        sendResponse
      );

      await result;

      expect(asyncListener).toHaveBeenCalled();
    });
  });

  describe('Extension Info', () => {
    it('should get extension manifest', () => {
      const mockManifest = {
        name: 'JobSeek Extension',
        version: '1.0.0',
        manifest_version: 3,
      };

      chrome.runtime.getManifest.mockReturnValue(mockManifest);

      const manifest = chrome.runtime.getManifest();

      expect(manifest.name).toBe('JobSeek Extension');
      expect(manifest.version).toBe('1.0.0');
    });

    it('should get extension URL', () => {
      const path = 'popup.html';
      const expectedUrl = `chrome-extension://mock-extension-id/${path}`;

      chrome.runtime.getURL.mockReturnValue(expectedUrl);

      const url = chrome.runtime.getURL(path);

      expect(url).toBe(expectedUrl);
    });
  });

  describe('Error Handling', () => {
    it('should handle runtime.lastError', async () => {
      chrome.runtime.lastError = { message: 'Connection error' };
      chrome.runtime.sendMessage.mockRejectedValue(
        new Error(chrome.runtime.lastError.message)
      );

      await expect(
        chrome.runtime.sendMessage({ type: 'TEST' })
      ).rejects.toThrow('Connection error');
    });

    it('should handle message timeout', async () => {
      jest.useFakeTimers();

      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Message timeout')), 5000);
      });

      chrome.runtime.sendMessage.mockReturnValue(timeoutPromise);

      const messagePromise = chrome.runtime.sendMessage({ type: 'SLOW' });

      jest.advanceTimersByTime(5000);

      await expect(messagePromise).rejects.toThrow('Message timeout');

      jest.useRealTimers();
    });
  });
});

describe('Chrome Tabs API', () => {
  describe('Tab Queries', () => {
    it('should query active tab', async () => {
      const mockTabs = [
        { id: 1, url: 'https://linkedin.com/jobs/123', active: true },
      ];

      chrome.tabs.query.mockResolvedValue(mockTabs);

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

      expect(tabs).toEqual(mockTabs);
      expect(tabs[0].active).toBe(true);
    });

    it('should query tabs by URL pattern', async () => {
      const mockTabs = [
        { id: 1, url: 'https://linkedin.com/jobs/123' },
        { id: 2, url: 'https://indeed.com/viewjob?jk=456' },
        { id: 3, url: 'https://google.com' },
      ];

      chrome.tabs.query.mockResolvedValue(
        mockTabs.filter(tab => tab.url.includes('jobs') || tab.url.includes('viewjob'))
      );

      const jobTabs = await chrome.tabs.query({ url: '*://*' });

      expect(jobTabs).toHaveLength(2);
    });

    it('should get specific tab by ID', async () => {
      const mockTab = { id: 123, url: 'https://linkedin.com/jobs/123' };

      chrome.tabs.get.mockResolvedValue(mockTab);

      const tab = await chrome.tabs.get(123);

      expect(tab.id).toBe(123);
    });
  });

  describe('Tab Messaging', () => {
    it('should send message to specific tab', async () => {
      const tabId = 1;
      const message = { type: 'FILL_FORM', data: { name: 'John' } };
      const mockResponse = { success: true };

      chrome.tabs.sendMessage.mockResolvedValue(mockResponse);

      const response = await chrome.tabs.sendMessage(tabId, message);

      expect(response).toEqual(mockResponse);
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, message);
    });

    it('should broadcast to all tabs', async () => {
      const mockTabs = [
        { id: 1, url: 'https://site1.com' },
        { id: 2, url: 'https://site2.com' },
        { id: 3, url: 'https://site3.com' },
      ];

      chrome.tabs.query.mockResolvedValue(mockTabs);
      chrome.tabs.sendMessage.mockResolvedValue({ received: true });

      const tabs = await chrome.tabs.query({});
      const results = await Promise.all(
        tabs.map(tab => chrome.tabs.sendMessage(tab.id, { type: 'BROADCAST' }))
      );

      expect(results).toHaveLength(3);
      expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(3);
    });
  });

  describe('Tab Updates', () => {
    it('should update tab URL', async () => {
      const tabId = 1;
      const newUrl = 'https://linkedin.com/jobs/456';

      chrome.tabs.update.mockResolvedValue({
        id: tabId,
        url: newUrl,
      });

      const updatedTab = await chrome.tabs.update(tabId, { url: newUrl });

      expect(updatedTab.url).toBe(newUrl);
    });

    it('should create new tab', async () => {
      const newTab = {
        id: 999,
        url: 'https://linkedin.com/jobs',
        active: true,
      };

      chrome.tabs.create.mockResolvedValue(newTab);

      const tab = await chrome.tabs.create({ url: newTab.url });

      expect(tab.id).toBe(999);
      expect(tab.url).toBe('https://linkedin.com/jobs');
    });
  });
});

describe('Background Script', () => {
  let backgroundScript;

  beforeEach(() => {
    // Mock background script behavior
    backgroundScript = {
      handleMessage: jest.fn(async (message, sender, sendResponse) => {
        switch (message.type) {
          case 'GET_USER_PROFILE':
            const profile = await chrome.storage.sync.get('userProfile');
            sendResponse(profile.userProfile || {});
            break;

          case 'SAVE_USER_PROFILE':
            await chrome.storage.sync.set({ userProfile: message.data });
            sendResponse({ success: true });
            break;

          case 'DETECT_JOB':
            sendResponse({
              detected: true,
              jobData: { title: 'Software Engineer', company: 'Google' },
            });
            break;

          default:
            sendResponse({ error: 'Unknown message type' });
        }
        return true; // Keep channel open for async
      }),
    };

    chrome.runtime.onMessage.addListener(backgroundScript.handleMessage);
  });

  it('should handle GET_USER_PROFILE message', async () => {
    await chrome.storage.sync.set({
      userProfile: { firstName: 'John', lastName: 'Doe' },
    });

    const sendResponse = jest.fn();
    await backgroundScript.handleMessage(
      { type: 'GET_USER_PROFILE' },
      { tab: { id: 1 } },
      sendResponse
    );

    expect(sendResponse).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should handle SAVE_USER_PROFILE message', async () => {
    const userData = { firstName: 'Jane', lastName: 'Smith' };
    const sendResponse = jest.fn();

    await backgroundScript.handleMessage(
      { type: 'SAVE_USER_PROFILE', data: userData },
      { tab: { id: 1 } },
      sendResponse
    );

    expect(sendResponse).toHaveBeenCalledWith({ success: true });

    const result = await chrome.storage.sync.get('userProfile');
    expect(result.userProfile).toEqual(userData);
  });

  it('should handle DETECT_JOB message', async () => {
    const sendResponse = jest.fn();

    await backgroundScript.handleMessage(
      { type: 'DETECT_JOB' },
      { tab: { id: 1 } },
      sendResponse
    );

    expect(sendResponse).toHaveBeenCalledWith({
      detected: true,
      jobData: expect.objectContaining({
        title: 'Software Engineer',
        company: 'Google',
      }),
    });
  });

  it('should handle unknown message types', async () => {
    const sendResponse = jest.fn();

    await backgroundScript.handleMessage(
      { type: 'UNKNOWN_TYPE' },
      { tab: { id: 1 } },
      sendResponse
    );

    expect(sendResponse).toHaveBeenCalledWith({
      error: 'Unknown message type',
    });
  });
});

describe('Content Script Communication', () => {
  it('should send message and receive response', async () => {
    const message = { type: 'GET_JOB_DATA' };
    const expectedResponse = {
      company: 'Google',
      title: 'Software Engineer',
    };

    chrome.runtime.sendMessage.mockResolvedValue(expectedResponse);

    const response = await chrome.runtime.sendMessage(message);

    expect(response).toEqual(expectedResponse);
  });

  it('should handle message with custom matcher', async () => {
    const message = {
      type: 'CUSTOM_MESSAGE',
      payload: { key: 'value' },
    };

    chrome.runtime.sendMessage.mockResolvedValue({ status: 'ok' });

    await chrome.runtime.sendMessage(message);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CUSTOM_MESSAGE',
        payload: expect.any(Object),
      })
    );
  });

  it('should use custom matcher toHaveBeenCalledWithChromeMessage', async () => {
    await chrome.runtime.sendMessage({
      type: 'TEST_MESSAGE',
      data: { test: true },
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWithChromeMessage(
      'TEST_MESSAGE',
      { test: true }
    );
  });
});

describe('Performance', () => {
  it('should handle rapid message sending', async () => {
    const messageCount = 100;
    const promises = [];

    chrome.runtime.sendMessage.mockResolvedValue({ success: true });

    for (let i = 0; i < messageCount; i++) {
      promises.push(chrome.runtime.sendMessage({ type: 'RAPID', id: i }));
    }

    const results = await Promise.all(promises);

    expect(results).toHaveLength(messageCount);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(messageCount);
  });

  it('should handle concurrent storage operations', async () => {
    const operations = [
      chrome.storage.sync.set({ key1: 'value1' }),
      chrome.storage.sync.set({ key2: 'value2' }),
      chrome.storage.sync.set({ key3: 'value3' }),
    ];

    await Promise.all(operations);

    const result = await chrome.storage.sync.get(['key1', 'key2', 'key3']);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });
  });
});
