/**
 * Unit Tests for LinkedIn Detector
 */

// Load the detector classes
const fs = require('fs');
const path = require('path');

// Load Base Detector
const baseDetectorCode = fs.readFileSync(
  path.join(__dirname, '../../public/detectors/base-detector.js'),
  'utf8'
);
eval(baseDetectorCode.replace('if (typeof module', 'if (true'));

// Load LinkedIn Detector
const linkedInDetectorCode = fs.readFileSync(
  path.join(__dirname, '../../public/detectors/linkedin-detector.js'),
  'utf8'
);
eval(linkedInDetectorCode.replace('if (typeof module', 'if (true'));

describe('LinkedInDetector', () => {
  let detector;
  let mockDOM;

  beforeEach(() => {
    detector = new LinkedInDetector();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock window.location
    delete window.location;
    window.location = {
      hostname: 'www.linkedin.com',
      pathname: '/jobs/view/12345',
      href: 'https://www.linkedin.com/jobs/view/12345'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isJobBoard', () => {
    it('should return true for LinkedIn job URLs', () => {
      expect(detector.isJobBoard()).toBe(true);
    });

    it('should return false for non-job LinkedIn URLs', () => {
      window.location.pathname = '/feed/';
      expect(detector.isJobBoard()).toBe(false);
    });

    it('should return false for non-LinkedIn URLs', () => {
      window.location.hostname = 'www.example.com';
      expect(detector.isJobBoard()).toBe(false);
    });
  });

  describe('extractJobData', () => {
    beforeEach(() => {
      // Create mock LinkedIn job page DOM
      document.body.innerHTML = `
        <div class="jobs-unified-top-card">
          <div class="jobs-unified-top-card__job-title">
            <h1 class="t-24">Senior Software Engineer</h1>
          </div>
          <div class="jobs-unified-top-card__company-name">
            <a href="/company/example">Example Tech Inc</a>
          </div>
          <div class="jobs-unified-top-card__bullet">San Francisco, CA</div>
          <div class="jobs-unified-top-card__job-insight--highlight">
            $120,000 - $180,000/year
          </div>
          <div class="jobs-unified-top-card__job-insight">Full-time</div>
          <div class="jobs-unified-top-card__applicant-count">
            50 applicants
          </div>
          <div class="jobs-unified-top-card__posted-date">
            Posted 2 days ago
          </div>
        </div>
        <div class="jobs-description__content">
          <p>We are looking for a Senior Software Engineer with expertise in React, Node.js, and AWS.</p>
          <h3>Responsibilities</h3>
          <ul>
            <li>Build scalable web applications</li>
            <li>Lead technical discussions</li>
          </ul>
          <h3>Requirements</h3>
          <ul>
            <li>5+ years of experience with JavaScript</li>
            <li>Experience with React and Node.js</li>
            <li>Knowledge of AWS and Docker</li>
          </ul>
        </div>
        <div class="job-details-skill-match-status-list">
          <div class="job-details-skill-match-status-list__skill">React</div>
          <div class="job-details-skill-match-status-list__skill">Node.js</div>
          <div class="job-details-skill-match-status-list__skill">AWS</div>
        </div>
        <button class="jobs-apply-button" href="/jobs/apply/12345">Apply</button>
      `;
    });

    it('should extract job title correctly', async () => {
      const data = await detector.extractJobData();
      expect(data.jobTitle).toBe('Senior Software Engineer');
    });

    it('should extract company name correctly', async () => {
      const data = await detector.extractJobData();
      expect(data.company).toBe('Example Tech Inc');
    });

    it('should extract location correctly', async () => {
      const data = await detector.extractJobData();
      expect(data.location).toBe('San Francisco, CA');
    });

    it('should extract salary information', async () => {
      const data = await detector.extractJobData();
      expect(data.salary).toEqual({
        min: 120000,
        max: 180000,
        currency: 'USD',
        raw: '$120,000 - $180,000'
      });
    });

    it('should extract job description', async () => {
      const data = await detector.extractJobData();
      expect(data.description).toContain('Senior Software Engineer');
      expect(data.description).toContain('React, Node.js, and AWS');
    });

    it('should extract skills from skill tags', async () => {
      const data = await detector.extractJobData();
      expect(data.skills).toContain('React');
      expect(data.skills).toContain('Node.js');
      expect(data.skills).toContain('AWS');
    });

    it('should extract job type', async () => {
      const data = await detector.extractJobData();
      expect(data.jobType).toBe('Full-time');
    });

    it('should extract applicant count', async () => {
      const data = await detector.extractJobData();
      expect(data.applicants).toBe(50);
    });

    it('should extract posted date', async () => {
      const data = await detector.extractJobData();
      expect(data.postedDate).toBe('Posted 2 days ago');
    });

    it('should include application URL', async () => {
      const data = await detector.extractJobData();
      expect(data.applicationUrl).toContain('linkedin.com/jobs');
    });

    it('should detect remote jobs', async () => {
      document.querySelector('.jobs-unified-top-card__bullet').textContent = 'Remote';
      const data = await detector.extractJobData();
      expect(data.remote).toBe(true);
    });

    it('should handle missing optional fields gracefully', async () => {
      // Remove salary and applicant count
      document.querySelector('.jobs-unified-top-card__job-insight--highlight').remove();
      document.querySelector('.jobs-unified-top-card__applicant-count').remove();

      const data = await detector.extractJobData();
      expect(data.salary).toBeNull();
      expect(data.applicants).toBeNull();
      expect(data.jobTitle).toBe('Senior Software Engineer'); // Core fields still work
    });
  });

  describe('parseJobType', () => {
    it('should parse full-time correctly', () => {
      expect(detector.parseJobType('Full-time')).toBe('Full-time');
      expect(detector.parseJobType('full time position')).toBe('Full-time');
    });

    it('should parse part-time correctly', () => {
      expect(detector.parseJobType('Part-time')).toBe('Part-time');
      expect(detector.parseJobType('part time role')).toBe('Part-time');
    });

    it('should parse contract correctly', () => {
      expect(detector.parseJobType('Contract position')).toBe('Contract');
    });

    it('should parse internship correctly', () => {
      expect(detector.parseJobType('Summer Internship')).toBe('Internship');
    });

    it('should return null for unknown types', () => {
      expect(detector.parseJobType('Unknown type')).toBeNull();
      expect(detector.parseJobType('')).toBeNull();
    });
  });

  describe('parseSeniority', () => {
    it('should parse entry level', () => {
      expect(detector.parseSeniority('Entry level')).toBe('Entry level');
    });

    it('should parse mid-senior level', () => {
      expect(detector.parseSeniority('Mid-Senior level')).toBe('Mid-Senior level');
    });

    it('should parse director', () => {
      expect(detector.parseSeniority('Director level')).toBe('Director');
    });

    it('should return null for unknown levels', () => {
      expect(detector.parseSeniority('Unknown')).toBeNull();
    });
  });

  describe('parseApplicantCount', () => {
    it('should parse applicant count correctly', () => {
      expect(detector.parseApplicantCount('50 applicants')).toBe(50);
      expect(detector.parseApplicantCount('100+ applicants')).toBe(100);
    });

    it('should return null for invalid input', () => {
      expect(detector.parseApplicantCount('No data')).toBeNull();
      expect(detector.parseApplicantCount('')).toBeNull();
    });
  });

  describe('isRemote', () => {
    it('should detect remote from location', () => {
      expect(detector.isRemote('Remote', '')).toBe(true);
      expect(detector.isRemote('Work from home', '')).toBe(true);
    });

    it('should detect remote from description', () => {
      expect(detector.isRemote('', 'This is a remote position')).toBe(true);
      expect(detector.isRemote('', 'WFH allowed')).toBe(true);
    });

    it('should return false for non-remote jobs', () => {
      expect(detector.isRemote('San Francisco, CA', 'On-site only')).toBe(false);
    });
  });

  describe('caching', () => {
    it('should cache extracted data', async () => {
      document.body.innerHTML = `
        <div class="jobs-unified-top-card__job-title">
          <h1>Test Job</h1>
        </div>
        <div class="jobs-unified-top-card__company-name">Test Company</div>
        <div class="jobs-description__content">Test description</div>
      `;

      const data1 = await detector.detect();
      const data2 = await detector.detect();

      expect(data1).toEqual(data2);
      expect(detector.cache).not.toBeNull();
    });

    it('should clear cache after duration', async () => {
      document.body.innerHTML = `
        <div class="jobs-unified-top-card__job-title">
          <h1>Test Job</h1>
        </div>
        <div class="jobs-unified-top-card__company-name">Test Company</div>
        <div class="jobs-description__content">Test description</div>
      `;

      await detector.detect();
      expect(detector.cache).not.toBeNull();

      // Manually expire cache
      detector.cacheTime = Date.now() - 10000;
      
      const cachedData = detector.getCachedData();
      expect(cachedData).toBeNull();
    });
  });
});
