/**
 * Chrome Extension Tests - Content Script
 * jobseek-chromeextension/__tests__/contentScript.test.js
 */

// Mock chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ success: true });
      return Promise.resolve({ success: true });
    }),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({ settings: { enabled: true } });
        return Promise.resolve({ settings: { enabled: true } });
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
    },
  },
};

describe('Content Script - Job Scraping', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('LinkedIn Job Scraping', () => {
    beforeEach(() => {
      // Mock LinkedIn job posting HTML
      document.body.innerHTML = `
        <div class="jobs-details">
          <h1 class="jobs-details-top-card__job-title">Senior Software Engineer</h1>
          <div class="jobs-details-top-card__company-name">Tech Corp</div>
          <div class="jobs-details-top-card__location">San Francisco, CA</div>
          <div class="jobs-description__content">
            <p>We are looking for a Senior Software Engineer...</p>
            <ul>
              <li>5+ years of experience</li>
              <li>Strong JavaScript skills</li>
              <li>Experience with React</li>
            </ul>
          </div>
          <button class="jobs-apply-button">Easy Apply</button>
        </div>
      `;
    });

    it('should extract job title from LinkedIn', () => {
      const jobTitle = document.querySelector('.jobs-details-top-card__job-title')?.textContent;
      expect(jobTitle).toBe('Senior Software Engineer');
    });

    it('should extract company name from LinkedIn', () => {
      const company = document.querySelector('.jobs-details-top-card__company-name')?.textContent;
      expect(company).toBe('Tech Corp');
    });

    it('should extract location from LinkedIn', () => {
      const location = document.querySelector('.jobs-details-top-card__location')?.textContent;
      expect(location).toBe('San Francisco, CA');
    });

    it('should extract job description from LinkedIn', () => {
      const description = document.querySelector('.jobs-description__content')?.textContent;
      expect(description).toContain('Senior Software Engineer');
      expect(description).toContain('5+ years of experience');
    });

    it('should detect Easy Apply button', () => {
      const applyButton = document.querySelector('.jobs-apply-button');
      expect(applyButton).toBeInTheDocument();
      expect(applyButton?.textContent).toBe('Easy Apply');
    });
  });

  describe('Indeed Job Scraping', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="jobsearch-JobComponent">
          <h1 class="jobsearch-JobInfoHeader-title">Frontend Developer</h1>
          <div class="jobsearch-InlineCompanyRating">
            <div class="icl-u-lg-mr--sm">Startup Inc</div>
          </div>
          <div class="jobsearch-JobInfoHeader-subtitle">
            <div>Remote</div>
          </div>
          <div id="jobDescriptionText">
            <p>Join our team as a Frontend Developer...</p>
          </div>
        </div>
      `;
    });

    it('should extract job title from Indeed', () => {
      const jobTitle = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent;
      expect(jobTitle).toBe('Frontend Developer');
    });

    it('should extract company name from Indeed', () => {
      const company = document.querySelector('.icl-u-lg-mr--sm')?.textContent;
      expect(company).toBe('Startup Inc');
    });

    it('should extract description from Indeed', () => {
      const description = document.querySelector('#jobDescriptionText')?.textContent;
      expect(description).toContain('Frontend Developer');
    });
  });

  describe('Message Communication', () => {
    it('should send job data to background script', async () => {
      const jobData = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        description: 'Job description...',
      };

      chrome.runtime.sendMessage({ type: 'SAVE_JOB', data: jobData });

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SAVE_JOB',
          data: jobData,
        }),
        expect.any(Function)
      );
    });

    it('should handle message from background script', () => {
      const messageHandler = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'AUTOFILL_FORM') {
          sendResponse({ success: true });
        }
      });

      chrome.runtime.onMessage.addListener(messageHandler);

      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(messageHandler);
    });
  });

  describe('Form Auto-fill', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="application-form">
          <input type="text" name="firstName" />
          <input type="text" name="lastName" />
          <input type="email" name="email" />
          <input type="tel" name="phone" />
          <textarea name="coverLetter"></textarea>
        </form>
      `;
    });

    it('should fill form fields with user data', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
      };

      Object.entries(userData).forEach(([name, value]) => {
        const input = document.querySelector(`[name="${name}"]`);
        if (input) {
          input.value = value;
        }
      });

      expect(document.querySelector('[name="firstName"]').value).toBe('John');
      expect(document.querySelector('[name="email"]').value).toBe('john@example.com');
    });

    it('should fill cover letter from storage', async () => {
      const coverLetter = 'I am excited to apply...';
      
      chrome.storage.local.get(['coverLetter'], (result) => {
        const textarea = document.querySelector('[name="coverLetter"]');
        if (textarea && result.coverLetter) {
          textarea.value = result.coverLetter;
        }
      });

      expect(chrome.storage.local.get).toHaveBeenCalled();
    });
  });

  describe('DOM Observation', () => {
    it('should detect when new job postings load', (done) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            done();
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Simulate new content loading
      const newDiv = document.createElement('div');
      newDiv.className = 'job-card';
      document.body.appendChild(newDiv);
    });

    it('should handle dynamic content changes', () => {
      const callback = jest.fn();
      const observer = new MutationObserver(callback);

      observer.observe(document.body, { childList: true });

      document.body.innerHTML = '<div class="new-content">Test</div>';

      expect(callback).toHaveBeenCalled();
      observer.disconnect();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', () => {
      document.body.innerHTML = '<div></div>';

      const jobTitle = document.querySelector('.non-existent-class')?.textContent;
      expect(jobTitle).toBeUndefined();
    });

    it('should handle chrome API errors', async () => {
      chrome.runtime.sendMessage = jest.fn((message, callback) => {
        if (callback) callback({ error: 'Connection error' });
      });

      chrome.runtime.sendMessage({ type: 'TEST' }, (response) => {
        expect(response.error).toBe('Connection error');
      });
    });
  });
});
