/**
 * Security Utility Functions
 * Re-exports from centralized @aplifyai/utils with additional extension-specific utilities
 */

// Re-export from centralized package
import {
  escapeHTML,
  sanitizeHTML,
  sanitizeFilename,
  generateSecureToken,
  isSafeContent,
  safeClone,
  isValidEmail as validateEmail,
  isValidURL as validateURL,
  isValidPhone as validatePhone,
} from '@aplifyai/utils';

// Re-export the centralized utilities
export {
  escapeHTML,
  sanitizeHTML,
  sanitizeFilename,
  generateSecureToken,
  isSafeContent,
  safeClone,
  validateEmail,
  validateURL,
  validatePhone,
};

/**
 * Sanitize job data object to prevent XSS
 * @param {object} jobData - Job data object
 * @returns {object} Sanitized job data
 */
function sanitizeJobData(jobData) {
  if (!jobData || typeof jobData !== 'object') {
    return {};
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(jobData)) {
    if (typeof value === 'string') {
      // Escape HTML for all string values
      sanitized[key] = escapeHTML(value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeJobData(value);
    } else if (Array.isArray(value)) {
      // Sanitize array elements
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? escapeHTML(item) : 
        typeof item === 'object' ? sanitizeJobData(item) : item
      );
    } else {
      // Keep non-string, non-object values as is
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate input against common injection patterns
 * @param {string} input - Input to validate
 * @returns {object} Validation result { valid: boolean, reason: string }
 */
function validateInput(input) {
  if (typeof input !== 'string') {
    return { valid: false, reason: 'Input must be a string' };
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(;|\-\-|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return { valid: false, reason: 'Potential SQL injection detected' };
    }
  }

  // Check for script injection
  const scriptPatterns = [
    /<script[^>]*>.*<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ];

  for (const pattern of scriptPatterns) {
    if (pattern.test(input)) {
      return { valid: false, reason: 'Potential script injection detected' };
    }
  }

  // Check for command injection
  const cmdPatterns = [
    /[;&|`$()<>]/,
  ];

  for (const pattern of cmdPatterns) {
    if (pattern.test(input)) {
      return { valid: false, reason: 'Potential command injection detected' };
    }
  }

  return { valid: true, reason: '' };
}

/**
 * Hash sensitive data (for storage)
 * @param {string} data - Data to hash
 * @returns {Promise<string>} Hashed data
 */
async function hashData(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate Content Security Policy
 * @param {string} csp - CSP string
 * @returns {object} Validation result
 */
function validateCSP(csp) {
  if (typeof csp !== 'string') {
    return { valid: false, issues: ['CSP must be a string'] };
  }

  const issues = [];

  // Check for unsafe-inline
  if (csp.includes("'unsafe-inline'")) {
    issues.push("CSP allows 'unsafe-inline' which can enable XSS attacks");
  }

  // Check for unsafe-eval
  if (csp.includes("'unsafe-eval'")) {
    issues.push("CSP allows 'unsafe-eval' which can enable code injection");
  }

  // Check for wildcard sources
  if (csp.includes('* ') || csp.includes(' *;') || csp.endsWith(' *')) {
    issues.push("CSP uses wildcard (*) which allows any source");
  }

  // Check if script-src is defined
  if (!csp.includes('script-src')) {
    issues.push("CSP should define script-src directive");
  }

  // Check if object-src is restricted
  if (!csp.includes("object-src 'none'") && !csp.includes('object-src')) {
    issues.push("CSP should restrict object-src to prevent plugin-based attacks");
  }

  return {
    valid: issues.length === 0,
    issues: issues,
  };
}

/**
 * Sanitize user profile data
 * @param {object} profile - User profile object
 * @returns {object} Sanitized profile
 */
function sanitizeUserProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return {};
  }

  return {
    firstName: profile.firstName ? escapeHTML(profile.firstName) : '',
    lastName: profile.lastName ? escapeHTML(profile.lastName) : '',
    email: profile.email && validateEmail(profile.email) ? profile.email : '',
    phone: profile.phone && validatePhone(profile.phone) ? profile.phone : '',
    linkedin: profile.linkedin && validateURL(profile.linkedin) ? profile.linkedin : '',
    github: profile.github && validateURL(profile.github) ? profile.github : '',
    portfolio: profile.portfolio && validateURL(profile.portfolio) ? profile.portfolio : '',
    resume: profile.resume ? sanitizeFilename(profile.resume) : '',
  };
}

/**
 * Prevent prototype pollution
 * @param {object} obj - Object to check
 * @param {string} key - Key to set
 * @param {any} value - Value to set
 * @returns {boolean} True if safe to set
 */
function safeSetProperty(obj, key, value) {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  if (dangerousKeys.includes(key)) {
    console.warn(`Attempted to set dangerous property: ${key}`);
    return false;
  }

  obj[key] = value;
  return true;
}

module.exports = {
  escapeHTML,
  sanitizeHTML,
  sanitizeJobData,
  validateEmail,
  validateURL,
  validatePhone,
  validateInput,
  sanitizeFilename,
  generateSecureToken,
  hashData,
  validateCSP,
  isSafeContent,
  sanitizeUserProfile,
  safeSetProperty,
  safeClone,
};
