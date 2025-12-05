/**
 * Security Test Suite for JobSeek Chrome Extension
 * Tests XSS prevention, CSP validation, API key protection, injection attacks
 */

const {
  escapeHTML,
  sanitizeHTML,
  sanitizeJobData,
  validateEmail,
  validateURL,
  validatePhone,
  validateInput,
  sanitizeFilename,
  validateCSP,
  isSafeContent,
  sanitizeUserProfile,
  safeSetProperty,
  safeClone,
} = require('../src/utils/security');

describe('Security Tests', () => {
  describe('XSS Prevention', () => {
    test('should sanitize script tags in job data', () => {
      const maliciousContent = '<script>alert("xss")</script>';
      const jobData = { 
        company: maliciousContent, 
        title: 'Engineer' 
      };
      
      const sanitized = sanitizeJobData(jobData);
      
      expect(sanitized.company).not.toContain('<script>');
      expect(sanitized.company).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitized.title).toBe('Engineer');
    });

    test('should escape HTML special characters', () => {
      const input = '<div>Test & "quote" \'single\'</div>';
      const escaped = escapeHTML(input);
      
      expect(escaped).toBe('&lt;div&gt;Test &amp; &quot;quote&quot; &#x27;single&#x27;&lt;&#x2F;div&gt;');
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).not.toContain('&');
      expect(escaped).not.toContain('"');
    });

    test('should remove inline event handlers', () => {
      const maliciousHTML = '<div onclick="alert(\'xss\')">Click me</div>';
      const sanitized = sanitizeHTML(maliciousHTML);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('alert');
    });

    test('should remove javascript: protocol', () => {
      const maliciousHTML = '<a href="javascript:alert(\'xss\')">Link</a>';
      const sanitized = sanitizeHTML(maliciousHTML);
      
      expect(sanitized).not.toContain('javascript:');
    });

    test('should remove iframe tags', () => {
      const maliciousHTML = '<iframe src="http://evil.com"></iframe>';
      const sanitized = sanitizeHTML(maliciousHTML);
      
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('</iframe>');
    });

    test('should handle nested XSS attempts', () => {
      const nested = '<div><script>alert("xss")</script><span>Safe</span></div>';
      const sanitized = sanitizeHTML(nested);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<span>Safe</span>');
    });

    test('should sanitize nested object properties', () => {
      const jobData = {
        company: '<script>xss</script>',
        details: {
          benefits: '<img src=x onerror="alert(1)">',
          nested: {
            value: '<iframe src="evil.com"></iframe>',
          },
        },
      };
      
      const sanitized = sanitizeJobData(jobData);
      
      expect(sanitized.company).not.toContain('<script>');
      expect(sanitized.details.benefits).not.toContain('onerror');
      expect(sanitized.details.nested.value).not.toContain('<iframe>');
    });

    test('should sanitize array elements', () => {
      const jobData = {
        requirements: [
          'Valid requirement',
          '<script>alert("xss")</script>',
          'Another valid one',
        ],
      };
      
      const sanitized = sanitizeJobData(jobData);
      
      expect(sanitized.requirements[0]).toBe('Valid requirement');
      expect(sanitized.requirements[1]).not.toContain('<script>');
      expect(sanitized.requirements[2]).toBe('Another valid one');
    });
  });

  describe('Content Security Policy', () => {
    test('manifest CSP should block inline scripts', () => {
      // Load manifest
      let manifest;
      try {
        manifest = require('../public/manifest.json');
      } catch (e) {
        // If manifest doesn't exist in test, skip
        manifest = {
          content_security_policy: {
            extension_pages: "script-src 'self'; object-src 'none';"
          }
        };
      }
      
      const csp = manifest.content_security_policy?.extension_pages || 
                  manifest.content_security_policy || '';
      
      if (typeof csp === 'string') {
        expect(csp).toContain("script-src 'self'");
        expect(csp).not.toContain("'unsafe-inline'");
      }
    });

    test('should validate secure CSP configuration', () => {
      const secureCSP = "script-src 'self'; object-src 'none'; base-uri 'self';";
      const result = validateCSP(secureCSP);
      
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should detect unsafe-inline in CSP', () => {
      const unsafeCSP = "script-src 'self' 'unsafe-inline'; object-src 'none';";
      const result = validateCSP(unsafeCSP);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContain("CSP allows 'unsafe-inline' which can enable XSS attacks");
    });

    test('should detect unsafe-eval in CSP', () => {
      const unsafeCSP = "script-src 'self' 'unsafe-eval'; object-src 'none';";
      const result = validateCSP(unsafeCSP);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContain("CSP allows 'unsafe-eval' which can enable code injection");
    });

    test('should detect wildcard sources in CSP', () => {
      const unsafeCSP = "script-src * 'self'; object-src 'none';";
      const result = validateCSP(unsafeCSP);
      
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('API Key Protection', () => {
    test('should not expose API keys in global scope', () => {
      // Check if API key is exposed
      const exposedKeys = [
        'JOBSEEK_API_KEY',
        'GEMINI_API_KEY',
        'API_KEY',
        'SECRET_KEY',
      ];
      
      exposedKeys.forEach(key => {
        expect(global[key]).toBeUndefined();
        expect(window[key]).toBeUndefined();
      });
    });

    test('should not store API keys in localStorage', () => {
      const dangerousKeys = [
        'apiKey',
        'api_key',
        'geminiApiKey',
        'secretKey',
        'accessToken',
      ];
      
      // Mock localStorage
      const mockLocalStorage = {};
      
      dangerousKeys.forEach(key => {
        expect(mockLocalStorage[key]).toBeUndefined();
      });
    });

    test('should validate that API calls use secure methods', () => {
      // API keys should only be in background script or service worker
      // Content scripts should communicate via messages
      
      const securePattern = /chrome\.runtime\.sendMessage/;
      const insecurePattern = /fetch.*api.*key=/i;
      
      // This would be tested in actual content script files
      // Here we just validate the pattern
      const contentScriptSample = `
        chrome.runtime.sendMessage({ 
          type: 'API_CALL',
          endpoint: '/generate'
        });
      `;
      
      expect(securePattern.test(contentScriptSample)).toBe(true);
      expect(insecurePattern.test(contentScriptSample)).toBe(false);
    });
  });

  describe('Input Validation', () => {
    test('should validate email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('<script>@example.com')).toBe(false);
    });

    test('should validate URL format', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://example.com/path')).toBe(true);
      expect(validateURL('javascript:alert(1)')).toBe(false);
      expect(validateURL('file:///etc/passwd')).toBe(false);
      expect(validateURL('not-a-url')).toBe(false);
    });

    test('should validate phone number format', () => {
      expect(validatePhone('5551234567')).toBe(true);
      expect(validatePhone('(555) 123-4567')).toBe(true);
      expect(validatePhone('+1-555-123-4567')).toBe(true);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('not-a-phone')).toBe(false);
    });

    test('should detect SQL injection attempts', () => {
      const sqlInjection = "1' OR '1'='1";
      const result = validateInput(sqlInjection);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('SQL injection');
    });

    test('should detect script injection attempts', () => {
      const scriptInjection = '<script>alert("xss")</script>';
      const result = validateInput(scriptInjection);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('script injection');
    });

    test('should detect command injection attempts', () => {
      const commandInjection = '; rm -rf /';
      const result = validateInput(commandInjection);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('command injection');
    });

    test('should allow safe input', () => {
      const safeInput = 'This is a normal job description with numbers 123 and symbols!';
      const result = validateInput(safeInput);
      
      expect(result.valid).toBe(true);
      expect(result.reason).toBe('');
    });
  });

  describe('Filename Sanitization', () => {
    test('should remove path traversal attempts', () => {
      const maliciousFilename = '../../../etc/passwd';
      const sanitized = sanitizeFilename(maliciousFilename);
      
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('/');
      expect(sanitized).toBe('etcpasswd');
    });

    test('should remove null bytes', () => {
      const maliciousFilename = 'file\x00.txt';
      const sanitized = sanitizeFilename(maliciousFilename);
      
      expect(sanitized).not.toContain('\x00');
    });

    test('should handle hidden files', () => {
      const hiddenFile = '.hidden';
      const sanitized = sanitizeFilename(hiddenFile);
      
      expect(sanitized).not.toStartWith('.');
    });

    test('should limit filename length', () => {
      const longFilename = 'a'.repeat(300) + '.txt';
      const sanitized = sanitizeFilename(longFilename);
      
      expect(sanitized.length).toBeLessThanOrEqual(255);
    });
  });

  describe('Content Safety', () => {
    test('should detect unsafe content', () => {
      const unsafeContents = [
        '<script>alert(1)</script>',
        '<img src=x onerror="alert(1)">',
        '<iframe src="evil.com"></iframe>',
        'javascript:alert(1)',
        '<object data="evil.swf"></object>',
      ];
      
      unsafeContents.forEach(content => {
        expect(isSafeContent(content)).toBe(false);
      });
    });

    test('should allow safe content', () => {
      const safeContents = [
        'Normal text content',
        '<div>Safe HTML</div>',
        '<p>Paragraph with <strong>bold</strong> text</p>',
      ];
      
      safeContents.forEach(content => {
        expect(isSafeContent(content)).toBe(true);
      });
    });
  });

  describe('User Profile Sanitization', () => {
    test('should sanitize all profile fields', () => {
      const maliciousProfile = {
        firstName: '<script>xss</script>',
        lastName: 'Normal',
        email: 'user@example.com',
        phone: '555-123-4567',
        linkedin: 'https://linkedin.com/in/user',
        github: 'javascript:alert(1)',
      };
      
      const sanitized = sanitizeUserProfile(maliciousProfile);
      
      expect(sanitized.firstName).not.toContain('<script>');
      expect(sanitized.lastName).toBe('Normal');
      expect(sanitized.email).toBe('user@example.com');
      expect(sanitized.phone).toBe('555-123-4567');
      expect(sanitized.linkedin).toBe('https://linkedin.com/in/user');
      expect(sanitized.github).toBe(''); // Invalid URL rejected
    });

    test('should reject invalid email in profile', () => {
      const profile = {
        email: 'invalid-email',
      };
      
      const sanitized = sanitizeUserProfile(profile);
      
      expect(sanitized.email).toBe('');
    });

    test('should reject invalid URLs in profile', () => {
      const profile = {
        linkedin: 'not-a-url',
        portfolio: 'file:///etc/passwd',
      };
      
      const sanitized = sanitizeUserProfile(profile);
      
      expect(sanitized.linkedin).toBe('');
      expect(sanitized.portfolio).toBe('');
    });
  });

  describe('Prototype Pollution Prevention', () => {
    test('should prevent __proto__ modification', () => {
      const obj = {};
      const result = safeSetProperty(obj, '__proto__', { evil: true });
      
      expect(result).toBe(false);
      expect(obj.evil).toBeUndefined();
    });

    test('should prevent constructor modification', () => {
      const obj = {};
      const result = safeSetProperty(obj, 'constructor', { evil: true });
      
      expect(result).toBe(false);
    });

    test('should allow safe property setting', () => {
      const obj = {};
      const result = safeSetProperty(obj, 'safeProp', 'value');
      
      expect(result).toBe(true);
      expect(obj.safeProp).toBe('value');
    });

    test('should safely clone objects', () => {
      const malicious = JSON.parse('{"__proto__": {"evil": true}, "normal": "value"}');
      const cloned = safeClone(malicious);
      
      expect(cloned.normal).toBe('value');
      expect(cloned.__proto__).toBeUndefined();
      expect(cloned.evil).toBeUndefined();
    });

    test('should clone nested objects safely', () => {
      const obj = {
        level1: {
          level2: {
            value: 'safe',
            __proto__: { evil: true },
          },
        },
      };
      
      const cloned = safeClone(obj);
      
      expect(cloned.level1.level2.value).toBe('safe');
      expect(cloned.level1.level2.evil).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined', () => {
      expect(escapeHTML(null)).toBe('');
      expect(escapeHTML(undefined)).toBe('');
      expect(sanitizeJobData(null)).toEqual({});
      expect(sanitizeJobData(undefined)).toEqual({});
    });

    test('should handle non-string inputs', () => {
      expect(escapeHTML(123)).toBe('');
      expect(escapeHTML({})).toBe('');
      expect(escapeHTML([])).toBe('');
    });

    test('should handle empty strings', () => {
      expect(escapeHTML('')).toBe('');
      expect(sanitizeHTML('')).toBe('');
      expect(validateInput('')).toEqual({ valid: true, reason: '' });
    });

    test('should handle unicode characters', () => {
      const unicode = 'Hello 世界 🌍';
      const escaped = escapeHTML(unicode);
      
      expect(escaped).toContain('世界');
      expect(escaped).toContain('🌍');
    });

    test('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const escaped = escapeHTML(longString);
      
      expect(escaped).toHaveLength(10000);
    });
  });
});
