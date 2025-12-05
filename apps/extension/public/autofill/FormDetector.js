/**
 * FormDetector - Intelligent job application form detection
 * Identifies application forms and their fields on job board sites
 */

class FormDetector {
  constructor() {
    this.formPatterns = {
      // Common form identifiers
      formSelectors: [
        'form[action*="apply"]',
        'form[action*="application"]',
        'form[id*="apply"]',
        'form[id*="application"]',
        'form[class*="apply"]',
        'form[class*="application"]',
        'form[data-testid*="apply"]',
        '[role="form"][aria-label*="application"]',
      ],
      
      // Field patterns for detection
      fieldPatterns: {
        firstName: [
          'input[name*="first" i][name*="name" i]',
          'input[id*="first" i][id*="name" i]',
          'input[placeholder*="first name" i]',
          'input[aria-label*="first name" i]',
          'input[autocomplete="given-name"]',
        ],
        lastName: [
          'input[name*="last" i][name*="name" i]',
          'input[id*="last" i][id*="name" i]',
          'input[placeholder*="last name" i]',
          'input[aria-label*="last name" i]',
          'input[autocomplete="family-name"]',
        ],
        fullName: [
          'input[name*="fullname" i]',
          'input[name*="full_name" i]',
          'input[id*="fullname" i]',
          'input[placeholder*="full name" i]',
          'input[autocomplete="name"]',
        ],
        email: [
          'input[type="email"]',
          'input[name*="email" i]',
          'input[id*="email" i]',
          'input[placeholder*="email" i]',
          'input[autocomplete="email"]',
        ],
        phone: [
          'input[type="tel"]',
          'input[name*="phone" i]',
          'input[id*="phone" i]',
          'input[placeholder*="phone" i]',
          'input[autocomplete="tel"]',
        ],
        linkedin: [
          'input[name*="linkedin" i]',
          'input[id*="linkedin" i]',
          'input[placeholder*="linkedin" i]',
          'input[aria-label*="linkedin" i]',
        ],
        portfolio: [
          'input[name*="website" i]',
          'input[name*="portfolio" i]',
          'input[id*="website" i]',
          'input[id*="portfolio" i]',
          'input[placeholder*="website" i]',
          'input[placeholder*="portfolio" i]',
        ],
        github: [
          'input[name*="github" i]',
          'input[id*="github" i]',
          'input[placeholder*="github" i]',
        ],
        address: [
          'input[name*="address" i]',
          'input[id*="address" i]',
          'input[autocomplete="street-address"]',
        ],
        city: [
          'input[name*="city" i]',
          'input[id*="city" i]',
          'input[autocomplete="address-level2"]',
        ],
        state: [
          'input[name*="state" i]',
          'select[name*="state" i]',
          'input[id*="state" i]',
          'select[id*="state" i]',
        ],
        zipCode: [
          'input[name*="zip" i]',
          'input[name*="postal" i]',
          'input[id*="zip" i]',
          'input[autocomplete="postal-code"]',
        ],
        country: [
          'select[name*="country" i]',
          'select[id*="country" i]',
          'input[name*="country" i]',
        ],
        workAuthorization: [
          'select[name*="authorization" i]',
          'select[name*="work_auth" i]',
          'select[id*="authorization" i]',
          'input[name*="authorized" i]',
        ],
        sponsorship: [
          'select[name*="sponsor" i]',
          'input[name*="sponsor" i]',
          'input[id*="sponsor" i]',
        ],
        veteranStatus: [
          'select[name*="veteran" i]',
          'select[id*="veteran" i]',
          'input[name*="veteran" i]',
        ],
        disability: [
          'select[name*="disability" i]',
          'select[id*="disability" i]',
          'input[name*="disability" i]',
        ],
        gender: [
          'select[name*="gender" i]',
          'select[id*="gender" i]',
          'input[name*="gender" i]',
        ],
        race: [
          'select[name*="race" i]',
          'select[name*="ethnicity" i]',
          'select[id*="race" i]',
        ],
        yearsOfExperience: [
          'input[name*="experience" i][name*="year" i]',
          'select[name*="experience" i][name*="year" i]',
          'input[id*="experience" i][id*="year" i]',
        ],
        educationLevel: [
          'select[name*="education" i]',
          'select[name*="degree" i]',
          'select[id*="education" i]',
          'select[id*="degree" i]',
        ],
        university: [
          'input[name*="university" i]',
          'input[name*="school" i]',
          'input[id*="university" i]',
          'input[id*="school" i]',
        ],
        major: [
          'input[name*="major" i]',
          'input[name*="field" i]',
          'input[id*="major" i]',
        ],
        graduationYear: [
          'input[name*="graduation" i]',
          'select[name*="graduation" i]',
          'input[id*="graduation" i]',
        ],
        currentCompany: [
          'input[name*="company" i][name*="current" i]',
          'input[name*="employer" i]',
          'input[id*="company" i]',
        ],
        currentTitle: [
          'input[name*="title" i][name*="current" i]',
          'input[name*="position" i]',
          'input[id*="title" i]',
        ],
        salary: [
          'input[name*="salary" i]',
          'input[name*="compensation" i]',
          'input[id*="salary" i]',
        ],
        startDate: [
          'input[name*="start" i][name*="date" i]',
          'input[name*="available" i]',
          'input[id*="start_date" i]',
          'input[type="date"]',
        ],
        coverLetter: [
          'textarea[name*="cover" i]',
          'textarea[name*="letter" i]',
          'textarea[id*="cover" i]',
          'textarea[placeholder*="cover letter" i]',
        ],
        additionalInfo: [
          'textarea[name*="additional" i]',
          'textarea[name*="comments" i]',
          'textarea[id*="additional" i]',
        ],
        resume: [
          'input[type="file"][name*="resume" i]',
          'input[type="file"][id*="resume" i]',
          'input[type="file"][name*="cv" i]',
          'input[type="file"][accept*="pdf"]',
        ],
        coverLetterFile: [
          'input[type="file"][name*="cover" i]',
          'input[type="file"][id*="cover" i]',
        ],
      },
    };
  }

  /**
   * Detect application forms on the page
   * @returns {Array<Object>} Array of detected forms with metadata
   */
  detectForms() {
    console.log('[FormDetector] Scanning page for application forms...');
    
    const forms = [];
    const formElements = this.findFormElements();

    for (const formElement of formElements) {
      const formData = this.analyzeForm(formElement);
      if (formData.isApplicationForm) {
        forms.push(formData);
      }
    }

    console.log(`[FormDetector] Found ${forms.length} application form(s)`);
    return forms;
  }

  /**
   * Find all potential form elements
   * @returns {Array<Element>}
   */
  findFormElements() {
    const forms = [];
    
    // Try each selector pattern
    for (const selector of this.formPatterns.formSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        forms.push(...Array.from(elements));
      } catch (e) {
        console.warn(`[FormDetector] Invalid selector: ${selector}`, e);
      }
    }

    // Also check for forms without specific identifiers
    const allForms = document.querySelectorAll('form');
    for (const form of allForms) {
      if (!forms.includes(form)) {
        // Check if form has job application indicators
        const formHTML = form.innerHTML.toLowerCase();
        if (
          formHTML.includes('apply') ||
          formHTML.includes('application') ||
          formHTML.includes('submit resume') ||
          formHTML.includes('join our team')
        ) {
          forms.push(form);
        }
      }
    }

    return forms;
  }

  /**
   * Analyze a form to determine if it's an application form
   * @param {Element} formElement
   * @returns {Object} Form metadata
   */
  analyzeForm(formElement) {
    const fields = this.detectFields(formElement);
    const fieldTypes = Object.keys(fields);

    // Scoring system to determine if it's an application form
    let score = 0;
    const requiredFields = ['email']; // Must have email
    const commonFields = ['firstName', 'lastName', 'fullName', 'phone', 'resume'];
    
    // Must have email
    if (!fieldTypes.includes('email')) {
      return { isApplicationForm: false, score: 0, fields: {} };
    }
    score += 10;

    // Check for common application fields
    for (const field of commonFields) {
      if (fieldTypes.includes(field)) {
        score += 5;
      }
    }

    // Check for job-specific fields
    const jobFields = ['workAuthorization', 'yearsOfExperience', 'educationLevel', 'coverLetter', 'resume'];
    for (const field of jobFields) {
      if (fieldTypes.includes(field)) {
        score += 10;
      }
    }

    const isApplicationForm = score >= 20; // Threshold for classification

    return {
      isApplicationForm,
      score,
      formElement,
      fields,
      fieldCount: fieldTypes.length,
      action: formElement.action || '',
      method: formElement.method || 'post',
    };
  }

  /**
   * Detect all fields in a form
   * @param {Element} formElement
   * @returns {Object} Map of field names to elements
   */
  detectFields(formElement) {
    const fields = {};

    for (const [fieldName, selectors] of Object.entries(this.formPatterns.fieldPatterns)) {
      for (const selector of selectors) {
        try {
          const element = formElement.querySelector(selector);
          if (element && this.isVisible(element) && !element.disabled) {
            fields[fieldName] = {
              element,
              type: this.getFieldType(element),
              required: element.required || element.hasAttribute('aria-required'),
              name: element.name || element.id,
              label: this.getFieldLabel(element),
            };
            break; // Found the field, stop searching
          }
        } catch (e) {
          // Invalid selector, continue
        }
      }
    }

    return fields;
  }

  /**
   * Get the type of form field
   * @param {Element} element
   * @returns {string}
   */
  getFieldType(element) {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'input') {
      return element.type || 'text';
    } else if (tagName === 'select') {
      return 'select';
    } else if (tagName === 'textarea') {
      return 'textarea';
    }
    
    return 'unknown';
  }

  /**
   * Get the label text for a field
   * @param {Element} element
   * @returns {string}
   */
  getFieldLabel(element) {
    // Try aria-label
    if (element.hasAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }

    // Try associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.textContent.trim();
      }
    }

    // Try parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent.trim();
    }

    // Try placeholder
    if (element.placeholder) {
      return element.placeholder;
    }

    // Try previous sibling label
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === 'LABEL') {
        return sibling.textContent.trim();
      }
      sibling = sibling.previousElementSibling;
    }

    return element.name || element.id || 'Unknown';
  }

  /**
   * Check if element is visible
   * @param {Element} element
   * @returns {boolean}
   */
  isVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return false;
    }

    return true;
  }

  /**
   * Get field summary for a form (for confirmation dialog)
   * @param {Object} formData
   * @returns {Object}
   */
  getFieldSummary(formData) {
    const summary = {
      total: Object.keys(formData.fields).length,
      required: 0,
      optional: 0,
      byType: {
        text: 0,
        email: 0,
        tel: 0,
        select: 0,
        textarea: 0,
        file: 0,
        other: 0,
      },
    };

    for (const field of Object.values(formData.fields)) {
      if (field.required) {
        summary.required++;
      } else {
        summary.optional++;
      }

      const type = field.type;
      if (summary.byType.hasOwnProperty(type)) {
        summary.byType[type]++;
      } else {
        summary.byType.other++;
      }
    }

    return summary;
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormDetector;
}
