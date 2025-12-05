/**
 * FormFieldMapper - Maps user profile data to form fields
 * Handles data transformation and validation
 */

class FormFieldMapper {
  constructor(userProfile) {
    this.userProfile = userProfile;
  }

  /**
   * Get value for a specific field
   * @param {string} fieldName
   * @param {Object} fieldInfo - Field metadata from FormDetector
   * @returns {any} Value to fill
   */
  getFieldValue(fieldName, fieldInfo) {
    const profile = this.userProfile;

    // Direct mappings
    const mappings = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: `${profile.firstName} ${profile.lastName}`,
      email: profile.email,
      phone: this.formatPhone(profile.phone),
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
      github: profile.github,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      country: profile.country || 'United States',
      
      // Work authorization
      workAuthorization: this.mapWorkAuthorization(fieldInfo.element, profile.workAuthorization),
      sponsorship: this.mapSponsorship(fieldInfo.element, profile.requiresSponsorship),
      
      // Demographics (optional - user can skip)
      veteranStatus: profile.veteranStatus ? this.mapVeteranStatus(fieldInfo.element, profile.veteranStatus) : null,
      disability: profile.disability ? this.mapDisability(fieldInfo.element, profile.disability) : null,
      gender: profile.gender ? this.mapGender(fieldInfo.element, profile.gender) : null,
      race: profile.race ? this.mapRace(fieldInfo.element, profile.race) : null,
      
      // Experience & Education
      yearsOfExperience: profile.yearsOfExperience?.toString(),
      educationLevel: this.mapEducationLevel(fieldInfo.element, profile.educationLevel),
      university: profile.university,
      major: profile.major,
      graduationYear: profile.graduationYear?.toString(),
      
      // Current employment
      currentCompany: profile.currentCompany,
      currentTitle: profile.currentTitle,
      
      // Salary & dates
      salary: profile.desiredSalary ? this.formatSalary(profile.desiredSalary) : '',
      startDate: this.formatStartDate(profile.availableStartDate),
      
      // Text fields
      coverLetter: this.generateCoverLetter(profile, fieldInfo),
      additionalInfo: profile.additionalInfo || '',
      
      // Files (handled separately)
      resume: null, // File upload handled by FormFiller
      coverLetterFile: null,
    };

    return mappings[fieldName] || null;
  }

  /**
   * Format phone number
   * @param {string} phone
   * @returns {string}
   */
  formatPhone(phone) {
    if (!phone) return '';
    
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length === 10) {
      return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6, 4)}`;
    }
    
    // Format as +X (XXX) XXX-XXXX for international
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.substr(1, 3)}) ${digits.substr(4, 3)}-${digits.substr(7, 4)}`;
    }
    
    return phone; // Return original if can't format
  }

  /**
   * Format salary
   * @param {number} salary
   * @returns {string}
   */
  formatSalary(salary) {
    if (!salary) return '';
    return salary.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }

  /**
   * Format start date
   * @param {string|Date} date
   * @returns {string}
   */
  formatStartDate(date) {
    if (!date) {
      // Default to 2 weeks from now
      const twoWeeks = new Date();
      twoWeeks.setDate(twoWeeks.getDate() + 14);
      return twoWeeks.toISOString().split('T')[0];
    }
    
    if (typeof date === 'string') {
      return new Date(date).toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * Map work authorization to dropdown options
   * @param {Element} element
   * @param {string} auth
   * @returns {string}
   */
  mapWorkAuthorization(element, auth) {
    if (!auth) return null;
    
    const options = this.getSelectOptions(element);
    const authLower = auth.toLowerCase();
    
    // Common mappings
    const mappings = {
      'us citizen': ['citizen', 'us citizen', 'u.s. citizen', 'yes'],
      'green card': ['green card', 'permanent resident', 'lawful permanent resident', 'lpr'],
      'work visa': ['work visa', 'h1b', 'h-1b', 'visa holder', 'authorized', 'yes'],
      'requires sponsorship': ['require sponsorship', 'no', 'not authorized', 'needs sponsorship'],
    };
    
    // Find best match
    for (const [key, patterns] of Object.entries(mappings)) {
      if (authLower.includes(key)) {
        for (const pattern of patterns) {
          const match = options.find(opt => opt.text.toLowerCase().includes(pattern));
          if (match) return match.value;
        }
      }
    }
    
    return null;
  }

  /**
   * Map sponsorship requirement
   * @param {Element} element
   * @param {boolean} requiresSponsorship
   * @returns {string}
   */
  mapSponsorship(element, requiresSponsorship) {
    const options = this.getSelectOptions(element);
    
    const targetValue = requiresSponsorship ? 'yes' : 'no';
    
    // Find yes/no option
    for (const opt of options) {
      const text = opt.text.toLowerCase();
      if (requiresSponsorship && (text === 'yes' || text.includes('require'))) {
        return opt.value;
      }
      if (!requiresSponsorship && (text === 'no' || text.includes('do not require'))) {
        return opt.value;
      }
    }
    
    return null;
  }

  /**
   * Map veteran status
   * @param {Element} element
   * @param {string} status
   * @returns {string}
   */
  mapVeteranStatus(element, status) {
    const options = this.getSelectOptions(element);
    const statusLower = status.toLowerCase();
    
    for (const opt of options) {
      if (opt.text.toLowerCase().includes(statusLower)) {
        return opt.value;
      }
    }
    
    return null;
  }

  /**
   * Map disability status
   * @param {Element} element
   * @param {string} status
   * @returns {string}
   */
  mapDisability(element, status) {
    const options = this.getSelectOptions(element);
    const statusLower = status.toLowerCase();
    
    for (const opt of options) {
      if (opt.text.toLowerCase().includes(statusLower)) {
        return opt.value;
      }
    }
    
    return null;
  }

  /**
   * Map gender
   * @param {Element} element
   * @param {string} gender
   * @returns {string}
   */
  mapGender(element, gender) {
    const options = this.getSelectOptions(element);
    const genderLower = gender.toLowerCase();
    
    for (const opt of options) {
      if (opt.text.toLowerCase().includes(genderLower)) {
        return opt.value;
      }
    }
    
    return null;
  }

  /**
   * Map race/ethnicity
   * @param {Element} element
   * @param {string} race
   * @returns {string}
   */
  mapRace(element, race) {
    const options = this.getSelectOptions(element);
    const raceLower = race.toLowerCase();
    
    for (const opt of options) {
      if (opt.text.toLowerCase().includes(raceLower)) {
        return opt.value;
      }
    }
    
    return null;
  }

  /**
   * Map education level
   * @param {Element} element
   * @param {string} level
   * @returns {string}
   */
  mapEducationLevel(element, level) {
    if (!level) return null;
    
    const options = this.getSelectOptions(element);
    const levelLower = level.toLowerCase();
    
    // Common education level mappings
    const mappings = {
      'high school': ['high school', 'hs diploma', 'secondary'],
      'associate': ['associate', 'aa', 'as'],
      'bachelor': ['bachelor', 'ba', 'bs', 'undergraduate'],
      'master': ['master', 'ma', 'ms', 'mba', 'graduate'],
      'doctorate': ['doctorate', 'phd', 'doctoral'],
      'professional': ['professional', 'jd', 'md'],
    };
    
    // Find best match
    for (const [key, patterns] of Object.entries(mappings)) {
      if (levelLower.includes(key)) {
        for (const pattern of patterns) {
          const match = options.find(opt => opt.text.toLowerCase().includes(pattern));
          if (match) return match.value;
        }
      }
    }
    
    return null;
  }

  /**
   * Get all options from a select element
   * @param {Element} element
   * @returns {Array<{value: string, text: string}>}
   */
  getSelectOptions(element) {
    if (!element || element.tagName.toLowerCase() !== 'select') {
      return [];
    }
    
    return Array.from(element.options).map(opt => ({
      value: opt.value,
      text: opt.textContent.trim(),
    }));
  }

  /**
   * Generate a simple cover letter if needed
   * @param {Object} profile
   * @param {Object} fieldInfo
   * @returns {string}
   */
  generateCoverLetter(profile, fieldInfo) {
    // If user has a custom cover letter, use it
    if (profile.coverLetter) {
      return profile.coverLetter;
    }
    
    // Otherwise, generate a simple one
    const jobTitle = profile.targetJobTitle || 'this position';
    const company = profile.targetCompany || 'your company';
    
    return `Dear Hiring Manager,

I am writing to express my interest in ${jobTitle} at ${company}. With ${profile.yearsOfExperience || 'several'} years of experience in ${profile.major || 'my field'}, I am confident I would be a valuable addition to your team.

My background includes ${profile.currentTitle || 'relevant experience'} at ${profile.currentCompany || 'previous companies'}, where I have developed strong skills in ${profile.skills?.slice(0, 3).join(', ') || 'my area of expertise'}.

I am particularly excited about this opportunity because it aligns with my career goals and allows me to contribute to ${company}'s success.

Thank you for considering my application. I look forward to discussing how my skills and experience can benefit your team.

Best regards,
${profile.firstName} ${profile.lastName}`;
  }

  /**
   * Get all field values for a form
   * @param {Object} formFields - Fields from FormDetector
   * @returns {Object} Map of field names to values
   */
  getAllFieldValues(formFields) {
    const values = {};
    
    for (const [fieldName, fieldInfo] of Object.entries(formFields)) {
      const value = this.getFieldValue(fieldName, fieldInfo);
      if (value !== null && value !== undefined) {
        values[fieldName] = value;
      }
    }
    
    return values;
  }

  /**
   * Validate field value
   * @param {string} fieldName
   * @param {any} value
   * @param {Object} fieldInfo
   * @returns {boolean}
   */
  validateFieldValue(fieldName, value, fieldInfo) {
    // Required field check
    if (fieldInfo.required && (!value || value.trim() === '')) {
      return false;
    }
    
    // Type-specific validation
    switch (fieldInfo.type) {
      case 'email':
        return this.validateEmail(value);
      
      case 'tel':
        return this.validatePhone(value);
      
      case 'url':
        return this.validateURL(value);
      
      default:
        return true;
    }
  }

  /**
   * Validate email
   * @param {string} email
   * @returns {boolean}
   */
  validateEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate phone
   * @param {string} phone
   * @returns {boolean}
   */
  validatePhone(phone) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  }

  /**
   * Validate URL
   * @param {string} url
   * @returns {boolean}
   */
  validateURL(url) {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormFieldMapper;
}
