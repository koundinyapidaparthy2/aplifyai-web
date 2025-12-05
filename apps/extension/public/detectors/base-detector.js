/**
 * Base Detector Class
 * Provides common functionality for all job board detectors
 */

class BaseDetector {
  constructor(name) {
    this.name = name;
    this.cache = null;
    this.cacheTime = null;
    this.CACHE_DURATION = 5000; // 5 seconds
  }

  /**
   * Check if current URL matches this job board
   * @returns {boolean}
   */
  isJobBoard() {
    throw new Error('isJobBoard() must be implemented by subclass');
  }

  /**
   * Extract job data from the page
   * @returns {Object|null}
   */
  extractJobData() {
    throw new Error('extractJobData() must be implemented by subclass');
  }

  /**
   * Get cached data if still valid
   * @returns {Object|null}
   */
  getCachedData() {
    if (this.cache && this.cacheTime && (Date.now() - this.cacheTime < this.CACHE_DURATION)) {
      return this.cache;
    }
    return null;
  }

  /**
   * Cache the extracted data
   * @param {Object} data
   */
  setCachedData(data) {
    this.cache = data;
    this.cacheTime = Date.now();
  }

  /**
   * Clear cached data
   */
  clearCache() {
    this.cache = null;
    this.cacheTime = null;
  }

  /**
   * Safely extract text from element
   * @param {string|Element} selector
   * @param {Element} context
   * @returns {string}
   */
  getTextContent(selector, context = document) {
    try {
      const element = typeof selector === 'string' 
        ? context.querySelector(selector) 
        : selector;
      
      if (!element) return '';
      
      return element.textContent?.trim() || element.innerText?.trim() || '';
    } catch (e) {
      console.warn(`[${this.name}] Error getting text content:`, e);
      return '';
    }
  }

  /**
   * Safely extract attribute from element
   * @param {string} selector
   * @param {string} attribute
   * @param {Element} context
   * @returns {string}
   */
  getAttribute(selector, attribute, context = document) {
    try {
      const element = context.querySelector(selector);
      return element?.getAttribute(attribute) || '';
    } catch (e) {
      console.warn(`[${this.name}] Error getting attribute:`, e);
      return '';
    }
  }

  /**
   * Extract text using multiple selector strategies
   * @param {string[]} selectors
   * @param {Element} context
   * @returns {string}
   */
  getTextWithFallback(selectors, context = document) {
    for (const selector of selectors) {
      const text = this.getTextContent(selector, context);
      if (text) return text;
    }
    return '';
  }

  /**
   * Extract salary information from text
   * @param {string} text
   * @returns {Object|null}
   */
  extractSalary(text) {
    if (!text) return null;

    // Match patterns like: $50k-$80k, $50,000 - $80,000, 50-80K, etc.
    const patterns = [
      /\$?([\d,]+)k?\s*[-–to]+\s*\$?([\d,]+)k?/i,
      /\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/,
      /([\d,]+)k\s*[-–to]+\s*([\d,]+)k/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const min = match[1].replace(/,/g, '');
        const max = match[2].replace(/,/g, '');
        
        return {
          min: parseInt(min) * (text.toLowerCase().includes('k') ? 1000 : 1),
          max: parseInt(max) * (text.toLowerCase().includes('k') ? 1000 : 1),
          currency: text.includes('$') ? 'USD' : null,
          raw: match[0]
        };
      }
    }

    return null;
  }

  /**
   * Extract skills from text or tags
   * @param {string|Element[]} source
   * @returns {string[]}
   */
  extractSkills(source) {
    const skills = new Set();

    if (typeof source === 'string') {
      // Common skill keywords
      const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
        'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL',
        'Git', 'CI/CD', 'Agile', 'REST API', 'GraphQL', 'Machine Learning',
        'TensorFlow', 'PyTorch', 'HTML', 'CSS', 'Vue.js', 'Angular'
      ];

      skillKeywords.forEach(skill => {
        if (source.includes(skill)) {
          skills.add(skill);
        }
      });
    } else if (Array.isArray(source)) {
      // Extract from skill tags/badges
      source.forEach(element => {
        const text = this.getTextContent(element);
        if (text && text.length < 50) {
          skills.add(text);
        }
      });
    }

    return Array.from(skills);
  }

  /**
   * Clean and normalize job description text
   * @param {string} text
   * @returns {string}
   */
  cleanDescription(text) {
    if (!text) return '';

    return text
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n')     // Remove excessive line breaks
      .trim();
  }

  /**
   * Validate extracted job data
   * @param {Object} data
   * @returns {boolean}
   */
  validateJobData(data) {
    if (!data) return false;

    // Must have at least job title and company
    return !!(data.jobTitle && data.company);
  }

  /**
   * Wait for element to appear
   * @param {string} selector
   * @param {number} timeout
   * @returns {Promise<Element|null>}
   */
  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }

  /**
   * Detect job board and extract data
   * @returns {Object|null}
   */
  async detect() {
    try {
      // Check cache first
      const cached = this.getCachedData();
      if (cached) {
        console.log(`[${this.name}] Returning cached data`);
        return cached;
      }

      // Check if we're on a job board
      if (!this.isJobBoard()) {
        return null;
      }

      console.log(`[${this.name}] Job board detected, extracting data...`);

      // Extract job data
      const data = await this.extractJobData();

      // Validate data
      if (!this.validateJobData(data)) {
        console.warn(`[${this.name}] Invalid job data extracted`);
        return null;
      }

      // Add metadata
      const enrichedData = {
        ...data,
        source: this.name,
        url: window.location.href,
        detectedAt: new Date().toISOString()
      };

      // Cache the data
      this.setCachedData(enrichedData);

      console.log(`[${this.name}] Successfully extracted job data:`, enrichedData);
      return enrichedData;

    } catch (error) {
      console.error(`[${this.name}] Error detecting job:`, error);
      return null;
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseDetector;
}
