/**
 * FormFiller - Intelligent form filling with human-like behavior
 * Handles all field types with proper event simulation and rate limiting
 */

class FormFiller {
  constructor() {
    this.fillDelay = { min: 100, max: 500 }; // Milliseconds between fields
    this.typingDelay = { min: 30, max: 100 }; // Milliseconds between keystrokes
    this.isFilling = false;
    this.filledFields = [];
    this.errors = [];
  }

  /**
   * Fill a form with user data
   * @param {Object} formData - Form metadata from FormDetector
   * @param {Object} fieldValues - Values from FormFieldMapper
   * @param {Object} options - Fill options
   * @returns {Promise<Object>} Fill results
   */
  async fillForm(formData, fieldValues, options = {}) {
    console.log('[FormFiller] Starting form fill...');
    
    this.isFilling = true;
    this.filledFields = [];
    this.errors = [];
    
    const {
      skipOptional = false,
      skipDemographics = true,
      focusFirst = true,
    } = options;

    try {
      // Focus first field for better UX
      if (focusFirst) {
        const firstField = Object.values(formData.fields)[0];
        if (firstField) {
          firstField.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await this.delay(300);
        }
      }

      // Fill fields in order
      for (const [fieldName, fieldInfo] of Object.entries(formData.fields)) {
        // Skip if no value
        if (!fieldValues.hasOwnProperty(fieldName) || fieldValues[fieldName] === null) {
          console.log(`[FormFiller] Skipping ${fieldName} - no value`);
          continue;
        }

        // Skip optional fields if requested
        if (skipOptional && !fieldInfo.required) {
          console.log(`[FormFiller] Skipping ${fieldName} - optional`);
          continue;
        }

        // Skip demographic fields if requested
        if (skipDemographics && this.isDemographicField(fieldName)) {
          console.log(`[FormFiller] Skipping ${fieldName} - demographic`);
          continue;
        }

        try {
          // Fill the field
          await this.fillField(fieldInfo, fieldValues[fieldName]);
          
          this.filledFields.push({
            fieldName,
            label: fieldInfo.label,
            value: fieldValues[fieldName],
            timestamp: new Date().toISOString(),
          });

          // Random delay between fields (human-like)
          await this.delay(this.randomDelay(this.fillDelay.min, this.fillDelay.max));
          
        } catch (error) {
          console.error(`[FormFiller] Error filling ${fieldName}:`, error);
          this.errors.push({
            fieldName,
            label: fieldInfo.label,
            error: error.message,
          });
        }
      }

      console.log(`[FormFiller] Fill complete. Filled ${this.filledFields.length} fields, ${this.errors.length} errors`);
      
      return {
        success: this.errors.length === 0,
        filledCount: this.filledFields.length,
        errorCount: this.errors.length,
        filledFields: this.filledFields,
        errors: this.errors,
      };

    } finally {
      this.isFilling = false;
    }
  }

  /**
   * Fill a single field based on its type
   * @param {Object} fieldInfo
   * @param {any} value
   * @returns {Promise<void>}
   */
  async fillField(fieldInfo, value) {
    const { element, type } = fieldInfo;
    
    console.log(`[FormFiller] Filling ${fieldInfo.label} (${type}) with:`, value);

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.delay(100);

    // Focus element
    element.focus();
    await this.delay(50);

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
        await this.fillTextInput(element, value);
        break;

      case 'textarea':
        await this.fillTextarea(element, value);
        break;

      case 'select':
      case 'select-one':
      case 'select-multiple':
        await this.fillSelect(element, value);
        break;

      case 'checkbox':
        await this.fillCheckbox(element, value);
        break;

      case 'radio':
        await this.fillRadio(element, value);
        break;

      case 'file':
        // File upload handled separately
        console.log('[FormFiller] File upload skipped - requires user interaction');
        break;

      default:
        console.warn(`[FormFiller] Unknown field type: ${type}`);
    }

    // Blur element to trigger validation
    element.blur();
    await this.delay(50);
  }

  /**
   * Fill text input with typing simulation
   * @param {Element} element
   * @param {string} value
   * @returns {Promise<void>}
   */
  async fillTextInput(element, value) {
    // Clear existing value
    element.value = '';
    this.triggerEvent(element, 'focus');
    
    // Type character by character
    const valueStr = String(value);
    for (let i = 0; i < valueStr.length; i++) {
      element.value += valueStr[i];
      
      // Trigger input event for each character
      this.triggerEvent(element, 'input');
      this.triggerEvent(element, 'keydown');
      this.triggerEvent(element, 'keyup');
      
      // Random typing delay
      await this.delay(this.randomDelay(this.typingDelay.min, this.typingDelay.max));
    }
    
    // Trigger change event
    this.triggerEvent(element, 'change');
    this.triggerEvent(element, 'blur');
  }

  /**
   * Fill textarea with typing simulation
   * @param {Element} element
   * @param {string} value
   * @returns {Promise<void>}
   */
  async fillTextarea(element, value) {
    // Clear existing value
    element.value = '';
    this.triggerEvent(element, 'focus');
    
    // For long text, type in chunks to speed up
    const valueStr = String(value);
    const chunkSize = 10; // Type 10 characters at a time
    
    for (let i = 0; i < valueStr.length; i += chunkSize) {
      const chunk = valueStr.substr(i, chunkSize);
      element.value += chunk;
      
      this.triggerEvent(element, 'input');
      
      // Delay after each chunk
      await this.delay(this.randomDelay(50, 150));
    }
    
    this.triggerEvent(element, 'change');
    this.triggerEvent(element, 'blur');
  }

  /**
   * Fill select dropdown
   * @param {Element} element
   * @param {string} value
   * @returns {Promise<void>}
   */
  async fillSelect(element, value) {
    this.triggerEvent(element, 'focus');
    
    // Set value
    element.value = value;
    
    // If value didn't stick, try finding by text
    if (element.value !== value) {
      for (const option of element.options) {
        if (option.value === value || option.textContent.trim().toLowerCase() === value.toLowerCase()) {
          option.selected = true;
          element.value = option.value;
          break;
        }
      }
    }
    
    this.triggerEvent(element, 'change');
    this.triggerEvent(element, 'blur');
    
    await this.delay(100);
  }

  /**
   * Fill checkbox
   * @param {Element} element
   * @param {boolean} value
   * @returns {Promise<void>}
   */
  async fillCheckbox(element, value) {
    this.triggerEvent(element, 'focus');
    
    const shouldCheck = Boolean(value);
    if (element.checked !== shouldCheck) {
      element.click();
      await this.delay(100);
    }
    
    this.triggerEvent(element, 'change');
    this.triggerEvent(element, 'blur');
  }

  /**
   * Fill radio button
   * @param {Element} element
   * @param {any} value
   * @returns {Promise<void>}
   */
  async fillRadio(element, value) {
    // Find the radio button with matching value
    const name = element.name;
    const radios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    
    for (const radio of radios) {
      if (radio.value === value || radio.value === String(value)) {
        radio.focus();
        radio.click();
        await this.delay(100);
        radio.blur();
        break;
      }
    }
  }

  /**
   * Trigger event on element
   * @param {Element} element
   * @param {string} eventType
   */
  triggerEvent(element, eventType) {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    
    // Also trigger React synthetic events if detected
    if (element._valueTracker) {
      element._valueTracker.setValue('');
    }
  }

  /**
   * Check if field is demographic
   * @param {string} fieldName
   * @returns {boolean}
   */
  isDemographicField(fieldName) {
    const demographicFields = [
      'veteranStatus',
      'disability',
      'gender',
      'race',
    ];
    
    return demographicFields.includes(fieldName);
  }

  /**
   * Random delay within range
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Delay for specified milliseconds
   * @param {number} ms
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Highlight field being filled (visual feedback)
   * @param {Element} element
   * @param {number} duration
   */
  async highlightField(element, duration = 500) {
    const originalOutline = element.style.outline;
    const originalBorder = element.style.border;
    
    element.style.outline = '2px solid #667eea';
    element.style.border = '2px solid #667eea';
    
    await this.delay(duration);
    
    element.style.outline = originalOutline;
    element.style.border = originalBorder;
  }

  /**
   * Get fill progress
   * @returns {Object}
   */
  getProgress() {
    return {
      isFilling: this.isFilling,
      filledCount: this.filledFields.length,
      errorCount: this.errors.length,
    };
  }

  /**
   * Stop filling
   */
  stop() {
    this.isFilling = false;
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormFiller;
}
