/**
 * AutoFillManager - Coordinates form detection, mapping, and filling
 * Main entry point for auto-fill functionality
 */

class AutoFillManager {
  constructor() {
    this.detector = new FormDetector();
    this.filler = new FormFiller();
    this.detectedForms = [];
    this.currentForm = null;
    this.fillLog = [];
  }

  /**
   * Initialize auto-fill system
   */
  async initialize() {
    console.log('[AutoFillManager] Initializing...');
    
    // Detect forms on page
    this.detectedForms = this.detector.detectForms();
    
    if (this.detectedForms.length > 0) {
      console.log(`[AutoFillManager] Found ${this.detectedForms.length} application form(s)`);
      
      // Select first form as default
      this.currentForm = this.detectedForms[0];
      
      return {
        success: true,
        formsFound: this.detectedForms.length,
        currentForm: this.getCurrentFormSummary(),
      };
    } else {
      console.log('[AutoFillManager] No application forms found');
      return {
        success: false,
        formsFound: 0,
        message: 'No application forms detected on this page',
      };
    }
  }

  /**
   * Start auto-fill process with confirmation
   * @param {Object} options - Fill options
   * @returns {Promise<Object>} Fill result
   */
  async startAutoFill(options = {}) {
    console.log('[AutoFillManager] Starting auto-fill with options:', options);
    
    if (!this.currentForm) {
      throw new Error('No form selected for auto-fill');
    }

    try {
      // Get user profile from storage
      const userProfile = await this.getUserProfile();
      
      if (!userProfile) {
        throw new Error('User profile not found. Please complete your profile first.');
      }

      // Map profile data to form fields
      const mapper = new FormFieldMapper(userProfile);
      const fieldValues = mapper.getAllFieldValues(this.currentForm.fields);

      // Validate required fields
      const missingRequired = this.validateRequiredFields(this.currentForm.fields, fieldValues);
      if (missingRequired.length > 0) {
        console.warn('[AutoFillManager] Missing required fields:', missingRequired);
        return {
          success: false,
          error: 'Missing required profile data',
          missingFields: missingRequired,
        };
      }

      // Fill the form
      const fillResult = await this.filler.fillForm(this.currentForm, fieldValues, options);

      // Log the fill operation
      await this.logFillOperation(fillResult, options);

      // Notify background script
      chrome.runtime.sendMessage({
        action: 'AUTO_FILL_COMPLETE',
        data: {
          url: window.location.href,
          filledCount: fillResult.filledCount,
          success: fillResult.success,
        },
      });

      return fillResult;

    } catch (error) {
      console.error('[AutoFillManager] Auto-fill error:', error);
      throw error;
    }
  }

  /**
   * Get user profile from storage or background script
   * @returns {Promise<Object>}
   */
  async getUserProfile() {
    try {
      // Try storage first
      const result = await chrome.storage.local.get(['userData']);
      if (result.userData) {
        return result.userData;
      }

      // Fetch from background script
      const response = await chrome.runtime.sendMessage({ action: 'GET_USER_PROFILE' });
      
      if (response.success && response.data) {
        // Cache in storage
        await chrome.storage.local.set({ userData: response.data });
        return response.data;
      }

      return null;

    } catch (error) {
      console.error('[AutoFillManager] Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Validate required fields have values
   * @param {Object} formFields
   * @param {Object} fieldValues
   * @returns {Array<string>} Missing field names
   */
  validateRequiredFields(formFields, fieldValues) {
    const missing = [];

    for (const [fieldName, fieldInfo] of Object.entries(formFields)) {
      if (fieldInfo.required) {
        if (!fieldValues[fieldName] || fieldValues[fieldName] === '') {
          missing.push({
            name: fieldName,
            label: fieldInfo.label,
          });
        }
      }
    }

    return missing;
  }

  /**
   * Get current form summary for display
   * @returns {Object}
   */
  getCurrentFormSummary() {
    if (!this.currentForm) return null;

    const summary = this.detector.getFieldSummary(this.currentForm);
    
    return {
      action: this.currentForm.action,
      method: this.currentForm.method,
      fieldCount: this.currentForm.fieldCount,
      fields: Object.keys(this.currentForm.fields),
      summary,
    };
  }

  /**
   * Get preview of fields that will be filled
   * @returns {Promise<Array>}
   */
  async getFieldPreview() {
    if (!this.currentForm) return [];

    const userProfile = await this.getUserProfile();
    if (!userProfile) return [];

    const mapper = new FormFieldMapper(userProfile);
    const preview = [];

    for (const [fieldName, fieldInfo] of Object.entries(this.currentForm.fields)) {
      const value = mapper.getFieldValue(fieldName, fieldInfo);
      
      if (value !== null && value !== undefined) {
        preview.push({
          fieldName,
          label: fieldInfo.label,
          type: fieldInfo.type,
          required: fieldInfo.required,
          value: this.maskSensitiveData(fieldName, value),
          willFill: true,
        });
      } else {
        preview.push({
          fieldName,
          label: fieldInfo.label,
          type: fieldInfo.type,
          required: fieldInfo.required,
          value: null,
          willFill: false,
        });
      }
    }

    return preview;
  }

  /**
   * Mask sensitive data for preview
   * @param {string} fieldName
   * @param {any} value
   * @returns {any}
   */
  maskSensitiveData(fieldName, value) {
    const sensitiveFields = ['phone', 'email', 'address', 'zipCode'];
    
    if (sensitiveFields.includes(fieldName) && typeof value === 'string') {
      // Show first 3 and last 2 characters
      if (value.length > 5) {
        return value.substr(0, 3) + '...' + value.substr(-2);
      }
    }
    
    return value;
  }

  /**
   * Log fill operation to storage
   * @param {Object} fillResult
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async logFillOperation(fillResult, options) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      domain: window.location.hostname,
      formAction: this.currentForm.action,
      filledCount: fillResult.filledCount,
      errorCount: fillResult.errorCount,
      success: fillResult.success,
      filledFields: fillResult.filledFields.map(f => ({
        fieldName: f.fieldName,
        label: f.label,
      })),
      errors: fillResult.errors,
      options,
    };

    this.fillLog.push(logEntry);

    try {
      // Get existing logs
      const result = await chrome.storage.local.get(['autoFillLog']);
      const logs = result.autoFillLog || [];
      
      // Add new entry
      logs.unshift(logEntry);
      
      // Keep last 50 entries
      if (logs.length > 50) {
        logs.length = 50;
      }

      // Save to storage
      await chrome.storage.local.set({ autoFillLog: logs });

    } catch (error) {
      console.error('[AutoFillManager] Error logging fill operation:', error);
    }
  }

  /**
   * Get auto-fill logs
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getFillLogs(limit = 10) {
    try {
      const result = await chrome.storage.local.get(['autoFillLog']);
      const logs = result.autoFillLog || [];
      return logs.slice(0, limit);
    } catch (error) {
      console.error('[AutoFillManager] Error getting logs:', error);
      return [];
    }
  }

  /**
   * Clear auto-fill logs
   * @returns {Promise<void>}
   */
  async clearFillLogs() {
    try {
      await chrome.storage.local.set({ autoFillLog: [] });
      this.fillLog = [];
    } catch (error) {
      console.error('[AutoFillManager] Error clearing logs:', error);
    }
  }

  /**
   * Check if auto-fill is enabled in settings
   * @returns {Promise<boolean>}
   */
  async isAutoFillEnabled() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      return result.settings?.autoFillEnabled !== false; // Default to true
    } catch (error) {
      return true;
    }
  }

  /**
   * Get current fill progress
   * @returns {Object}
   */
  getProgress() {
    return this.filler.getProgress();
  }

  /**
   * Stop current fill operation
   */
  stopFilling() {
    this.filler.stop();
  }

  /**
   * Select a different form to fill
   * @param {number} index
   */
  selectForm(index) {
    if (index >= 0 && index < this.detectedForms.length) {
      this.currentForm = this.detectedForms[index];
      return true;
    }
    return false;
  }

  /**
   * Re-detect forms (if page changed)
   */
  refresh() {
    this.detectedForms = this.detector.detectForms();
    if (this.detectedForms.length > 0) {
      this.currentForm = this.detectedForms[0];
    } else {
      this.currentForm = null;
    }
    return this.detectedForms.length;
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoFillManager;
}
