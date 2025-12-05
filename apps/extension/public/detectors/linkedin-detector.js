/**
 * LinkedIn Job Detector
 * Detects and extracts job information from LinkedIn job postings
 */

class LinkedInDetector extends BaseDetector {
  constructor() {
    super('LinkedIn');
  }

  /**
   * Check if current URL is a LinkedIn job posting
   * @returns {boolean}
   */
  isJobBoard() {
    return window.location.hostname.includes('linkedin.com') && 
           window.location.pathname.includes('/jobs/');
  }

  /**
   * Extract job data from LinkedIn
   * @returns {Promise<Object|null>}
   */
  async extractJobData() {
    try {
      // Wait for job details to load
      await this.waitForElement('.jobs-unified-top-card__job-title', 3000);

      // Job title selectors (LinkedIn has multiple layouts)
      const jobTitle = this.getTextWithFallback([
        '.jobs-unified-top-card__job-title',
        '.job-details-jobs-unified-top-card__job-title',
        'h1.t-24',
        '.jobs-details-top-card__job-title'
      ]);

      // Company name
      const company = this.getTextWithFallback([
        '.jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name',
        '.job-details-jobs-unified-top-card__company-name a',
        '.jobs-details-top-card__company-name'
      ]);

      // Location
      const location = this.getTextWithFallback([
        '.jobs-unified-top-card__bullet',
        '.jobs-unified-top-card__workplace-type',
        '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
        '.jobs-details-top-card__location'
      ]);

      // Salary information (not always available)
      const salaryText = this.getTextWithFallback([
        '.jobs-unified-top-card__job-insight--highlight',
        '.job-details-jobs-unified-top-card__job-insight--highlight',
        '.salary'
      ]);
      const salary = this.extractSalary(salaryText);

      // Job description
      let description = '';
      const descriptionElement = document.querySelector('.jobs-description__content');
      if (descriptionElement) {
        // Remove "Show more" button and other UI elements
        const clone = descriptionElement.cloneNode(true);
        const buttons = clone.querySelectorAll('button, .jobs-description__footer');
        buttons.forEach(btn => btn.remove());
        description = this.cleanDescription(clone.textContent);
      }

      // Extract skills from the description or skill tags
      const skillElements = Array.from(
        document.querySelectorAll('.job-details-skill-match-status-list__skill')
      );
      let skills = this.extractSkills(skillElements);
      
      // Fallback: extract from description if no skill tags
      if (skills.length === 0 && description) {
        skills = this.extractSkills(description);
      }

      // Application URL
      const applyButton = document.querySelector('.jobs-apply-button');
      const applicationUrl = applyButton?.getAttribute('href') || window.location.href;

      // Job type (Full-time, Part-time, Contract, etc.)
      const jobTypeText = this.getTextWithFallback([
        '.jobs-unified-top-card__job-insight:not(.jobs-unified-top-card__job-insight--highlight)',
        '.job-details-jobs-unified-top-card__job-insight'
      ]);

      // Seniority level
      const seniorityText = document.querySelector('.jobs-description__seniority-item')?.textContent || '';

      // Number of applicants
      const applicantsText = this.getTextWithFallback([
        '.jobs-unified-top-card__applicant-count',
        '.num-applicants__caption'
      ]);

      // Posted time
      const postedTime = this.getTextWithFallback([
        '.jobs-unified-top-card__posted-date',
        '.jobs-details-top-card__posted-date'
      ]);

      return {
        jobTitle: jobTitle || null,
        company: company || null,
        location: location || null,
        salary: salary,
        description: description || null,
        skills: skills,
        applicationUrl: applicationUrl,
        jobType: this.parseJobType(jobTypeText),
        seniorityLevel: this.parseSeniority(seniorityText),
        applicants: this.parseApplicantCount(applicantsText),
        postedDate: postedTime || null,
        remote: this.isRemote(location, description),
      };

    } catch (error) {
      console.error('[LinkedIn] Error extracting job data:', error);
      throw error;
    }
  }

  /**
   * Parse job type from text
   * @param {string} text
   * @returns {string|null}
   */
  parseJobType(text) {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('full-time') || lowerText.includes('full time')) return 'Full-time';
    if (lowerText.includes('part-time') || lowerText.includes('part time')) return 'Part-time';
    if (lowerText.includes('contract')) return 'Contract';
    if (lowerText.includes('internship')) return 'Internship';
    if (lowerText.includes('temporary')) return 'Temporary';
    
    return null;
  }

  /**
   * Parse seniority level
   * @param {string} text
   * @returns {string|null}
   */
  parseSeniority(text) {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('entry level')) return 'Entry level';
    if (lowerText.includes('mid-senior level')) return 'Mid-Senior level';
    if (lowerText.includes('director')) return 'Director';
    if (lowerText.includes('executive')) return 'Executive';
    
    return null;
  }

  /**
   * Parse applicant count
   * @param {string} text
   * @returns {number|null}
   */
  parseApplicantCount(text) {
    if (!text) return null;
    
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Determine if job is remote
   * @param {string} location
   * @param {string} description
   * @returns {boolean}
   */
  isRemote(location, description) {
    const remoteKeywords = ['remote', 'work from home', 'wfh', 'anywhere'];
    const combinedText = `${location} ${description}`.toLowerCase();
    
    return remoteKeywords.some(keyword => combinedText.includes(keyword));
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LinkedInDetector;
}
