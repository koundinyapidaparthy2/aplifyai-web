/**
 * Greenhouse Job Detector
 * Detects and extracts job information from Greenhouse job postings
 */

class GreenhouseDetector extends BaseDetector {
  constructor() {
    super('Greenhouse');
  }

  /**
   * Check if current URL is a Greenhouse job posting
   * @returns {boolean}
   */
  isJobBoard() {
    return window.location.hostname.includes('greenhouse.io') && 
           window.location.pathname.includes('/jobs/');
  }

  /**
   * Extract job data from Greenhouse
   * @returns {Promise<Object|null>}
   */
  async extractJobData() {
    try {
      // Wait for job details to load
      await this.waitForElement('.app-title', 3000);

      // Job title
      const jobTitle = this.getTextWithFallback([
        '.app-title',
        'h1.app-title',
        '#header .app-title'
      ]);

      // Company name (usually in the header or meta tags)
      let company = this.getTextWithFallback([
        '.company-name',
        '#header h1',
        '[class*="company"]'
      ]);

      // Fallback: extract from page title or meta tags
      if (!company) {
        const titleParts = document.title.split(' - ');
        company = titleParts[titleParts.length - 1] || '';
      }

      // Location
      const location = this.getTextWithFallback([
        '.location',
        '[class*="location"]',
        '.app-info .location'
      ]);

      // Department
      const department = this.getTextWithFallback([
        '.department',
        '[class*="department"]'
      ]);

      // Job description
      let description = '';
      const descriptionElement = document.querySelector('#content, .content, #app-body');
      if (descriptionElement) {
        // Clone and remove application form
        const clone = descriptionElement.cloneNode(true);
        const forms = clone.querySelectorAll('#application_form, .application-form, form');
        forms.forEach(form => form.remove());
        description = this.cleanDescription(clone.textContent);
      }

      // Extract skills from description
      const skills = this.extractSkills(description);

      // Application URL
      const applicationUrl = window.location.href;

      // Office information
      const office = this.getTextWithFallback([
        '.app-office',
        '[class*="office"]'
      ]);

      // Remote/Onsite info
      const workplaceType = this.getTextWithFallback([
        '.workplace-type',
        '[class*="workplace"]'
      ]);

      // Extract salary if mentioned in description
      const salary = this.extractSalary(description);

      // Job ID (useful for tracking)
      const jobIdMatch = window.location.pathname.match(/\/jobs\/(\d+)/);
      const jobId = jobIdMatch ? jobIdMatch[1] : null;

      // Check if application is open
      const applyButton = document.querySelector('#apply_button, .apply-button, [id*="apply"]');
      const isAcceptingApplications = !!applyButton && !applyButton.disabled;

      return {
        jobTitle: jobTitle || null,
        company: company || null,
        location: location || office || null,
        salary: salary,
        description: description || null,
        skills: skills,
        applicationUrl: applicationUrl,
        department: department || null,
        workplaceType: workplaceType || null,
        remote: this.isRemote(location, description, workplaceType),
        jobId: jobId,
        isAcceptingApplications: isAcceptingApplications
      };

    } catch (error) {
      console.error('[Greenhouse] Error extracting job data:', error);
      throw error;
    }
  }

  /**
   * Determine if job is remote
   * @param {string} location
   * @param {string} description
   * @param {string} workplaceType
   * @returns {boolean}
   */
  isRemote(location, description, workplaceType) {
    const remoteKeywords = ['remote', 'work from home', 'anywhere', 'distributed'];
    const combinedText = `${location} ${description} ${workplaceType}`.toLowerCase();
    
    return remoteKeywords.some(keyword => combinedText.includes(keyword));
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GreenhouseDetector;
}
