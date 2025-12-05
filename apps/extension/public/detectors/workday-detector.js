/**
 * Workday Job Detector
 * Detects and extracts job information from Workday job postings
 */

class WorkdayDetector extends BaseDetector {
  constructor() {
    super('Workday');
  }

  /**
   * Check if current URL is a Workday job posting
   * @returns {boolean}
   */
  isJobBoard() {
    return (window.location.hostname.includes('workday.com') || 
            window.location.hostname.includes('workdayjobs.com')) &&
           (window.location.pathname.includes('/job/') || 
            window.location.pathname.includes('/en-US/'));
  }

  /**
   * Extract job data from Workday
   * @returns {Promise<Object|null>}
   */
  async extractJobData() {
    try {
      // Workday uses dynamic content, wait for it to load
      await this.waitForElement('[data-automation-id="jobPostingHeader"]', 5000);

      // Job title
      const jobTitle = this.getTextWithFallback([
        '[data-automation-id="jobPostingHeader"]',
        'h2[data-automation-id*="title"]',
        '.css-cygeeu'
      ]);

      // Company name (often in URL or header)
      let company = this.getTextWithFallback([
        '[data-automation-id="company"]',
        '.company-logo-text',
        'h1[class*="company"]'
      ]);

      // Fallback: extract from subdomain or page title
      if (!company) {
        const match = window.location.hostname.match(/([^.]+)\.(?:myworkdayjobs|workdayjobs)/);
        if (match) {
          company = match[1].split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
      }

      // Location
      const location = this.getTextWithFallback([
        '[data-automation-id="locations"]',
        '[data-automation-id="location"]',
        'dd[data-automation-id="location"] span'
      ]);

      // Time type (Full-time, Part-time)
      const timeType = this.getTextWithFallback([
        '[data-automation-id="timeType"]',
        'dd[data-automation-id*="time"] span'
      ]);

      // Posted date
      const postedDate = this.getTextWithFallback([
        '[data-automation-id="postedOn"]',
        '[data-automation-id*="posted"] span'
      ]);

      // Job description
      let description = '';
      const descriptionElement = document.querySelector(
        '[data-automation-id="jobPostingDescription"]'
      );
      if (descriptionElement) {
        description = this.cleanDescription(descriptionElement.textContent);
      }

      // Job requisition ID
      const requisitionId = this.getTextWithFallback([
        '[data-automation-id="requisitionId"]',
        '[data-automation-id*="requisition"] span'
      ]);

      // Extract additional job details from the details section
      const jobDetails = this.extractJobDetails();

      // Extract salary if mentioned
      const salary = this.extractSalary(description);

      // Extract skills from description
      const skills = this.extractSkills(description);

      // Application URL
      const applicationUrl = window.location.href;

      // Check for apply button
      const applyButton = document.querySelector(
        '[data-automation-id="apply"], [data-automation-id*="applyButton"]'
      );
      const isAcceptingApplications = !!applyButton && !applyButton.disabled;

      return {
        jobTitle: jobTitle || null,
        company: company || null,
        location: location || null,
        salary: salary,
        description: description || null,
        skills: skills,
        applicationUrl: applicationUrl,
        timeType: timeType || null,
        postedDate: postedDate || null,
        requisitionId: requisitionId || null,
        remote: this.isRemote(location, description),
        jobDetails: jobDetails,
        isAcceptingApplications: isAcceptingApplications
      };

    } catch (error) {
      console.error('[Workday] Error extracting job data:', error);
      throw error;
    }
  }

  /**
   * Extract structured job details
   * @returns {Object}
   */
  extractJobDetails() {
    const details = {};

    // Workday uses data-automation-id attributes
    const detailElements = document.querySelectorAll('[data-automation-id^="job"]');
    
    detailElements.forEach(element => {
      const automationId = element.getAttribute('data-automation-id');
      if (!automationId) return;

      // Extract the key from automation ID (e.g., "jobPostingPrimaryLocation" -> "primaryLocation")
      const key = automationId.replace('jobPosting', '').replace('job', '');
      if (!key || key === 'Header' || key === 'Description') return;

      const value = element.textContent.trim();
      if (value) {
        details[key.charAt(0).toLowerCase() + key.slice(1)] = value;
      }
    });

    // Also extract from definition list format
    const dts = document.querySelectorAll('dt');
    dts.forEach(dt => {
      const dd = dt.nextElementSibling;
      if (dd && dd.tagName === 'DD') {
        const key = dt.textContent.trim().toLowerCase().replace(/\s+/g, '_');
        const value = dd.textContent.trim();
        if (key && value) {
          details[key] = value;
        }
      }
    });

    return details;
  }

  /**
   * Determine if job is remote
   * @param {string} location
   * @param {string} description
   * @returns {boolean}
   */
  isRemote(location, description) {
    const remoteKeywords = ['remote', 'work from home', 'virtual', 'telecommute'];
    const combinedText = `${location} ${description}`.toLowerCase();
    
    return remoteKeywords.some(keyword => combinedText.includes(keyword));
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkdayDetector;
}
