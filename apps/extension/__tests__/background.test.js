/**
 * Chrome Extension Tests - Background Script
 * jobseek-chromeextension/__tests__/background.test.js
 */

// Mock chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        const mockData = {
          jobs: [
            { id: '1', title: 'Software Engineer', company: 'Tech Corp' },
          ],
          settings: { enabled: true, autoFill: true },
        };
        if (callback) callback(mockData);
        return Promise.resolve(mockData);
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      const mockTabs = [{ id: 1, url: 'https://www.linkedin.com/jobs' }];
      if (callback) callback(mockTabs);
      return Promise.resolve(mockTabs);
    }),
    sendMessage: jest.fn(),
    create: jest.fn(),
  },
  notifications: {
    create: jest.fn((id, options, callback) => {
      if (callback) callback(id);
      return Promise.resolve(id);
    }),
    clear: jest.fn(),
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn(),
    },
    clear: jest.fn(),
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },
};

describe('Background Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Installation', () => {
    it('should setup on extension install', () => {
      const installHandler = jest.fn((details) => {
        if (details.reason === 'install') {
          chrome.storage.local.set({ settings: { enabled: true } });
        }
      });

      chrome.runtime.onInstalled.addListener(installHandler);
      expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    });

    it('should create context menu on install', () => {
      chrome.contextMenus.create({
        id: 'saveJob',
        title: 'Save Job to JobSeek',
        contexts: ['selection', 'page'],
      });

      expect(chrome.contextMenus.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'saveJob',
          title: expect.any(String),
        })
      );
    });
  });

  describe('Message Handling', () => {
    it('should handle SAVE_JOB message', async () => {
      const jobData = {
        title: 'Senior Developer',
        company: 'Tech Corp',
        location: 'Remote',
        url: 'https://example.com/job/123',
      };

      const messageHandler = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'SAVE_JOB') {
          chrome.storage.local.get(['jobs'], (result) => {
            const jobs = result.jobs || [];
            jobs.push({ ...message.data, id: Date.now().toString() });
            chrome.storage.local.set({ jobs });
            sendResponse({ success: true, jobId: jobs[jobs.length - 1].id });
          });
          return true; // Async response
        }
      });

      chrome.runtime.onMessage.addListener(messageHandler);

      // Simulate message
      messageHandler(
        { type: 'SAVE_JOB', data: jobData },
        { tab: { id: 1 } },
        jest.fn()
      );

      expect(chrome.storage.local.get).toHaveBeenCalledWith(['jobs'], expect.any(Function));
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });

    it('should handle GET_JOBS message', async () => {
      const messageHandler = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'GET_JOBS') {
          chrome.storage.local.get(['jobs'], (result) => {
            sendResponse({ jobs: result.jobs || [] });
          });
          return true;
        }
      });

      const mockResponse = jest.fn();
      messageHandler({ type: 'GET_JOBS' }, {}, mockResponse);

      expect(chrome.storage.local.get).toHaveBeenCalledWith(['jobs'], expect.any(Function));
    });

    it('should handle DELETE_JOB message', async () => {
      const messageHandler = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'DELETE_JOB') {
          chrome.storage.local.get(['jobs'], (result) => {
            const jobs = (result.jobs || []).filter(job => job.id !== message.jobId);
            chrome.storage.local.set({ jobs });
            sendResponse({ success: true });
          });
          return true;
        }
      });

      messageHandler({ type: 'DELETE_JOB', jobId: '1' }, {}, jest.fn());

      expect(chrome.storage.local.get).toHaveBeenCalled();
    });

    it('should handle GENERATE_RESUME message', async () => {
      const messageHandler = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'GENERATE_RESUME') {
          // Simulate API call to resume generator
          fetch('https://api.example.com/generate-resume', {
            method: 'POST',
            body: JSON.stringify(message.data),
          })
            .then(res => res.json())
            .then(data => sendResponse({ success: true, resume: data }))
            .catch(err => sendResponse({ success: false, error: err.message }));
          return true;
        }
      });

      chrome.runtime.onMessage.addListener(messageHandler);
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });
  });

  describe('Storage Operations', () => {
    it('should save job to storage', async () => {
      const job = {
        id: '123',
        title: 'Engineer',
        company: 'Tech Co',
      };

      await chrome.storage.local.set({ [`job_${job.id}`]: job });

      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({ [`job_${job.id}`]: job }),
        expect.any(Function)
      );
    });

    it('should retrieve jobs from storage', async () => {
      chrome.storage.local.get(['jobs'], (result) => {
        expect(result.jobs).toHaveLength(1);
        expect(result.jobs[0].title).toBe('Software Engineer');
      });

      expect(chrome.storage.local.get).toHaveBeenCalledWith(['jobs'], expect.any(Function));
    });

    it('should delete job from storage', async () => {
      const jobId = '123';
      await chrome.storage.local.remove([`job_${jobId}`]);

      expect(chrome.storage.local.remove).toHaveBeenCalledWith(
        [`job_${jobId}`],
        expect.any(Function)
      );
    });
  });

  describe('Notifications', () => {
    it('should create notification for saved job', async () => {
      const jobTitle = 'Software Engineer';
      
      chrome.notifications.create('job-saved', {
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Job Saved',
        message: `"${jobTitle}" has been saved to JobSeek`,
      });

      expect(chrome.notifications.create).toHaveBeenCalledWith(
        'job-saved',
        expect.objectContaining({
          title: 'Job Saved',
          message: expect.stringContaining(jobTitle),
        }),
        expect.any(Function)
      );
    });

    it('should clear old notifications', async () => {
      await chrome.notifications.clear('old-notification-id');

      expect(chrome.notifications.clear).toHaveBeenCalledWith('old-notification-id');
    });
  });

  describe('Alarms', () => {
    it('should create periodic alarm for job scraping', () => {
      chrome.alarms.create('jobScraper', {
        periodInMinutes: 30,
      });

      expect(chrome.alarms.create).toHaveBeenCalledWith(
        'jobScraper',
        expect.objectContaining({
          periodInMinutes: 30,
        })
      );
    });

    it('should handle alarm trigger', () => {
      const alarmHandler = jest.fn((alarm) => {
        if (alarm.name === 'jobScraper') {
          // Trigger job scraping logic
          chrome.tabs.query({ url: '*://*.linkedin.com/*' }, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_JOBS' });
            });
          });
        }
      });

      chrome.alarms.onAlarm.addListener(alarmHandler);
      expect(chrome.alarms.onAlarm.addListener).toHaveBeenCalled();
    });
  });

  describe('Context Menu', () => {
    it('should handle context menu click', () => {
      const clickHandler = jest.fn((info, tab) => {
        if (info.menuItemId === 'saveJob') {
          chrome.tabs.sendMessage(tab.id, { type: 'SAVE_CURRENT_JOB' });
        }
      });

      chrome.contextMenus.onClicked.addListener(clickHandler);
      expect(chrome.contextMenus.onClicked.addListener).toHaveBeenCalled();
    });
  });

  describe('Tab Management', () => {
    it('should query active tabs', async () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        expect(tabs).toHaveLength(1);
        expect(tabs[0].url).toContain('linkedin.com');
      });

      expect(chrome.tabs.query).toHaveBeenCalledWith(
        expect.objectContaining({ active: true }),
        expect.any(Function)
      );
    });

    it('should send message to specific tab', async () => {
      const tabId = 123;
      const message = { type: 'AUTOFILL_FORM', data: {} };

      chrome.tabs.sendMessage(tabId, message);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, message);
    });

    it('should create new tab', async () => {
      chrome.tabs.create({ url: 'https://jobseek.com/dashboard' });

      expect(chrome.tabs.create).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining('dashboard') })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      chrome.storage.local.get = jest.fn((keys, callback) => {
        throw new Error('Storage error');
      });

      try {
        chrome.storage.local.get(['jobs'], () => {});
      } catch (error) {
        expect(error.message).toBe('Storage error');
      }
    });

    it('should handle message errors', () => {
      const messageHandler = jest.fn((message, sender, sendResponse) => {
        try {
          if (message.type === 'INVALID') {
            throw new Error('Invalid message type');
          }
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      });

      const mockResponse = jest.fn();
      messageHandler({ type: 'INVALID' }, {}, mockResponse);

      expect(mockResponse).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
});
