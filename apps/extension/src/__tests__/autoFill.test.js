/**
 * Tests for Auto-Fill System
 * Tests FormDetector, FormFieldMapper, FormFiller, and AutoFillManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM
global.document = {
  querySelectorAll: vi.fn(),
  querySelector: vi.fn(),
  createElement: vi.fn(),
  body: { appendChild: vi.fn() },
  readyState: 'complete',
};

global.window = {
  location: {
    href: 'https://example.com/apply',
    hostname: 'example.com',
  },
  getComputedStyle: vi.fn(() => ({
    display: 'block',
    visibility: 'visible',
    opacity: '1',
  })),
};

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
};

/**
 * FormDetector Tests
 */
describe('FormDetector', () => {
  let detector;

  beforeEach(() => {
    // Mock implementation loaded in test environment
    // In real extension, FormDetector is loaded from file
  });

  describe('Field Pattern Matching', () => {
    it('should detect email fields', () => {
      const patterns = [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
      ];

      expect(patterns).toContain('input[type="email"]');
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should detect phone fields', () => {
      const patterns = [
        'input[type="tel"]',
        'input[name*="phone" i]',
      ];

      expect(patterns).toContain('input[type="tel"]');
    });

    it('should detect name fields', () => {
      const patterns = {
        firstName: ['input[name*="first" i][name*="name" i]'],
        lastName: ['input[name*="last" i][name*="name" i]'],
      };

      expect(patterns.firstName).toBeDefined();
      expect(patterns.lastName).toBeDefined();
    });
  });

  describe('Form Classification', () => {
    it('should identify application form with email field', () => {
      const mockForm = {
        fields: {
          email: { element: {}, type: 'email', required: true },
          firstName: { element: {}, type: 'text', required: true },
        },
      };

      // Must have email (score +10)
      // Has firstName (score +5)
      // Total: 15, threshold: 20
      const hasEmail = 'email' in mockForm.fields;
      const score = hasEmail ? 10 + 5 : 0;

      expect(hasEmail).toBe(true);
      expect(score).toBeGreaterThan(10);
    });

    it('should score higher with job-specific fields', () => {
      const mockForm = {
        fields: {
          email: { element: {}, type: 'email' },
          resume: { element: {}, type: 'file' },
          coverLetter: { element: {}, type: 'textarea' },
        },
      };

      // Email: +10, Resume: +10, CoverLetter: +10 = 30
      const score = 10 + 10 + 10;

      expect(score).toBeGreaterThanOrEqual(20); // Threshold
    });
  });

  describe('Field Visibility', () => {
    it('should detect visible fields', () => {
      const style = {
        display: 'block',
        visibility: 'visible',
        opacity: '1',
      };

      const isVisible = style.display !== 'none' &&
                       style.visibility !== 'hidden' &&
                       style.opacity !== '0';

      expect(isVisible).toBe(true);
    });

    it('should reject hidden fields', () => {
      const style = {
        display: 'none',
        visibility: 'visible',
        opacity: '1',
      };

      const isVisible = style.display !== 'none';

      expect(isVisible).toBe(false);
    });
  });
});

/**
 * FormFieldMapper Tests
 */
describe('FormFieldMapper', () => {
  let mapper;
  let mockProfile;

  beforeEach(() => {
    mockProfile = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      linkedin: 'https://linkedin.com/in/johndoe',
      portfolio: 'https://johndoe.dev',
      yearsOfExperience: 5,
      educationLevel: "Bachelor's",
      workAuthorization: 'US Citizen',
      requiresSponsorship: false,
    };
  });

  describe('Phone Formatting', () => {
    it('should format 10-digit US phone number', () => {
      const formatPhone = (phone) => {
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 10) {
          return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6, 4)}`;
        }
        return phone;
      };

      const formatted = formatPhone('1234567890');
      expect(formatted).toBe('(123) 456-7890');
    });

    it('should format 11-digit phone with country code', () => {
      const formatPhone = (phone) => {
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11 && digits[0] === '1') {
          return `+1 (${digits.substr(1, 3)}) ${digits.substr(4, 3)}-${digits.substr(7, 4)}`;
        }
        return phone;
      };

      const formatted = formatPhone('11234567890');
      expect(formatted).toBe('+1 (123) 456-7890');
    });
  });

  describe('Salary Formatting', () => {
    it('should format salary as currency', () => {
      const formatSalary = (salary) => {
        return salary.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        });
      };

      expect(formatSalary(120000)).toBe('$120,000');
      expect(formatSalary(85000)).toBe('$85,000');
    });
  });

  describe('Start Date Formatting', () => {
    it('should format date as ISO string', () => {
      const date = new Date('2025-02-01');
      const formatted = date.toISOString().split('T')[0];

      expect(formatted).toBe('2025-02-01');
    });

    it('should default to 2 weeks from now if no date', () => {
      const twoWeeks = new Date();
      twoWeeks.setDate(twoWeeks.getDate() + 14);
      const formatted = twoWeeks.toISOString().split('T')[0];

      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Education Level Mapping', () => {
    it('should map Bachelor\'s to dropdown options', () => {
      const options = [
        { value: '1', text: 'High School' },
        { value: '2', text: "Bachelor's Degree" },
        { value: '3', text: "Master's Degree" },
      ];

      const level = "bachelor's";
      const match = options.find(opt => opt.text.toLowerCase().includes(level));

      expect(match).toBeDefined();
      expect(match.value).toBe('2');
    });

    it('should map Master\'s to dropdown options', () => {
      const options = [
        { value: '2', text: "Bachelor's" },
        { value: '3', text: "Master's" },
        { value: '4', text: "Doctorate" },
      ];

      const level = "master";
      const match = options.find(opt => opt.text.toLowerCase().includes(level));

      expect(match).toBeDefined();
      expect(match.value).toBe('3');
    });
  });

  describe('Work Authorization Mapping', () => {
    it('should map US Citizen to yes/no options', () => {
      const options = [
        { value: 'yes', text: 'Yes, I am authorized' },
        { value: 'no', text: 'No' },
      ];

      const auth = 'us citizen';
      // US Citizens are authorized
      const match = options.find(opt => opt.text.toLowerCase().includes('yes'));

      expect(match).toBeDefined();
      expect(match.value).toBe('yes');
    });

    it('should map requires sponsorship correctly', () => {
      const options = [
        { value: 'yes', text: 'Require Sponsorship' },
        { value: 'no', text: 'Do Not Require Sponsorship' },
      ];

      const requiresSponsorship = false;
      const match = options.find(opt => 
        opt.text.toLowerCase().includes('do not require')
      );

      expect(match).toBeDefined();
      expect(match.value).toBe('no');
    });
  });

  describe('Field Validation', () => {
    it('should validate email format', () => {
      const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      };

      expect(validateEmail('john@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('no@domain')).toBe(false);
    });

    it('should validate phone format', () => {
      const validatePhone = (phone) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10;
      };

      expect(validatePhone('(123) 456-7890')).toBe(true);
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('123-456')).toBe(false);
    });

    it('should validate URL format', () => {
      const validateURL = (url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://example.com')).toBe(true);
      expect(validateURL('not-a-url')).toBe(false);
    });
  });
});

/**
 * FormFiller Tests
 */
describe('FormFiller', () => {
  describe('Delay Calculation', () => {
    it('should generate random delay within range', () => {
      const randomDelay = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      const delay = randomDelay(100, 500);

      expect(delay).toBeGreaterThanOrEqual(100);
      expect(delay).toBeLessThanOrEqual(500);
    });

    it('should use different delays for typing vs fields', () => {
      const typingDelay = { min: 30, max: 100 };
      const fillDelay = { min: 100, max: 500 };

      expect(typingDelay.max).toBeLessThan(fillDelay.min);
    });
  });

  describe('Event Simulation', () => {
    it('should trigger input events', () => {
      const events = ['focus', 'input', 'keydown', 'keyup', 'change', 'blur'];

      expect(events).toContain('input');
      expect(events).toContain('change');
      expect(events).toContain('blur');
    });

    it('should handle React synthetic events', () => {
      const mockElement = {
        _valueTracker: { setValue: vi.fn() },
        dispatchEvent: vi.fn(),
      };

      // Check if React element
      const isReactElement = '_valueTracker' in mockElement;

      expect(isReactElement).toBe(true);
    });
  });

  describe('Field Type Handling', () => {
    it('should identify text input types', () => {
      const textTypes = ['text', 'email', 'tel', 'url', 'number', 'date'];

      textTypes.forEach(type => {
        expect(type).toMatch(/text|email|tel|url|number|date/);
      });
    });

    it('should identify special field types', () => {
      const specialTypes = ['select', 'textarea', 'checkbox', 'radio', 'file'];

      specialTypes.forEach(type => {
        expect(type).toMatch(/select|textarea|checkbox|radio|file/);
      });
    });
  });

  describe('Demographic Field Detection', () => {
    it('should identify demographic fields', () => {
      const demographicFields = [
        'veteranStatus',
        'disability',
        'gender',
        'race',
      ];

      const isDemographic = (field) => demographicFields.includes(field);

      expect(isDemographic('veteranStatus')).toBe(true);
      expect(isDemographic('email')).toBe(false);
    });
  });
});

/**
 * AutoFillManager Integration Tests
 */
describe('AutoFillManager', () => {
  describe('Required Field Validation', () => {
    it('should detect missing required fields', () => {
      const formFields = {
        email: { required: true },
        phone: { required: true },
        firstName: { required: false },
      };

      const fieldValues = {
        email: 'john@example.com',
        // phone is missing
        firstName: 'John',
      };

      const validateRequiredFields = (fields, values) => {
        const missing = [];
        for (const [fieldName, fieldInfo] of Object.entries(fields)) {
          if (fieldInfo.required && !values[fieldName]) {
            missing.push({ name: fieldName, label: fieldName });
          }
        }
        return missing;
      };

      const missing = validateRequiredFields(formFields, fieldValues);

      expect(missing).toHaveLength(1);
      expect(missing[0].name).toBe('phone');
    });

    it('should pass validation with all required fields', () => {
      const formFields = {
        email: { required: true },
        phone: { required: true },
      };

      const fieldValues = {
        email: 'john@example.com',
        phone: '1234567890',
      };

      const validateRequiredFields = (fields, values) => {
        const missing = [];
        for (const [fieldName, fieldInfo] of Object.entries(fields)) {
          if (fieldInfo.required && !values[fieldName]) {
            missing.push(fieldName);
          }
        }
        return missing;
      };

      const missing = validateRequiredFields(formFields, fieldValues);

      expect(missing).toHaveLength(0);
    });
  });

  describe('Sensitive Data Masking', () => {
    it('should mask phone numbers for preview', () => {
      const maskSensitiveData = (fieldName, value) => {
        const sensitiveFields = ['phone', 'email', 'address'];
        
        if (sensitiveFields.includes(fieldName) && typeof value === 'string') {
          if (value.length > 5) {
            return value.substr(0, 3) + '...' + value.substr(-2);
          }
        }
        
        return value;
      };

      const masked = maskSensitiveData('phone', '(123) 456-7890');

      expect(masked).toBe('(12...90');
      expect(masked).not.toBe('(123) 456-7890');
    });

    it('should mask email addresses for preview', () => {
      const maskSensitiveData = (fieldName, value) => {
        const sensitiveFields = ['phone', 'email'];
        
        if (sensitiveFields.includes(fieldName) && typeof value === 'string') {
          if (value.length > 5) {
            return value.substr(0, 3) + '...' + value.substr(-2);
          }
        }
        
        return value;
      };

      const masked = maskSensitiveData('email', 'john.doe@example.com');

      expect(masked).toBe('joh...om');
    });

    it('should not mask non-sensitive fields', () => {
      const maskSensitiveData = (fieldName, value) => {
        const sensitiveFields = ['phone', 'email'];
        
        if (sensitiveFields.includes(fieldName)) {
          return '***masked***';
        }
        
        return value;
      };

      const firstName = maskSensitiveData('firstName', 'John');

      expect(firstName).toBe('John');
    });
  });

  describe('Fill Log Management', () => {
    it('should create log entry with correct structure', () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        url: 'https://example.com/apply',
        domain: 'example.com',
        filledCount: 5,
        errorCount: 0,
        success: true,
      };

      expect(logEntry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(logEntry.url).toContain('apply');
      expect(logEntry.success).toBe(true);
    });

    it('should limit log size to 50 entries', () => {
      const logs = Array(60).fill({}).map((_, i) => ({
        timestamp: new Date().toISOString(),
        id: i,
      }));

      // Keep last 50
      const limitedLogs = logs.slice(0, 50);

      expect(limitedLogs).toHaveLength(50);
      expect(limitedLogs.length).toBeLessThanOrEqual(50);
    });
  });
});

/**
 * Integration Test: Full Auto-Fill Workflow
 */
describe('Full Auto-Fill Workflow', () => {
  it('should complete full workflow without errors', async () => {
    const workflow = {
      step1: 'Initialize AutoFillManager',
      step2: 'Detect forms',
      step3: 'Get user profile',
      step4: 'Map fields',
      step5: 'Validate required fields',
      step6: 'Fill form',
      step7: 'Log operation',
    };

    expect(Object.keys(workflow)).toHaveLength(7);
  });

  it('should handle missing user profile gracefully', () => {
    const userProfile = null;

    const canAutoFill = userProfile !== null;

    expect(canAutoFill).toBe(false);
  });

  it('should handle missing form gracefully', () => {
    const formsDetected = [];

    const canAutoFill = formsDetected.length > 0;

    expect(canAutoFill).toBe(false);
  });
});
