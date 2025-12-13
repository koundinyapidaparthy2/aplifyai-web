/**
 * AplifyAI Chrome Extension - Content Script
 * Detects job postings and provides quick actions
 */

// Import detector classes (injected via manifest)
// These are loaded in order: base-detector.js, then specific detectors

class AplifyAIContentScript {
  constructor() {
    this.detectors = [];
    this.currentJob = null;
    this.fabElement = null;
    this.cardElement = null;
    this.isProcessing = false;
    this.autoFillManager = null;
    this.aiAnswerManager = null;

    this.init();
  }

  /**
   * Initialize the content script
   */
  async init() {
    console.log('[AplifyAI] Content script initialized');

    // Initialize detectors
    this.initializeDetectors();

    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  /**
   * Initialize all job board detectors
   */
  initializeDetectors() {
    try {
      // Create instances of all detectors
      if (typeof LinkedInDetector !== 'undefined') {
        this.detectors.push(new LinkedInDetector());
      }
      if (typeof IndeedDetector !== 'undefined') {
        this.detectors.push(new IndeedDetector());
      }
      if (typeof GreenhouseDetector !== 'undefined') {
        this.detectors.push(new GreenhouseDetector());
      }
      if (typeof LeverDetector !== 'undefined') {
        this.detectors.push(new LeverDetector());
      }
      if (typeof WorkdayDetector !== 'undefined') {
        this.detectors.push(new WorkdayDetector());
      }

      console.log(`[AplifyAI] Initialized ${this.detectors.length} detectors`);
    } catch (error) {
      console.error('[AplifyAI] Error initializing detectors:', error);
    }
  }

  /**
   * Start the detection process
   */
  async start() {
    try {
      // Try to detect job from current page
      await this.detectJob();

      // Initialize auto-fill manager
      this.initializeAutoFill();

      // Listen for URL changes (SPA navigation)
      this.observeNavigation();

      // Listen for messages from background script
      this.setupMessageListener();

    } catch (error) {
      console.error('[AplifyAI] Error starting content script:', error);
    }
  }

  /**
   * Initialize auto-fill system
   */
  async initializeAutoFill() {
    try {
      // Only initialize if AutoFillManager is available
      if (typeof AutoFillManager === 'undefined') {
        console.warn('[AplifyAI] AutoFillManager not loaded');
        return;
      }

      this.autoFillManager = new AutoFillManager();
      const result = await this.autoFillManager.initialize();

      if (result.success) {
        console.log(`[AplifyAI] Auto-fill initialized: ${result.formsFound} form(s) detected`);

        // Notify user if forms found
        if (result.formsFound > 0) {
          this.showAutoFillNotification(result.formsFound);
        }
      }
    } catch (error) {
      console.error('[AplifyAI] Error initializing auto-fill:', error);
    }
  }

  /**
   * Show notification that forms were detected
   * @param {number} count
   */
  showAutoFillNotification(count) {
    const notification = document.createElement('div');
    notification.id = 'aplifyai-autofill-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 20px;">📋</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">AplifyAI Auto-Fill Ready</div>
            <div style="font-size: 12px; opacity: 0.9;">${count} application form${count > 1 ? 's' : ''} detected. Click extension icon to auto-fill.</div>
          </div>
        </div>
      </div>
      <style>
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      </style>
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Detect job posting on current page
   */
  async detectJob() {
    if (this.isProcessing) {
      console.log('[JobSeek] Already processing, skipping detection');
      return;
    }

    this.isProcessing = true;

    try {
      // Try each detector
      for (const detector of this.detectors) {
        const jobData = await detector.detect();

        if (jobData) {
          console.log('[JobSeek] Job detected:', jobData);
          this.currentJob = jobData;
          this.showFloatingButton();
          this.sendToBackground('JOB_DETECTED', jobData);
          break;
        }
      }

      // If no job detected, hide the button
      if (!this.currentJob) {
        this.hideFloatingButton();
      }

    } catch (error) {
      console.error('[JobSeek] Error detecting job:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Show floating action button
   */
  showFloatingButton() {
    if (this.fabElement) {
      // Button already exists, just update it
      this.updateFABState('detected');
      return;
    }

    // Wait 4 seconds before showing the button
    console.log('[JobSeek] Waiting 4 seconds before showing button...');
    setTimeout(() => {
      this.createFloatingButton();
    }, 4000);
  }

  /**
   * Create the actual floating button element
   */
  createFloatingButton() {

    // Create FAB container
    const container = document.createElement('div');
    container.className = 'jobseek-fab-container animate-in';
    container.innerHTML = `
      <div class="jobseek-fab-tooltip">Generate Resume for this Job</div>
      <button class="jobseek-fab detected" title="Generate Resume">
        <svg class="jobseek-fab-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-8h8v2H8v-2zm0 4h5v2H8v-2z"/>
        </svg>
        <span class="jobseek-fab-badge">1</span>
      </button>
      <div class="jobseek-mini-card">
        <div class="jobseek-mini-card-header">
          <div>
            <h3 class="jobseek-mini-card-title">${this.truncate(this.currentJob.jobTitle, 50)}</h3>
            <p class="jobseek-mini-card-company">${this.truncate(this.currentJob.company, 40)}</p>
          </div>
          <button class="jobseek-mini-card-close" title="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"/>
            </svg>
          </button>
        </div>
        <div class="jobseek-mini-card-details">
          ${this.currentJob.location ? `<span class="jobseek-mini-card-tag">📍 ${this.truncate(this.currentJob.location, 30)}</span>` : ''}
          ${this.currentJob.jobType ? `<span class="jobseek-mini-card-tag">💼 ${this.currentJob.jobType}</span>` : ''}
          ${this.currentJob.remote ? `<span class="jobseek-mini-card-tag">🏠 Remote</span>` : ''}
        </div>
        <div class="jobseek-mini-card-actions">
          <button class="jobseek-mini-card-btn jobseek-mini-card-btn-primary" data-action="generate">
            Generate Resume
          </button>
          <button class="jobseek-mini-card-btn jobseek-mini-card-btn-secondary" data-action="save">
            Save Job
          </button>
          <button class="jobseek-mini-card-btn" data-action="go" style="background: #eab308; color: white;">
            GO (Extract)
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    const fab = container.querySelector('.jobseek-fab');
    const card = container.querySelector('.jobseek-mini-card');
    const closeBtn = container.querySelector('.jobseek-mini-card-close');
    const generateBtn = container.querySelector('[data-action="generate"]');
    const saveBtn = container.querySelector('[data-action="save"]');
    const goBtn = container.querySelector('[data-action="go"]');

    // FAB click - toggle card
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.toggle('visible');
    });

    // Close button
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.remove('visible');
    });

    // Generate resume button
    generateBtn.addEventListener('click', () => {
      this.handleGenerateResume();
    });

    // Save job button
    saveBtn.addEventListener('click', () => {
      this.handleSaveJob();
    });

    // GO button
    goBtn.addEventListener('click', () => {
      this.handleExtraction();
    });

    // Close card when clicking outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        card.classList.remove('visible');
      }
    });

    // Add to page
    document.body.appendChild(container);

    this.fabElement = fab;
    this.cardElement = card;

    // Watch for external removal
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          if (node === container || node.contains(container)) {
            console.warn('[JobSeek] Button was removed from DOM by external code!');
            console.trace('[JobSeek] Removal stack trace');
            observer.disconnect();
            this.fabElement = null;
            this.cardElement = null;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[JobSeek] Floating button shown');
  }

  /**
   * Hide floating action button
   */
  hideFloatingButton() {
    console.log('[JobSeek] hideFloatingButton() called');
    console.trace('[JobSeek] Hide button stack trace');
    const container = document.querySelector('.jobseek-fab-container');
    if (container) {
      container.style.animation = 'jobseek-slide-out 0.3s ease forwards';
      setTimeout(() => container.remove(), 300);
      this.fabElement = null;
      this.cardElement = null;
    }
  }

  /**
   * Update FAB state
   * @param {string} state - 'detected', 'loading', 'success', 'error'
   */
  updateFABState(state) {
    if (!this.fabElement) return;

    this.fabElement.className = `jobseek-fab ${state}`;
  }

  /**
   * Handle generate resume action
   */
  async handleGenerateResume() {
    if (!this.currentJob) return;

    try {
      this.updateFABState('loading');
      this.cardElement?.classList.remove('visible');

      // Send job data to background script
      const response = await this.sendToBackground('GENERATE_RESUME', this.currentJob);

      if (response.success) {
        this.updateFABState('success');
        this.showNotification('Resume generation started!', 'success');

        // Open side panel
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL' });
        }, 1000);
      } else {
        throw new Error(response.error || 'Failed to generate resume');
      }

    } catch (error) {
      console.error('[JobSeek] Error generating resume:', error);
      this.updateFABState('error');
      this.showNotification('Failed to generate resume. Please try again.', 'error');
    }

    // Reset state after 3 seconds
    setTimeout(() => {
      this.updateFABState('detected');
    }, 3000);
  }

  /**
   * Handle save job action
   */
  async handleSaveJob() {
    if (!this.currentJob) return;

    try {
      this.updateFABState('loading');
      this.cardElement?.classList.remove('visible');

      // Send job data to background script
      const response = await this.sendToBackground('SAVE_JOB', this.currentJob);

      if (response.success) {
        this.updateFABState('success');
        this.showNotification('Job saved successfully!', 'success');
      } else {
        throw new Error(response.error || 'Failed to save job');
      }

    } catch (error) {
      console.error('[JobSeek] Error saving job:', error);
      this.updateFABState('error');
      this.showNotification('Failed to save job. Please try again.', 'error');
    }

    // Reset state after 3 seconds
    setTimeout(() => {
      this.updateFABState('detected');
    }, 3000);
  }

  /**
   * Show notification
   * @param {string} message
   * @param {string} type - 'success' or 'error'
   */
  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000000;
      background: ${type === 'success' ? '#38ef7d' : '#fc4a1a'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: jobseek-slide-in 0.3s ease;
      max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'jobseek-slide-out 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Send message to background script
   * @param {string} action
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  sendToBackground(action, data) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action, data }, (response) => {
        resolve(response || {});
      });
    });
  }

  /**
   * Setup message listener for background script
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[JobSeek] Received message:', message);

      if (message.action === 'REFRESH_DETECTION') {
        this.detectJob().then(() => {
          sendResponse({ success: true });
        });
        return true; // Keep channel open for async response
      }

      if (message.action === 'GET_JOB_DATA') {
        // Return currently detected job data
        sendResponse({
          success: true,
          data: this.currentJob
        });
        return false;
      }

      if (message.action === 'AUTO_FILL_APPLICATION') {
        // Auto-fill application form with user data using AutoFillManager
        this.autoFillApplication(message.data).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true; // Keep channel open for async response
      }

      if (message.action === 'GET_AUTOFILL_PREVIEW') {
        // Get preview of fields that will be filled
        this.getAutoFillPreview().then((preview) => {
          sendResponse({ success: true, data: preview });
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'START_AUTOFILL') {
        // Start auto-fill with options
        this.startAutoFill(message.options).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'STOP_AUTOFILL') {
        // Stop current auto-fill operation
        if (this.autoFillManager) {
          this.autoFillManager.stopFilling();
        }
        sendResponse({ success: true });
        return false;
      }

      if (message.action === 'REFRESH_FORMS') {
        // Re-detect forms on page
        this.initializeAutoFill().then(() => {
          const summary = this.autoFillManager?.getCurrentFormSummary();
          sendResponse({ success: true, data: summary });
        });
        return true;
      }

      // AI Answer handlers
      if (message.action === 'GET_SCREENING_QUESTIONS') {
        // Detect screening questions on page
        this.getScreeningQuestions().then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'GENERATE_ANSWERS') {
        // Generate AI answers for all questions
        this.generateAnswers(message.options).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'REGENERATE_ANSWER') {
        // Regenerate answer for specific question
        this.regenerateAnswer(message.questionId, message.options).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'FILL_ANSWERS') {
        // Fill AI-generated answers into form
        this.fillAnswers(message.options).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'SAVE_ANSWER_TO_CACHE') {
        // Save answer to cache for reuse
        this.saveAnswerToCache(message.questionId, message.rating).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      // NEW APPLICATION FLOW HANDLERS
      if (message.action === 'COLLECT_ADDITIONAL_DATA') {
        // Collect any additional job data not already captured
        this.collectAdditionalData().then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'FILL_GENERIC_QUESTIONS') {
        // Fill generic form fields instantly using cached profile
        this.fillGenericQuestions(message.data).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'ATTACH_FILES') {
        // Attach resume and cover letter PDFs to file inputs
        this.attachFiles(message.data).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'FILL_AI_QUESTIONS') {
        // Fill AI questions using generated JSONs
        this.fillAIQuestions(message.data).then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'VERIFY_REQUIRED_FIELDS') {
        // Verify all required fields are filled
        this.verifyRequiredFields().then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      if (message.action === 'SCROLL_TO_SUBMIT') {
        // Scroll to submit button
        this.scrollToSubmit().then((result) => {
          sendResponse(result);
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }

      return false;
    });
  }

  /**
   * Auto-fill application form fields using AutoFillManager
   * @param {Object} data - { jobData, autoFill, options }
   * @returns {Promise<Object>}
   */
  async autoFillApplication(data) {
    console.log('[JobSeek] Auto-filling application:', data);

    if (!data.autoFill) {
      console.log('[JobSeek] Auto-fill is disabled');
      return { success: false, message: 'Auto-fill is disabled' };
    }

    try {
      // Initialize auto-fill manager if not already done
      if (!this.autoFillManager) {
        await this.initializeAutoFill();
      }

      if (!this.autoFillManager || !this.autoFillManager.currentForm) {
        throw new Error('No application form detected on this page');
      }

      // Start auto-fill with options
      const options = {
        skipOptional: data.options?.skipOptional || false,
        skipDemographics: data.options?.skipDemographics !== false, // Default true
        focusFirst: data.options?.focusFirst !== false, // Default true
      };

      const result = await this.autoFillManager.startAutoFill(options);

      return result;

    } catch (error) {
      console.error('[JobSeek] Auto-fill error:', error);
      throw error;
    }
  }

  /**
   * Get preview of fields that will be auto-filled
   * @returns {Promise<Array>}
   */
  async getAutoFillPreview() {
    if (!this.autoFillManager) {
      await this.initializeAutoFill();
    }

    if (!this.autoFillManager) {
      throw new Error('Auto-fill not available');
    }

    return await this.autoFillManager.getFieldPreview();
  }

  /**
   * Start auto-fill with confirmation
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async startAutoFill(options = {}) {
    if (!this.autoFillManager) {
      throw new Error('Auto-fill manager not initialized');
    }

    return await this.autoFillManager.startAutoFill(options);
  }

  /**
   * Initialize AI Answer Manager
   */
  async initializeAIAnswers() {
    try {
      // Get Gemini API key from storage
      const result = await chrome.storage.local.get('geminiApiKey');
      const apiKey = result.geminiApiKey;

      if (!apiKey) {
        throw new Error('Gemini API key not configured. Please set it in extension settings.');
      }

      // Create AI Answer Manager instance
      if (typeof AIAnswerManager !== 'undefined') {
        this.aiAnswerManager = new AIAnswerManager(apiKey);

        // Set FormFiller if available
        if (this.autoFillManager?.formFiller) {
          this.aiAnswerManager.setFormFiller(this.autoFillManager.formFiller);
        }

        // Initialize and detect questions
        const result = await this.aiAnswerManager.initialize();

        if (result.success && result.questionCount > 0) {
          this.showQuestionNotification(result.questionCount);
        }

        return result;
      } else {
        throw new Error('AIAnswerManager not loaded');
      }
    } catch (error) {
      console.error('[JobSeek] Error initializing AI answers:', error);
      throw error;
    }
  }

  /**
   * Show notification when screening questions are detected
   * @param {number} count - Number of questions detected
   */
  showQuestionNotification(count) {
    const notification = document.createElement('div');
    notification.id = 'jobseek-question-notification';
    notification.innerHTML = `
      <style>
        #jobseek-question-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          z-index: 10001;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14px;
          animation: slideIn 0.3s ease-out;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 320px;
        }
        #jobseek-question-notification::before {
          content: "✨";
          font-size: 20px;
        }
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      </style>
      <span><strong>${count}</strong> screening question${count !== 1 ? 's' : ''} detected! Click extension to review AI answers.</span>
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Get screening questions with cached suggestions
   * @returns {Promise<Object>}
   */
  async getScreeningQuestions() {
    try {
      // Initialize AI manager if not already done
      if (!this.aiAnswerManager) {
        await this.initializeAIAnswers();
      }

      if (!this.aiAnswerManager) {
        throw new Error('AI Answer Manager not initialized');
      }

      // Get questions preview
      const questions = await this.aiAnswerManager.getQuestionsPreview();

      return {
        success: true,
        questions: questions,
        count: questions.length
      };
    } catch (error) {
      console.error('[JobSeek] Error getting screening questions:', error);
      throw error;
    }
  }

  /**
   * Generate AI answers for all detected questions
   * @param {Object} options - Generation options
   * @returns {Promise<Object>}
   */
  async generateAnswers(options = {}) {
    try {
      if (!this.aiAnswerManager) {
        await this.initializeAIAnswers();
      }

      // Get user profile
      const profileResult = await chrome.storage.local.get('userProfile');
      const userProfile = profileResult.userProfile;

      if (!userProfile) {
        throw new Error('User profile not found. Please complete your profile in settings.');
      }

      // Validate profile
      const validation = this.aiAnswerManager.validateProfile(userProfile);
      if (!validation.isComplete) {
        console.warn('[JobSeek] Profile incomplete:', validation.missing);
        // Continue anyway, but warn user
      }

      // Get job data if available
      const jobData = this.currentJob || null;

      // Generate answers
      const result = await this.aiAnswerManager.generateAllAnswers(
        userProfile,
        jobData,
        options
      );

      // Get statistics
      const statistics = this.aiAnswerManager.getStatistics();

      return {
        success: true,
        answers: result.answers,
        errors: result.errors,
        fromCache: result.fromCache.length,
        generated: result.generated.length,
        statistics: statistics
      };
    } catch (error) {
      console.error('[JobSeek] Error generating answers:', error);
      throw error;
    }
  }

  /**
   * Regenerate answer for a specific question
   * @param {string} questionId - Question ID
   * @param {Object} options - Options
   * @returns {Promise<Object>}
   */
  async regenerateAnswer(questionId, options = {}) {
    try {
      if (!this.aiAnswerManager) {
        throw new Error('AI Answer Manager not initialized');
      }

      // Get user profile and job data
      const profileResult = await chrome.storage.local.get('userProfile');
      const userProfile = profileResult.userProfile;

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const jobData = this.currentJob || null;

      // Regenerate answer
      const answer = await this.aiAnswerManager.regenerateAnswer(
        questionId,
        userProfile,
        jobData,
        options
      );

      return {
        success: true,
        answer: answer
      };
    } catch (error) {
      console.error('[JobSeek] Error regenerating answer:', error);
      throw error;
    }
  }

  /**
   * Fill AI-generated answers into form fields
   * @param {Object} options - Fill options
   * @returns {Promise<Object>}
   */
  async fillAnswers(options = {}) {
    try {
      if (!this.aiAnswerManager) {
        throw new Error('AI Answer Manager not initialized');
      }

      const result = await this.aiAnswerManager.fillAnswers(options);

      return {
        success: true,
        filled: result.filled,
        skipped: result.skipped,
        errors: result.errors,
        filledCount: result.filled.length
      };
    } catch (error) {
      console.error('[JobSeek] Error filling answers:', error);
      throw error;
    }
  }

  /**
   * Save answer to cache for future reuse
   * @param {string} questionId - Question ID
   * @param {number} rating - Rating (1-5)
   * @returns {Promise<Object>}
   */
  async saveAnswerToCache(questionId, rating = null) {
    try {
      if (!this.aiAnswerManager) {
        throw new Error('AI Answer Manager not initialized');
      }

      const jobContext = this.currentJob ? {
        company: this.currentJob.company,
        title: this.currentJob.title
      } : null;

      const success = await this.aiAnswerManager.saveAnswerToCache(
        questionId,
        rating,
        jobContext
      );

      return {
        success: success
      };
    } catch (error) {
      console.error('[JobSeek] Error saving to cache:', error);
      throw error;
    }
  }

  /**
   * Observe navigation changes (for SPAs)
   */
  observeNavigation() {
    let lastUrl = location.href;

    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('[JobSeek] URL changed, re-detecting...');

        // Clear current job
        this.currentJob = null;

        // Re-detect after a short delay
        setTimeout(() => this.detectJob(), 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  /**
   * Truncate text
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Handle extraction action (Step A)
   */
  async handleExtraction() {
    console.log('[JobSeek] Starting extraction...');

    this.showNotification('Scrolling to capture all fields...', 'success');
    const startScroll = window.scrollY;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    let detector;
    if (this.aiAnswerManager && this.aiAnswerManager.detector) {
      detector = this.aiAnswerManager.detector;
    } else {
      if (typeof QuestionDetector !== 'undefined') {
        detector = new QuestionDetector();
      } else {
        console.error('[JobSeek] QuestionDetector not found');
        this.showNotification('Error: Logic not loaded', 'error');
        return;
      }
    }

    try {
      const fields = detector.detect();

      // Find submit button
      const submitButton = document.querySelector('button[type="submit"], input[type="submit"], button[aria-label*="ubmit" i], button:not([type="button"]):not([type="reset"])');
      const submitButtonInfo = submitButton ? {
        text: submitButton.textContent?.trim() || submitButton.value,
        id: submitButton.id,
        type: submitButton.type,
        ariaLabel: submitButton.getAttribute('aria-label')
      } : null;

      // Extract job metadata
      const jobMetadata = {
        url: window.location.href,
        title: document.title,
        company: this.currentJob?.company || this.extractCompanyFromUrl(),
        jobTitle: this.currentJob?.jobTitle || document.querySelector('h1')?.textContent?.trim(),
        location: this.currentJob?.location || null,
        jobType: this.extractJobType()
      };

      // Compile full extraction data
      const extractionData = {
        timestamp: new Date().toISOString(),
        metadata: jobMetadata,
        fields: fields.map(f => ({
          id: f.id,
          name: f.name,
          label: f.text,
          type: f.type,
          inputType: f.inputType,
          placeholder: f.placeholder,
          value: f.value,
          required: f.required,
          options: f.options || null
        })),
        submitButton: submitButtonInfo,
        totalFields: fields.length
      };

      // Single comprehensive console output
      console.log('%c[JobSeek] Complete Extraction', 'background: #4CAF50; color: white; font-weight: bold; padding: 4px 8px; border-radius: 3px;');
      console.table({
        'URL': extractionData.metadata.url,
        'Company': extractionData.metadata.company,
        'Job Title': extractionData.metadata.jobTitle,
        'Location': extractionData.metadata.location,
        'Job Type': extractionData.metadata.jobType,
        'Total Fields': extractionData.totalFields,
        'Submit Button': extractionData.submitButton?.text || 'Not found'
      });
      console.log('📋 Complete Data:', extractionData);

      // Restore scroll position
      window.scrollTo({
        top: startScroll,
        behavior: 'auto'
      });

      this.showNotification(`Extracted ${fields.length} fields! Check Console.`, 'success');

    } catch (e) {
      console.error('[JobSeek] Extraction failed:', e);
      this.showNotification('Extraction failed', 'error');
    }
  }

  /**
   * Extract company name from URL
   */
  extractCompanyFromUrl() {
    const url = window.location.href;

    // Greenhouse pattern: job-boards.greenhouse.io/company/jobs/id
    if (url.includes('greenhouse.io')) {
      const match = url.match(/greenhouse\.io\/([^\/]+)/);
      return match ? match[1] : null;
    }

    // Lever pattern: jobs.lever.co/company/
    if (url.includes('lever.co')) {
      const match = url.match(/lever\.co\/([^\/]+)/);
      return match ? match[1] : null;
    }

    // LinkedIn pattern: linkedin.com/jobs/view/id?company=name
    if (url.includes('linkedin.com')) {
      const match = url.match(/[?&]company=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    }

    return null;
  }

  /**
   * Extract job type from page content
   */
  extractJobType() {
    const pageText = document.body.textContent.toLowerCase();

    if (pageText.includes('full time') || pageText.includes('full-time')) return 'Full-time';
    if (pageText.includes('part time') || pageText.includes('part-time')) return 'Part-time';
    if (pageText.includes('contract')) return 'Contract';
    if (pageText.includes('internship')) return 'Internship';
    if (pageText.includes('remote')) return 'Remote';

    return 'Not specified';
  }

  /**
   * Collect additional job data not already captured
   * @returns {Promise<Object>}
   */
  async collectAdditionalData() {
    console.log('[AplifyAI] Collecting additional job data');

    try {
      // Most job data is already collected during detection
      // This is a placeholder for any additional scraping needed
      return {
        success: true,
        data: {
          // Could add: salary range, benefits, company size, etc.
          pageUrl: window.location.href,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('[AplifyAI] Error collecting additional data:', error);
      throw error;
    }
  }

  /**
   * Fill generic form fields instantly using cached profile
   * @param {Object} data - { profile, retryOnly }
   * @returns {Promise<Object>}
   */
  async fillGenericQuestions(data) {
    console.log('[AplifyAI] Filling generic questions', data);

    try {
      const { profile, retryOnly } = data;
      const filled = [];
      const failed = [];

      // Define field mappings (label patterns -> profile fields)
      const nameFields = {
        patterns: ['first name', 'first', 'fname', 'given name'],
        value: profile.firstName || profile.fullName?.split(' ')[0] || '',
      };

      const lastNameFields = {
        patterns: ['last name', 'last', 'lname', 'surname', 'family name'],
        value: profile.lastName || profile.fullName?.split(' ').pop() || '',
      };

      const emailFields = {
        patterns: ['email', 'e-mail', 'email address'],
        value: profile.email || '',
      };

      const phoneFields = {
        patterns: ['phone', 'telephone', 'mobile', 'cell'],
        value: profile.phone || '',
      };

      const locationFields = {
        patterns: ['city', 'location', 'address'],
        value: profile.location || '',
      };

      const linkedinFields = {
        patterns: ['linkedin', 'linkedin url', 'linkedin profile'],
        value: profile.links?.linkedin || '',
      };

      const githubFields = {
        patterns: ['github', 'github url', 'github profile'],
        value: profile.links?.github || '',
      };

      const portfolioFields = {
        patterns: ['portfolio', 'website', 'personal website'],
        value: profile.links?.portfolio || '',
      };

      const fieldMappings = [
        nameFields,
        lastNameFields,
        emailFields,
        phoneFields,
        locationFields,
        linkedinFields,
        githubFields,
        portfolioFields,
      ];

      // Find and fill all form inputs
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"]');

      for (const input of inputs) {
        try {
          // Skip if in retry mode and not in retry list
          if (retryOnly && !retryOnly.includes(input.id || input.name)) {
            continue;
          }

          // Get field label/placeholder
          const label = this.getFieldLabel(input).toLowerCase();

          // Try to match with field mappings
          for (const mapping of fieldMappings) {
            if (mapping.patterns.some(pattern => label.includes(pattern)) && mapping.value) {
              // Fill the field
              input.value = mapping.value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));

              filled.push({
                id: input.id || input.name,
                label,
                value: mapping.value,
              });
              break;
            }
          }
        } catch (error) {
          console.error('[AplifyAI] Error filling field:', error);
          failed.push({
            id: input.id || input.name,
            label: this.getFieldLabel(input),
            error: error.message,
          });
        }
      }

      console.log(`[AplifyAI] Generic fields filled: ${filled.length}, failed: ${failed.length}`);

      return {
        success: true,
        filled,
        failed,
      };

    } catch (error) {
      console.error('[AplifyAI] Error filling generic questions:', error);
      throw error;
    }
  }

  /**
   * Get label text for an input field
   * @param {HTMLElement} input
   * @returns {string}
   */
  getFieldLabel(input) {
    // Try label element
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Try parent label
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();

    // Try aria-label
    if (input.getAttribute('aria-label')) {
      return input.getAttribute('aria-label').trim();
    }

    // Try placeholder
    if (input.placeholder) {
      return input.placeholder.trim();
    }

    // Try name attribute
    if (input.name) {
      return input.name.replace(/[-_]/g, ' ').trim();
    }

    return '';
  }

  /**
   * Attach resume and cover letter PDFs to file inputs
   * @param {Object} data - { resumeUrl, coverLetterUrl }
   * @returns {Promise<Object>}
   */
  async attachFiles(data) {
    console.log('[AplifyAI] Attaching files', data);

    try {
      const { resumeUrl, coverLetterUrl } = data;
      const attached = [];

      // Find file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');

      for (const input of fileInputs) {
        try {
          const label = this.getFieldLabel(input).toLowerCase();

          // Determine which file to attach based on label
          let fileUrl = null;
          let fileName = null;

          if (label.includes('resume') || label.includes('cv')) {
            fileUrl = resumeUrl;
            fileName = 'resume.pdf';
          } else if (label.includes('cover letter')) {
            fileUrl = coverLetterUrl;
            fileName = 'cover_letter.pdf';
          }

          if (fileUrl) {
            // Download the file
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: 'application/pdf' });

            // Create DataTransfer to set files
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;

            // Trigger change event
            input.dispatchEvent(new Event('change', { bubbles: true }));

            attached.push({
              id: input.id || input.name,
              label: this.getFieldLabel(input),
              file: fileName,
            });

            console.log(`[AplifyAI] Attached ${fileName} to ${label}`);
          }
        } catch (error) {
          console.error('[AplifyAI] Error attaching file:', error);
        }
      }

      return {
        success: true,
        attached,
      };

    } catch (error) {
      console.error('[AplifyAI] Error attaching files:', error);
      throw error;
    }
  }

  /**
   * Fill AI questions using generated JSONs
   * @param {Object} data - { resumeJson, coverLetterJson, jobData, retryOnly }
   * @returns {Promise<Object>}
   */
  async fillAIQuestions(data) {
    console.log('[AplifyAI] Filling AI questions', data);

    try {
      const { resumeJson, coverLetterJson, jobData, retryOnly } = data;
      const filled = [];
      const failed = [];

      // Find all text areas and large text inputs (likely long-form questions)
      const questionFields = document.querySelectorAll('textarea, input[type="text"][minlength], input[type="text"][maxlength]');

      for (const field of questionFields) {
        try {
          // Skip if in retry mode
          if (retryOnly && !retryOnly.includes(field.id || field.name)) {
            continue;
          }

          //Skip if already filled
          if (field.value && field.value.trim().length > 0) {
            continue;
          }

          const label = this.getFieldLabel(field).toLowerCase();

          // Generate answer based on question
          const answer = await this.generateAnswerFromJSON(label, resumeJson, coverLetterJson, jobData);

          if (answer) {
            field.value = answer;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));

            filled.push({
              id: field.id || field.name,
              question: label,
              answer: answer.substring(0, 100) + '...',
            });
          }
        } catch (error) {
          console.error('[AplifyAI] Error filling AI question:', error);
          failed.push({
            id: field.id || field.name,
            question: this.getFieldLabel(field),
            error: error.message,
          });
        }
      }

      console.log(`[AplifyAI] AI questions filled: ${filled.length}, failed: ${failed.length}`);

      return {
        success: true,
        filled,
        failed,
      };

    } catch (error) {
      console.error('[AplifyAI] Error filling AI questions:', error);
      throw error;
    }
  }

  /**
   * Generate answer from JSON data
   * @param {string} question
   * @param {Object} resumeJson
   * @param {Object} coverLetterJson
   * @param {Object} jobData
   * @returns {Promise<string>}
   */
  async generateAnswerFromJSON(question, resumeJson, coverLetterJson, jobData) {
    // Simple keyword matching for common questions
    const lowerQuestion = question.toLowerCase();

    // Why this company/role?
    if (lowerQuestion.includes('why') && (lowerQuestion.includes('company') || lowerQuestion.includes('role') || lowerQuestion.includes('position'))) {
      return `I am excited about this opportunity at ${jobData.company} because it aligns perfectly with my professional background and career goals. With my experience in ${resumeJson.experience?.[0]?.title || 'software development'}, I am confident I can contribute meaningfully to your team while continuing to grow my skills.`;
    }

    // Greatest achievement
    if (lowerQuestion.includes('achievement') || lowerQuestion.includes('accomplish')) {
      const topAchievement = resumeJson.experience?.[0]?.achievements?.[0];
      return topAchievement || `One of my notable achievements was successfully leading a project that improved system efficiency and delivered measurable impact for the organization.`;
    }

    // Relevant experience
    if (lowerQuestion.includes('experience') || lowerQuestion.includes('background')) {
      const exp = resumeJson.experience?.[0];
      return exp ? `I have ${resumeJson.experience?.length || 'several'} years of experience, most recently as ${exp.title} at ${exp.company}. ${exp.description || exp.achievements?.[0] || ''}` : 'I have relevant experience in this field.';
    }

    // Skills
    if (lowerQuestion.includes('skill') || lowerQuestion.includes('technical')) {
      const skills = resumeJson.skills?.slice(0, 5).join(', ') || 'various technologies';
      return `My key technical skills include ${skills}. I have hands-on experience applying these in professional settings.`;
    }

    // Why leave current job
    if (lowerQuestion.includes('leave') || lowerQuestion.includes('looking for')) {
      return `I am seeking new opportunities to grow my career and take on new challenges. This role at ${jobData.company} represents an exciting opportunity to leverage my skills in a new context.`;
    }

    // Default: Generic professional answer
    return `Based on my background and experience, I believe I would be a great fit for this role. I am passionate about contributing to ${jobData.company}'s mission and look forward to the opportunity to discuss how my skills align with your needs.`;
  }

  /**
   * Verify all required fields are filled
   * @returns {Promise<Object>}
   */
  async verifyRequiredFields() {
    console.log('[AplifyAI] Verifying required fields');

    try {
      const missingRequired = [];
      const missingOptional = [];

      // Find all required fields
      const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');

      for (const field of requiredFields) {
        const isEmpty = !field.value || field.value.trim().length === 0;

        if (isEmpty) {
          missingRequired.push({
            id: field.id || field.name,
            label: this.getFieldLabel(field),
            type: field.type || field.tagName.toLowerCase(),
          });
        }
      }

      // Find optional but unfilled fields
      const optionalFields = document.querySelectorAll('input:not([required]), textarea:not([required]), select:not([required])');

      for (const field of optionalFields) {
        // Skip hidden, disabled, or non-visible fields
        if (field.type === 'hidden' || field.disabled || field.offsetParent === null) {
          continue;
        }

        const isEmpty = !field.value || field.value.trim().length === 0;

        if (isEmpty) {
          missingOptional.push({
            id: field.id || field.name,
            label: this.getFieldLabel(field),
            type: field.type || field.tagName.toLowerCase(),
          });
        }
      }

      console.log(`[AplifyAI] Missing required: ${missingRequired.length}, missing optional: ${missingOptional.length}`);

      return {
        success: true,
        data: {
          missingRequired,
          missingOptional,
        },
      };

    } catch (error) {
      console.error('[AplifyAI] Error verifying fields:', error);
      throw error;
    }
  }

  /**
   * Scroll to submit button
   * @returns {Promise<Object>}
   */
  async scrollToSubmit() {
    console.log('[AplifyAI] Scrolling to submit button');

    try {
      // Find submit button
      const submitButton = document.querySelector('button[type="submit"], input[type="submit"], button:contains("Submit"), button:contains("Apply")');

      if (submitButton) {
        // Smooth scroll to button
        submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight button (optional visual feedback)
        submitButton.style.outline = '3px solid #3DCEA5';
        submitButton.style.outlineOffset = '2px';

        // Remove highlight after 3 seconds
        setTimeout(() => {
          submitButton.style.outline = '';
          submitButton.style.outlineOffset = '';
        }, 3000);

        console.log('[AplifyAI] Scrolled to submit button');

        return {
          success: true,
          buttonText: submitButton.textContent.trim(),
        };
      } else {
        throw new Error('Submit button not found');
      }

    } catch (error) {
      console.error('[AplifyAI] Error scrolling to submit:', error);
      throw error;
    }
  }
}

// Start the content script when loaded
const jobSeekCS = new AplifyAIContentScript();
