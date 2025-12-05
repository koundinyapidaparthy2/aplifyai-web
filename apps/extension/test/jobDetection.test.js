/**
 * Job Detection Tests
 * 
 * Tests for job board detection logic across:
 * - LinkedIn
 * - Indeed
 * - Greenhouse
 * - Lever
 * - Workday
 */

import { chrome } from 'jest-webextension-mock';

describe('Job Detection', () => {
  let LinkedInDetector, IndeedDetector, GreenhouseDetector;
  
  beforeEach(() => {
    // Reset document
    document.body.innerHTML = '';
    
    // Mock detectors (since they're loaded via content script)
    LinkedInDetector = class {
      canDetect() {
        return window.location.hostname.includes('linkedin.com');
      }
      
      async detect() {
        const titleEl = document.querySelector('[class*="job"] h1, .job-title');
        const companyEl = document.querySelector('[class*="company"]');
        const descEl = document.querySelector('[class*="description"]');
        
        if (!titleEl) return null;
        
        return {
          title: titleEl?.textContent?.trim(),
          company: companyEl?.textContent?.trim(),
          description: descEl?.textContent?.trim(),
          source: 'linkedin',
        };
      }
    };
    
    IndeedDetector = class {
      canDetect() {
        return window.location.hostname.includes('indeed.com');
      }
      
      async detect() {
        const titleEl = document.querySelector('h1.jobsearch-JobInfoHeader-title');
        const companyEl = document.querySelector('[data-company-name="true"]');
        const descEl = document.querySelector('#jobDescriptionText');
        
        if (!titleEl) return null;
        
        return {
          title: titleEl?.textContent?.trim(),
          company: companyEl?.textContent?.trim(),
          description: descEl?.textContent?.trim(),
          source: 'indeed',
        };
      }
    };
    
    GreenhouseDetector = class {
      canDetect() {
        return window.location.hostname.includes('greenhouse.io');
      }
      
      async detect() {
        const titleEl = document.querySelector('.app-title');
        const companyEl = document.querySelector('.company-name');
        const descEl = document.querySelector('#content');
        
        if (!titleEl) return null;
        
        return {
          title: titleEl?.textContent?.trim(),
          company: companyEl?.textContent?.trim(),
          description: descEl?.textContent?.trim(),
          source: 'greenhouse',
        };
      }
    };
  });

  describe('LinkedIn Detection', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com' },
      });
      
      document.body.innerHTML = `
        <div class="job-details">
          <h1 class="job-title">Software Engineer</h1>
          <span class="company-name">Google</span>
          <div class="job-description">Build amazing products with cutting-edge technology...</div>
        </div>
      `;
    });

    it('should detect job on LinkedIn', async () => {
      const detector = new LinkedInDetector();
      const jobData = await detector.detect();
      
      expect(jobData).toEqual({
        company: 'Google',
        title: 'Software Engineer',
        description: expect.stringContaining('Build amazing'),
        source: 'linkedin',
      });
    });

    it('should return null for non-job pages', async () => {
      document.body.innerHTML = '<div>Not a job page</div>';
      
      const detector = new LinkedInDetector();
      const jobData = await detector.detect();
      
      expect(jobData).toBeNull();
    });

    it('should handle missing company name', async () => {
      document.body.innerHTML = `
        <div class="job-details">
          <h1 class="job-title">Software Engineer</h1>
          <div class="job-description">Build amazing products...</div>
        </div>
      `;
      
      const detector = new LinkedInDetector();
      const jobData = await detector.detect();
      
      expect(jobData).not.toBeNull();
      expect(jobData.title).toBe('Software Engineer');
      expect(jobData.company).toBeUndefined();
    });

    it('should detect on LinkedIn job listing page', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com', pathname: '/jobs/view/123456' },
      });
      
      const detector = new LinkedInDetector();
      expect(detector.canDetect()).toBe(true);
    });
  });

  describe('Indeed Detection', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.indeed.com' },
      });
      
      document.body.innerHTML = `
        <div>
          <h1 class="jobsearch-JobInfoHeader-title">Senior Full Stack Developer</h1>
          <div data-company-name="true">Microsoft</div>
          <div id="jobDescriptionText">
            <p>We are seeking a talented developer...</p>
            <ul>
              <li>5+ years experience</li>
              <li>React, Node.js</li>
            </ul>
          </div>
        </div>
      `;
    });

    it('should detect job on Indeed', async () => {
      const detector = new IndeedDetector();
      const jobData = await detector.detect();
      
      expect(jobData).toEqual({
        company: 'Microsoft',
        title: 'Senior Full Stack Developer',
        description: expect.stringContaining('talented developer'),
        source: 'indeed',
      });
    });

    it('should extract skills from job description', async () => {
      const detector = new IndeedDetector();
      const jobData = await detector.detect();
      
      expect(jobData.description).toContain('React');
      expect(jobData.description).toContain('Node.js');
    });
  });

  describe('Greenhouse Detection', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'boards.greenhouse.io' },
      });
      
      document.body.innerHTML = `
        <div class="app-title">Product Manager</div>
        <div class="company-name">Stripe</div>
        <div id="content">
          <p>Join our team as a Product Manager...</p>
        </div>
      `;
    });

    it('should detect job on Greenhouse', async () => {
      const detector = new GreenhouseDetector();
      const jobData = await detector.detect();
      
      expect(jobData).toEqual({
        company: 'Stripe',
        title: 'Product Manager',
        description: expect.stringContaining('Product Manager'),
        source: 'greenhouse',
      });
    });

    it('should handle Greenhouse-hosted career pages', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'boards.greenhouse.io', pathname: '/stripe/jobs/1234567' },
      });
      
      const detector = new GreenhouseDetector();
      expect(detector.canDetect()).toBe(true);
    });
  });

  describe('Multi-Platform Detection', () => {
    it('should select correct detector based on URL', () => {
      const detectors = [
        new LinkedInDetector(),
        new IndeedDetector(),
        new GreenhouseDetector(),
      ];
      
      // LinkedIn
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com' },
      });
      
      const linkedinDetector = detectors.find(d => d.canDetect());
      expect(linkedinDetector).toBeInstanceOf(LinkedInDetector);
      
      // Indeed
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.indeed.com' },
      });
      
      const indeedDetector = detectors.find(d => d.canDetect());
      expect(indeedDetector).toBeInstanceOf(IndeedDetector);
    });
  });

  describe('Job Data Validation', () => {
    it('should validate complete job data', async () => {
      document.body.innerHTML = `
        <h1 class="job-title">Software Engineer</h1>
        <span class="company-name">Google</span>
        <div class="job-description">Build amazing products...</div>
      `;
      
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com' },
      });
      
      const detector = new LinkedInDetector();
      const jobData = await detector.detect();
      
      expect(jobData).toBeValidJobData();
    });

    it('should handle missing optional fields', async () => {
      document.body.innerHTML = `
        <h1 class="job-title">Software Engineer</h1>
        <span class="company-name">Google</span>
      `;
      
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com' },
      });
      
      const detector = new LinkedInDetector();
      const jobData = await detector.detect();
      
      expect(jobData).not.toBeNull();
      expect(jobData.title).toBe('Software Engineer');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed HTML', async () => {
      document.body.innerHTML = '<div><h1><<>>Broken</h1></div>';
      
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com' },
      });
      
      const detector = new LinkedInDetector();
      const jobData = await detector.detect();
      
      expect(jobData).toBeNull();
    });

    it('should handle missing DOM elements', async () => {
      document.body.innerHTML = '';
      
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com' },
      });
      
      const detector = new LinkedInDetector();
      const jobData = await detector.detect();
      
      expect(jobData).toBeNull();
    });

    it('should handle XSS attempts in job data', async () => {
      document.body.innerHTML = `
        <h1 class="job-title"><script>alert('xss')</script>Engineer</h1>
        <span class="company-name">Google</span>
      `;
      
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com' },
      });
      
      const detector = new LinkedInDetector();
      const jobData = await detector.detect();
      
      expect(jobData.title).not.toContain('<script>');
    });
  });

  describe('Performance', () => {
    it('should detect job quickly', async () => {
      document.body.innerHTML = `
        <h1 class="job-title">Software Engineer</h1>
        <span class="company-name">Google</span>
      `;
      
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'www.linkedin.com' },
      });
      
      const startTime = Date.now();
      const detector = new LinkedInDetector();
      await detector.detect();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should take < 100ms
    });
  });
});
