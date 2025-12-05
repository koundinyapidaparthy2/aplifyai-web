/**
 * Lever Job Detector
 * Detects and extracts job information from Lever job postings
 */

class LeverDetector extends BaseDetector {
  constructor() {
    super('Lever');
  }

  /**
   * Check if current URL is a Lever job posting
   * @returns {boolean}
   */
  isJobBoard() {
    return window.location.hostname.includes('lever.co') ||
           (window.location.hostname.includes('jobs.lever.co'));
  }

  /**
   * Extract job data from Lever
   * @returns {Promise<Object|null>}
   */
  async extractJobData() {
    try {
      // Wait for job details to load
      await this.waitForElement('.posting-headline h2', 3000);

      // Job title
      const jobTitle = this.getTextWithFallback([
        '.posting-headline h2',
        'h2[class*="title"]',
        '.job-title'
      ]);

      // Company name (extract from domain or page)
      let company = this.getTextWithFallback([
        '.company-name',
        '[class*="company"]',
        '.main-header-text h1'
      ]);

      // Fallback: extract from subdomain (e.g., company.jobs.lever.co)
      if (!company) {
        const subdomain = window.location.hostname.split('.')[0];
        company = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
      }

      // Location
      const location = this.getTextWithFallback([
        '.location',
        '.posting-categories .location',
        '[class*="location"]'
      ]);

      // Commitment (Full-time, Part-time, etc.)
      const commitment = this.getTextWithFallback([
        '.commitment',
        '.posting-categories .commitment',
        '[class*="commitment"]'
      ]);

      // Team/Department
      const team = this.getTextWithFallback([
        '.team',
        '.posting-categories .team',
        '[class*="team"]'
      ]);

      // Workplace type
      const workplaceType = this.getTextWithFallback([
        '.workplaceType',
        '.posting-categories .workplaceType',
        '[class*="workplace"]'
      ]);

      // Job description
      let description = '';
      const descriptionElement = document.querySelector('.content, .posting-description, .description');
      if (descriptionElement) {
        // Clone and remove application form
        const clone = descriptionElement.cloneNode(true);
        const forms = clone.querySelectorAll('.application-form, form, .apply-section');
        forms.forEach(form => form.remove());
        description = this.cleanDescription(clone.textContent);
      }

      // Extract salary if mentioned
      const salary = this.extractSalary(description);

      // Extract skills from description
      const skills = this.extractSkills(description);

      // Lists (responsibilities, requirements, etc.)
      const lists = this.extractLists();

      // Application URL
      const applicationUrl = window.location.href;

      // Extract job ID from URL
      const jobIdMatch = window.location.pathname.match(/\/([a-f0-9-]+)$/);
      const jobId = jobIdMatch ? jobIdMatch[1] : null;

      // Check for apply button
      const applyButton = document.querySelector('.template-btn-submit, .apply-button, [class*="apply"]');
      const isAcceptingApplications = !!applyButton;

      return {
        jobTitle: jobTitle || null,
        company: company || null,
        location: location || null,
        salary: salary,
        description: description || null,
        skills: skills,
        applicationUrl: applicationUrl,
        commitment: commitment || null,
        team: team || null,
        workplaceType: workplaceType || null,
        remote: this.isRemote(location, description, workplaceType),
        lists: lists,
        jobId: jobId,
        isAcceptingApplications: isAcceptingApplications
      };

    } catch (error) {
      console.error('[Lever] Error extracting job data:', error);
      throw error;
    }
  }

  /**
   * Extract structured lists from job posting
   * @returns {Object}
   */
  extractLists() {
    const lists = {};

    // Common section titles
    const sectionTitles = [
      'responsibilities',
      'requirements',
      'qualifications',
      'benefits',
      'nice to have',
      'preferred',
      'about you',
      'about the role'
    ];

    const sections = document.querySelectorAll('.section, .content-section, [class*="section"]');
    
    sections.forEach(section => {
      const heading = section.querySelector('h3, h4');
      if (!heading) return;

      const title = heading.textContent.trim().toLowerCase();
      const matchedTitle = sectionTitles.find(t => title.includes(t));

      if (matchedTitle) {
        const items = Array.from(section.querySelectorAll('li'))
          .map(li => li.textContent.trim())
          .filter(text => text.length > 0);

        if (items.length > 0) {
          lists[matchedTitle.replace(/\s+/g, '_')] = items;
        }
      }
    });

    return lists;
  }

  /**
   * Determine if job is remote
   * @param {string} location
   * @param {string} description
   * @param {string} workplaceType
   * @returns {boolean}
   */
  isRemote(location, description, workplaceType) {
    const remoteKeywords = ['remote', 'work from home', 'distributed', 'anywhere'];
    const combinedText = `${location} ${description} ${workplaceType}`.toLowerCase();
    
    return remoteKeywords.some(keyword => combinedText.includes(keyword));
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeverDetector;
}
