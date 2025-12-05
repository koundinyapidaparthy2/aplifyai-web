/**
 * Indeed Job Detector
 * Detects and extracts job information from Indeed job postings
 */

class IndeedDetector extends BaseDetector {
  constructor() {
    super('Indeed');
  }

  /**
   * Check if current URL is an Indeed job posting
   * @returns {boolean}
   */
  isJobBoard() {
    return window.location.hostname.includes('indeed.com') && 
           (window.location.pathname.includes('/viewjob') || 
            window.location.pathname.includes('/rc/clk'));
  }

  /**
   * Extract job data from Indeed
   * @returns {Promise<Object|null>}
   */
  async extractJobData() {
    try {
      // Wait for job details to load
      await this.waitForElement('[data-testid="jobsearch-JobInfoHeader-title"]', 3000);

      // Job title
      const jobTitle = this.getTextWithFallback([
        '[data-testid="jobsearch-JobInfoHeader-title"] span',
        '[data-testid="jobsearch-JobInfoHeader-title"]',
        '.jobsearch-JobInfoHeader-title',
        'h1[class*="jobTitle"]'
      ]);

      // Company name
      const company = this.getTextWithFallback([
        '[data-testid="inlineHeader-companyName"] a',
        '[data-testid="inlineHeader-companyName"]',
        '[data-company-name="true"]',
        '.jobsearch-CompanyInfoContainer a'
      ]);

      // Location
      const location = this.getTextWithFallback([
        '[data-testid="inlineHeader-companyLocation"]',
        '[data-testid="job-location"]',
        '.jobsearch-JobInfoHeader-subtitle [data-testid="text-location"]',
        '.companyLocation'
      ]);

      // Salary
      const salaryElement = document.querySelector('#salaryInfoAndJobType, [data-testid="salary-and-benefits"]');
      const salaryText = salaryElement?.textContent || '';
      const salary = this.extractSalary(salaryText);

      // Job type
      const jobTypeText = this.getTextWithFallback([
        '[data-testid="job-type-text"]',
        '.jobsearch-JobMetadataHeader-item:has([class*="time"])',
        '#jobDetailsSection .metadata'
      ]);

      // Job description
      let description = '';
      const descriptionElement = document.querySelector('#jobDescriptionText');
      if (descriptionElement) {
        description = this.cleanDescription(descriptionElement.textContent);
      }

      // Extract skills from description
      const skills = this.extractSkills(description);

      // Application URL
      const applicationUrl = window.location.href;

      // Benefits
      const benefitsSection = document.querySelector('[data-testid="benefits"]');
      const benefits = benefitsSection 
        ? Array.from(benefitsSection.querySelectorAll('li')).map(li => li.textContent.trim())
        : [];

      // Number of hires
      const hiresText = this.getTextWithFallback([
        '[data-testid="hiring-multiple-candidates"]',
        '.hiring-urgency'
      ]);

      // Posted time
      const postedTime = this.getTextWithFallback([
        '[data-testid="job-age"]',
        '.jobsearch-JobMetadataFooter .date'
      ]);

      // Company rating
      const ratingElement = document.querySelector('[data-testid="rating"]');
      const rating = ratingElement?.textContent?.match(/[\d.]+/)?.[0] || null;

      // Urgently hiring badge
      const urgentlyHiring = !!document.querySelector('[data-testid="urgently-hiring-badge"]');

      return {
        jobTitle: jobTitle || null,
        company: company || null,
        location: location || null,
        salary: salary,
        description: description || null,
        skills: skills,
        applicationUrl: applicationUrl,
        jobType: this.parseJobType(jobTypeText),
        benefits: benefits,
        hiringMultiple: this.parseHiringCount(hiresText),
        postedDate: postedTime || null,
        remote: this.isRemote(location, description),
        companyRating: rating ? parseFloat(rating) : null,
        urgentlyHiring: urgentlyHiring
      };

    } catch (error) {
      console.error('[Indeed] Error extracting job data:', error);
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
    if (lowerText.includes('temporary')) return 'Temporary';
    if (lowerText.includes('internship')) return 'Internship';
    
    return null;
  }

  /**
   * Parse hiring count
   * @param {string} text
   * @returns {number|null}
   */
  parseHiringCount(text) {
    if (!text) return null;
    
    const match = text.match(/(\d+)\s+(?:hires?|positions?)/i);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Determine if job is remote
   * @param {string} location
   * @param {string} description
   * @returns {boolean}
   */
  isRemote(location, description) {
    const remoteKeywords = ['remote', 'work from home', 'wfh', 'telecommute'];
    const combinedText = `${location} ${description}`.toLowerCase();
    
    return remoteKeywords.some(keyword => combinedText.includes(keyword));
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IndeedDetector;
}
