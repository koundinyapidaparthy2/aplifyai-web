/**
 * Feature Engineering Service for Application Success Prediction
 * 
 * Extracts and computes ML features from job postings and user resumes:
 * - Skill match percentage
 * - Experience level match
 * - Education match
 * - Location match
 * - Application timing
 * - Keyword density
 * - Role seniority alignment
 * 
 * Features are normalized to 0-1 range for model input.
 */

class FeatureEngineeringService {
  constructor() {
    // Common tech skills for matching
    this.techSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'typescript', 'sql',
      'aws', 'docker', 'kubernetes', 'git', 'ci/cd', 'agile', 'rest', 'api',
      'html', 'css', 'angular', 'vue', 'mongodb', 'postgresql', 'redis',
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp',
      'data science', 'analytics', 'tableau', 'power bi', 'spark', 'hadoop',
      'devops', 'linux', 'bash', 'microservices', 'graphql', 'redis'
    ];

    // Education levels (ordinal)
    this.educationLevels = {
      'high school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5,
      'doctorate': 5
    };

    // Seniority levels (ordinal)
    this.seniorityLevels = {
      'intern': 1,
      'entry': 2,
      'junior': 2,
      'mid': 3,
      'senior': 4,
      'lead': 5,
      'principal': 6,
      'staff': 6,
      'director': 7,
      'vp': 8,
      'c-level': 9
    };
  }

  /**
   * Extract all features from job posting and resume
   * @param {Object} jobPosting - Job posting data
   * @param {Object} resume - User's resume data
   * @param {Object} applicationContext - Application timing and context
   * @returns {Object} Feature vector with 20+ features
   */
  extractFeatures(jobPosting, resume, applicationContext = {}) {
    const features = {
      // Core matching features (15)
      ...this.extractSkillFeatures(jobPosting, resume),
      ...this.extractExperienceFeatures(jobPosting, resume),
      ...this.extractEducationFeatures(jobPosting, resume),
      ...this.extractLocationFeatures(jobPosting, resume),
      
      // Application context features (5)
      ...this.extractTimingFeatures(jobPosting, applicationContext),
      
      // Text similarity features (5)
      ...this.extractTextSimilarityFeatures(jobPosting, resume),
      
      // Job characteristics (5)
      ...this.extractJobCharacteristics(jobPosting),
      
      // Metadata
      extractedAt: new Date().toISOString()
    };

    return features;
  }

  /**
   * Extract skill-related features
   * Returns: skill_match_score, required_skills_coverage, preferred_skills_coverage,
   *          unique_skills_count, skill_depth_score
   */
  extractSkillFeatures(jobPosting, resume) {
    const jobSkills = this.extractSkillsFromText(jobPosting.description || '');
    const resumeSkills = this.extractSkillsFromText(JSON.stringify(resume.skills || []));
    
    const requiredSkills = jobSkills.required || [];
    const preferredSkills = jobSkills.preferred || [];
    const allJobSkills = [...requiredSkills, ...preferredSkills];
    
    // Calculate skill matches
    const requiredMatches = this.calculateSkillMatches(requiredSkills, resumeSkills);
    const preferredMatches = this.calculateSkillMatches(preferredSkills, resumeSkills);
    const allMatches = this.calculateSkillMatches(allJobSkills, resumeSkills);
    
    // Required skills coverage (most important)
    const requiredCoverage = requiredSkills.length > 0
      ? requiredMatches.length / requiredSkills.length
      : 1.0;
    
    // Preferred skills coverage (bonus)
    const preferredCoverage = preferredSkills.length > 0
      ? preferredMatches.length / preferredSkills.length
      : 0.5;
    
    // Overall skill match score (weighted)
    const skillMatchScore = (requiredCoverage * 0.7) + (preferredCoverage * 0.3);
    
    // Skill depth: how many skills user has beyond job requirements
    const uniqueSkillsCount = resumeSkills.filter(
      skill => !allJobSkills.includes(skill)
    ).length;
    
    // Skill depth score (0-1): normalized by typical skill count (20)
    const skillDepthScore = Math.min(uniqueSkillsCount / 20, 1.0);
    
    return {
      skill_match_score: Number(skillMatchScore.toFixed(3)),
      required_skills_coverage: Number(requiredCoverage.toFixed(3)),
      preferred_skills_coverage: Number(preferredCoverage.toFixed(3)),
      unique_skills_count: uniqueSkillsCount,
      skill_depth_score: Number(skillDepthScore.toFixed(3)),
      
      // For debugging/feedback
      _matched_required: requiredMatches,
      _matched_preferred: preferredMatches,
      _missing_required: requiredSkills.filter(s => !requiredMatches.includes(s)),
      _missing_preferred: preferredSkills.filter(s => !preferredMatches.includes(s))
    };
  }

  /**
   * Extract experience-related features
   * Returns: experience_match_score, years_of_experience, seniority_match,
   *          experience_gap, industry_match
   */
  extractExperienceFeatures(jobPosting, resume) {
    // Extract required years from job posting
    const requiredYears = this.extractRequiredYears(jobPosting.description || '');
    const userYears = this.calculateTotalExperience(resume.experience || []);
    
    // Experience match (0-1): 1.0 if meets requirement, decreases if under
    let experienceMatchScore = 0;
    if (requiredYears === null) {
      // No explicit requirement, assume mid-level (3-5 years)
      experienceMatchScore = Math.min(userYears / 4, 1.0);
    } else if (userYears >= requiredYears) {
      experienceMatchScore = 1.0;
    } else {
      // Partial credit for being close
      experienceMatchScore = userYears / requiredYears;
    }
    
    // Experience gap (years below requirement, 0 if exceeds)
    const experienceGap = requiredYears !== null 
      ? Math.max(0, requiredYears - userYears)
      : 0;
    
    // Seniority match
    const jobSeniority = this.extractSeniorityLevel(jobPosting.title || '');
    const userSeniority = this.estimateUserSeniority(resume.experience || [], userYears);
    const seniorityMatch = this.calculateSeniorityMatch(jobSeniority, userSeniority);
    
    // Industry match (has experience in same industry)
    const jobIndustry = this.extractIndustry(jobPosting);
    const industryMatch = this.hasIndustryExperience(resume.experience || [], jobIndustry);
    
    // Company size match (startup vs enterprise experience)
    const companySizeMatch = this.calculateCompanySizeMatch(jobPosting, resume);
    
    return {
      experience_match_score: Number(experienceMatchScore.toFixed(3)),
      years_of_experience: Number(userYears.toFixed(1)),
      required_years: requiredYears,
      experience_gap: Number(experienceGap.toFixed(1)),
      seniority_match: Number(seniorityMatch.toFixed(3)),
      industry_match: Number(industryMatch.toFixed(3)),
      company_size_match: Number(companySizeMatch.toFixed(3)),
      
      // For debugging
      _job_seniority: jobSeniority,
      _user_seniority: userSeniority
    };
  }

  /**
   * Extract education-related features
   * Returns: education_match, education_level_score, field_match, gpa_score
   */
  extractEducationFeatures(jobPosting, resume) {
    const requiredEducation = this.extractRequiredEducation(jobPosting.description || '');
    const userEducation = resume.education || [];
    
    // Get highest education level
    const requiredLevel = requiredEducation.level
      ? this.educationLevels[requiredEducation.level.toLowerCase()] || 3
      : 3; // Default to bachelor's
    
    const userLevel = Math.max(
      ...userEducation.map(edu => 
        this.educationLevels[edu.degree?.toLowerCase()] || 0
      ),
      0
    );
    
    // Education match (0-1): 1.0 if meets/exceeds, partial if below
    const educationMatch = userLevel >= requiredLevel ? 1.0 : userLevel / requiredLevel;
    
    // Field match (e.g., CS degree for software role)
    const fieldMatch = this.calculateFieldMatch(requiredEducation.field, userEducation);
    
    // GPA score (if available, 0.5 default if not)
    const gpaScore = this.calculateGPAScore(userEducation);
    
    // Prestigious institution bonus (top universities)
    const institutionBonus = this.calculateInstitutionBonus(userEducation);
    
    return {
      education_match: Number(educationMatch.toFixed(3)),
      education_level_score: Number((userLevel / 5).toFixed(3)), // Normalized to 0-1
      field_match: Number(fieldMatch.toFixed(3)),
      gpa_score: Number(gpaScore.toFixed(3)),
      institution_bonus: Number(institutionBonus.toFixed(3)),
      
      // For debugging
      _required_level: requiredLevel,
      _user_level: userLevel
    };
  }

  /**
   * Extract location-related features
   * Returns: location_match, is_remote, relocation_willingness
   */
  extractLocationFeatures(jobPosting, resume) {
    const jobLocation = (jobPosting.location || '').toLowerCase();
    const userLocation = (resume.location || '').toLowerCase();
    
    // Check if remote
    const isRemote = jobLocation.includes('remote') || 
                     jobLocation.includes('anywhere') ||
                     jobPosting.remote === true;
    
    // Location match
    let locationMatch = 0;
    if (isRemote) {
      locationMatch = 1.0; // Remote = perfect match
    } else if (this.isSameCity(jobLocation, userLocation)) {
      locationMatch = 1.0; // Same city = perfect
    } else if (this.isSameState(jobLocation, userLocation)) {
      locationMatch = 0.7; // Same state = good
    } else if (this.isSameCountry(jobLocation, userLocation)) {
      locationMatch = 0.4; // Same country = possible
    } else {
      locationMatch = 0.2; // Different country = unlikely
    }
    
    // Relocation willingness (from resume preferences)
    const relocationWillingness = resume.preferences?.willingToRelocate === true ? 1.0 : 0.0;
    
    // Adjust location match based on relocation willingness
    const adjustedLocationMatch = isRemote 
      ? locationMatch
      : Math.max(locationMatch, relocationWillingness * 0.5);
    
    return {
      location_match: Number(adjustedLocationMatch.toFixed(3)),
      is_remote: isRemote ? 1 : 0,
      relocation_willingness: relocationWillingness,
      
      // For debugging
      _job_location: jobLocation,
      _user_location: userLocation
    };
  }

  /**
   * Extract application timing features
   * Returns: days_since_posted, application_speed_score, is_early_applicant,
   *          time_of_day_score, day_of_week_score
   */
  extractTimingFeatures(jobPosting, applicationContext) {
    const postedDate = new Date(jobPosting.postedDate || Date.now());
    const applicationDate = new Date(applicationContext.applicationDate || Date.now());
    
    // Days since job was posted
    const daysSincePosted = Math.floor(
      (applicationDate - postedDate) / (1000 * 60 * 60 * 24)
    );
    
    // Application speed score (applying early is better)
    // 0-2 days: 1.0, 3-7 days: 0.8, 8-14 days: 0.6, 15-30 days: 0.4, 30+ days: 0.2
    let speedScore = 1.0;
    if (daysSincePosted <= 2) speedScore = 1.0;
    else if (daysSincePosted <= 7) speedScore = 0.8;
    else if (daysSincePosted <= 14) speedScore = 0.6;
    else if (daysSincePosted <= 30) speedScore = 0.4;
    else speedScore = 0.2;
    
    // Is early applicant (first 3 days)
    const isEarlyApplicant = daysSincePosted <= 3 ? 1 : 0;
    
    // Time of day score (applying during business hours is better)
    const hour = applicationDate.getHours();
    const timeOfDayScore = (hour >= 9 && hour <= 17) ? 1.0 : 0.7;
    
    // Day of week score (weekdays better than weekends)
    const dayOfWeek = applicationDate.getDay();
    const dayOfWeekScore = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.0 : 0.8;
    
    return {
      days_since_posted: daysSincePosted,
      application_speed_score: Number(speedScore.toFixed(3)),
      is_early_applicant: isEarlyApplicant,
      time_of_day_score: Number(timeOfDayScore.toFixed(3)),
      day_of_week_score: Number(dayOfWeekScore.toFixed(3))
    };
  }

  /**
   * Extract text similarity features
   * Returns: title_similarity, description_similarity, keyword_density,
   *          resume_relevance_score, buzzword_match
   */
  extractTextSimilarityFeatures(jobPosting, resume) {
    const jobTitle = (jobPosting.title || '').toLowerCase();
    const jobDescription = (jobPosting.description || '').toLowerCase();
    const resumeText = this.flattenResumeText(resume).toLowerCase();
    
    // Title similarity (cosine similarity between job title and resume)
    const titleSimilarity = this.calculateCosineSimilarity(
      jobTitle,
      resume.targetTitles?.join(' ') || resume.title || ''
    );
    
    // Description similarity (TF-IDF cosine similarity)
    const descriptionSimilarity = this.calculateCosineSimilarity(
      jobDescription,
      resumeText
    );
    
    // Keyword density (important keywords per 100 words)
    const keywordDensity = this.calculateKeywordDensity(jobDescription, resumeText);
    
    // Resume relevance score (how much of resume is relevant to job)
    const resumeRelevanceScore = this.calculateResumeRelevance(jobDescription, resumeText);
    
    // Buzzword match (industry buzzwords in both)
    const buzzwordMatch = this.calculateBuzzwordMatch(jobDescription, resumeText);
    
    return {
      title_similarity: Number(titleSimilarity.toFixed(3)),
      description_similarity: Number(descriptionSimilarity.toFixed(3)),
      keyword_density: Number(keywordDensity.toFixed(3)),
      resume_relevance_score: Number(resumeRelevanceScore.toFixed(3)),
      buzzword_match: Number(buzzwordMatch.toFixed(3))
    };
  }

  /**
   * Extract job characteristics
   * Returns: job_popularity, company_size, is_fortune_500, job_level,
   *          salary_competitiveness
   */
  extractJobCharacteristics(jobPosting) {
    // Job popularity (applications per day, if available)
    const jobPopularity = jobPosting.applicationCount
      ? Math.min(jobPosting.applicationCount / 100, 1.0)
      : 0.5; // Default medium popularity
    
    // Company size (normalized)
    const companySize = this.normalizeCompanySize(jobPosting.companySize || 'medium');
    
    // Fortune 500 / well-known company
    const isFortune500 = this.isFortune500Company(jobPosting.companyName || '');
    
    // Job level (entry/mid/senior)
    const jobLevel = this.normalizeJobLevel(
      this.extractSeniorityLevel(jobPosting.title || '')
    );
    
    // Salary competitiveness (if salary range provided)
    const salaryCompetitiveness = this.calculateSalaryCompetitiveness(jobPosting.salary);
    
    return {
      job_popularity: Number(jobPopularity.toFixed(3)),
      company_size: Number(companySize.toFixed(3)),
      is_fortune_500: isFortune500 ? 1 : 0,
      job_level: Number(jobLevel.toFixed(3)),
      salary_competitiveness: Number(salaryCompetitiveness.toFixed(3))
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Extract skills from text using keyword matching
   */
  extractSkillsFromText(text) {
    const lowerText = text.toLowerCase();
    const foundSkills = [];
    
    for (const skill of this.techSkills) {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills;
  }

  /**
   * Calculate skill matches between two skill lists
   */
  calculateSkillMatches(jobSkills, resumeSkills) {
    const matches = [];
    
    for (const jobSkill of jobSkills) {
      const normalized = jobSkill.toLowerCase();
      if (resumeSkills.some(rs => rs.toLowerCase().includes(normalized))) {
        matches.push(jobSkill);
      }
    }
    
    return matches;
  }

  /**
   * Extract required years of experience from job description
   */
  extractRequiredYears(description) {
    // Look for patterns like "3+ years", "5-7 years", "minimum 2 years"
    const patterns = [
      /(\d+)\+?\s*(?:to|\-|–)?\s*(\d+)?\s*years?/i,
      /minimum\s+of\s+(\d+)\s*years?/i,
      /at\s+least\s+(\d+)\s*years?/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return null; // No explicit requirement
  }

  /**
   * Calculate total years of experience from experience array
   */
  calculateTotalExperience(experiences) {
    let totalMonths = 0;
    
    for (const exp of experiences) {
      const startDate = new Date(exp.startDate || Date.now());
      const endDate = exp.current 
        ? new Date()
        : new Date(exp.endDate || Date.now());
      
      const months = (endDate - startDate) / (1000 * 60 * 60 * 24 * 30);
      totalMonths += Math.max(months, 0);
    }
    
    return totalMonths / 12; // Convert to years
  }

  /**
   * Extract seniority level from job title
   */
  extractSeniorityLevel(title) {
    const lowerTitle = title.toLowerCase();
    
    for (const [level, value] of Object.entries(this.seniorityLevels)) {
      if (lowerTitle.includes(level)) {
        return value;
      }
    }
    
    // Default to mid-level if not specified
    return 3;
  }

  /**
   * Estimate user's seniority level from experience
   */
  estimateUserSeniority(experiences, totalYears) {
    // Check titles for seniority indicators
    for (const exp of experiences) {
      const title = (exp.title || '').toLowerCase();
      for (const [level, value] of Object.entries(this.seniorityLevels)) {
        if (title.includes(level)) {
          return value;
        }
      }
    }
    
    // Estimate from years of experience
    if (totalYears < 2) return 2; // Entry/Junior
    if (totalYears < 5) return 3; // Mid
    if (totalYears < 8) return 4; // Senior
    if (totalYears < 12) return 5; // Lead
    return 6; // Principal/Staff
  }

  /**
   * Calculate seniority match score
   */
  calculateSeniorityMatch(jobLevel, userLevel) {
    const difference = Math.abs(jobLevel - userLevel);
    
    if (difference === 0) return 1.0; // Perfect match
    if (difference === 1) return 0.8; // Close
    if (difference === 2) return 0.6; // Acceptable
    if (difference === 3) return 0.4; // Stretch
    return 0.2; // Significant mismatch
  }

  /**
   * Extract industry from job posting
   */
  extractIndustry(jobPosting) {
    const industries = [
      'tech', 'finance', 'healthcare', 'retail', 'education',
      'manufacturing', 'consulting', 'media', 'gaming', 'saas'
    ];
    
    const text = `${jobPosting.description || ''} ${jobPosting.companyName || ''}`.toLowerCase();
    
    for (const industry of industries) {
      if (text.includes(industry)) {
        return industry;
      }
    }
    
    return 'general';
  }

  /**
   * Check if user has industry experience
   */
  hasIndustryExperience(experiences, targetIndustry) {
    if (targetIndustry === 'general') return 0.5;
    
    for (const exp of experiences) {
      const expText = `${exp.company || ''} ${exp.description || ''}`.toLowerCase();
      if (expText.includes(targetIndustry)) {
        return 1.0;
      }
    }
    
    return 0.0;
  }

  /**
   * Calculate company size match
   */
  calculateCompanySizeMatch(jobPosting, resume) {
    const jobSize = this.normalizeCompanySize(jobPosting.companySize || 'medium');
    
    // Get user's most recent company sizes
    const userSizes = (resume.experience || [])
      .slice(0, 2) // Most recent 2
      .map(exp => this.normalizeCompanySize(exp.companySize || 'medium'));
    
    if (userSizes.length === 0) return 0.5;
    
    const avgUserSize = userSizes.reduce((a, b) => a + b, 0) / userSizes.length;
    const difference = Math.abs(jobSize - avgUserSize);
    
    return Math.max(0, 1.0 - difference);
  }

  /**
   * Normalize company size to 0-1 scale
   */
  normalizeCompanySize(size) {
    const sizes = {
      'startup': 0.2,
      'small': 0.3,
      'medium': 0.5,
      'large': 0.7,
      'enterprise': 0.9
    };
    
    return sizes[size.toLowerCase()] || 0.5;
  }

  /**
   * Extract required education from job description
   */
  extractRequiredEducation(description) {
    const lowerDesc = description.toLowerCase();
    
    // Check for degree requirements
    let level = null;
    let field = null;
    
    if (lowerDesc.includes('phd') || lowerDesc.includes('doctorate')) {
      level = 'phd';
    } else if (lowerDesc.includes('master')) {
      level = 'master';
    } else if (lowerDesc.includes('bachelor')) {
      level = 'bachelor';
    } else if (lowerDesc.includes('associate')) {
      level = 'associate';
    }
    
    // Check for field requirements
    const fields = ['computer science', 'engineering', 'business', 'mathematics', 'statistics'];
    for (const f of fields) {
      if (lowerDesc.includes(f)) {
        field = f;
        break;
      }
    }
    
    return { level, field };
  }

  /**
   * Calculate field of study match
   */
  calculateFieldMatch(requiredField, userEducation) {
    if (!requiredField) return 0.5; // No specific requirement
    
    const requiredLower = requiredField.toLowerCase();
    
    for (const edu of userEducation) {
      const field = (edu.field || edu.major || '').toLowerCase();
      if (field.includes(requiredLower) || requiredLower.includes(field)) {
        return 1.0;
      }
    }
    
    // Check for related fields (e.g., CS and Engineering)
    const relatedFields = {
      'computer science': ['software engineering', 'computer engineering', 'information technology'],
      'engineering': ['computer science', 'software engineering', 'electrical engineering'],
      'business': ['management', 'finance', 'economics', 'marketing']
    };
    
    for (const edu of userEducation) {
      const field = (edu.field || edu.major || '').toLowerCase();
      const related = relatedFields[requiredLower] || [];
      if (related.some(r => field.includes(r))) {
        return 0.7; // Partial match for related field
      }
    }
    
    return 0.0;
  }

  /**
   * Calculate GPA score
   */
  calculateGPAScore(userEducation) {
    const gpas = userEducation
      .map(edu => parseFloat(edu.gpa))
      .filter(gpa => !isNaN(gpa) && gpa > 0);
    
    if (gpas.length === 0) return 0.5; // Default if not provided
    
    const maxGPA = Math.max(...gpas);
    return Math.min(maxGPA / 4.0, 1.0); // Normalize to 0-1 (assuming 4.0 scale)
  }

  /**
   * Calculate institution bonus for prestigious universities
   */
  calculateInstitutionBonus(userEducation) {
    const prestigiousSchools = [
      'stanford', 'mit', 'harvard', 'berkeley', 'cmu', 'caltech',
      'princeton', 'yale', 'columbia', 'cornell', 'upenn', 'michigan'
    ];
    
    for (const edu of userEducation) {
      const school = (edu.school || '').toLowerCase();
      if (prestigiousSchools.some(ps => school.includes(ps))) {
        return 0.2; // 20% bonus
      }
    }
    
    return 0.0;
  }

  /**
   * Check if locations are in same city
   */
  isSameCity(loc1, loc2) {
    // Simple city name matching
    const city1 = loc1.split(',')[0].trim();
    const city2 = loc2.split(',')[0].trim();
    return city1 === city2;
  }

  /**
   * Check if locations are in same state
   */
  isSameState(loc1, loc2) {
    const state1 = this.extractState(loc1);
    const state2 = this.extractState(loc2);
    return state1 && state2 && state1 === state2;
  }

  /**
   * Check if locations are in same country
   */
  isSameCountry(loc1, loc2) {
    const country1 = this.extractCountry(loc1);
    const country2 = this.extractCountry(loc2);
    return country1 && country2 && country1 === country2;
  }

  /**
   * Extract state from location string
   */
  extractState(location) {
    const usStates = ['CA', 'NY', 'TX', 'FL', 'WA', 'IL', 'MA', 'PA', 'OH', 'GA'];
    const parts = location.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (usStates.includes(part.toUpperCase())) {
        return part.toUpperCase();
      }
    }
    
    return null;
  }

  /**
   * Extract country from location string
   */
  extractCountry(location) {
    const countries = ['usa', 'canada', 'uk', 'india', 'germany', 'france', 'australia'];
    const lowerLoc = location.toLowerCase();
    
    for (const country of countries) {
      if (lowerLoc.includes(country)) {
        return country;
      }
    }
    
    return 'usa'; // Default
  }

  /**
   * Flatten resume text for similarity calculations
   */
  flattenResumeText(resume) {
    const parts = [];
    
    if (resume.summary) parts.push(resume.summary);
    if (resume.experience) {
      parts.push(...resume.experience.map(exp => 
        `${exp.title} ${exp.company} ${exp.description}`
      ));
    }
    if (resume.skills) {
      parts.push(JSON.stringify(resume.skills));
    }
    
    return parts.join(' ');
  }

  /**
   * Calculate cosine similarity between two texts
   */
  calculateCosineSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = [...set1].filter(x => set2.has(x)).length;
    const union = set1.size + set2.size - intersection;
    
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Calculate keyword density
   */
  calculateKeywordDensity(jobText, resumeText) {
    const jobWords = jobText.split(/\s+/).filter(w => w.length > 3);
    const resumeWords = resumeText.split(/\s+/);
    
    const importantWords = jobWords.slice(0, 50); // Top 50 words
    const matches = importantWords.filter(w => resumeWords.includes(w)).length;
    
    return Math.min(matches / 50, 1.0);
  }

  /**
   * Calculate resume relevance score
   */
  calculateResumeRelevance(jobText, resumeText) {
    // Use cosine similarity as proxy for relevance
    return this.calculateCosineSimilarity(jobText, resumeText);
  }

  /**
   * Calculate buzzword match
   */
  calculateBuzzwordMatch(jobText, resumeText) {
    const buzzwords = [
      'agile', 'scrum', 'ci/cd', 'cloud', 'scalable', 'microservices',
      'distributed', 'rest', 'api', 'responsive', 'cross-functional',
      'collaborative', 'innovative', 'optimization', 'automation'
    ];
    
    const jobBuzzwords = buzzwords.filter(b => jobText.includes(b));
    const resumeBuzzwords = buzzwords.filter(b => resumeText.includes(b));
    
    const matches = jobBuzzwords.filter(b => resumeBuzzwords.includes(b)).length;
    
    return jobBuzzwords.length > 0 ? matches / jobBuzzwords.length : 0.5;
  }

  /**
   * Check if company is Fortune 500
   */
  isFortune500Company(companyName) {
    const fortune500 = [
      'google', 'apple', 'microsoft', 'amazon', 'facebook', 'meta',
      'netflix', 'tesla', 'salesforce', 'oracle', 'ibm', 'intel',
      'walmart', 'target', 'cvs', 'jpmorgan', 'bank of america'
    ];
    
    const lowerName = companyName.toLowerCase();
    return fortune500.some(f => lowerName.includes(f));
  }

  /**
   * Normalize job level to 0-1 scale
   */
  normalizeJobLevel(seniorityValue) {
    // seniorityValue is 1-9, normalize to 0-1
    return (seniorityValue - 1) / 8;
  }

  /**
   * Calculate salary competitiveness
   */
  calculateSalaryCompetitiveness(salaryRange) {
    if (!salaryRange || !salaryRange.min) return 0.5;
    
    // Compare to market averages (simplified)
    const marketAverages = {
      'entry': 70000,
      'mid': 100000,
      'senior': 140000,
      'lead': 180000
    };
    
    const avgSalary = (salaryRange.min + (salaryRange.max || salaryRange.min)) / 2;
    
    // Normalize: 0.8-1.2 of market average = competitive
    const marketAvg = marketAverages['mid']; // Default
    const ratio = avgSalary / marketAvg;
    
    if (ratio >= 0.8 && ratio <= 1.2) return 1.0;
    if (ratio >= 0.6 && ratio < 0.8) return 0.7;
    if (ratio > 1.2 && ratio <= 1.5) return 0.9;
    return 0.5;
  }

  /**
   * Get feature names and descriptions for documentation
   */
  getFeatureNames() {
    return {
      // Skill features (5)
      skill_match_score: 'Overall skill match (0-1)',
      required_skills_coverage: 'Required skills coverage (0-1)',
      preferred_skills_coverage: 'Preferred skills coverage (0-1)',
      unique_skills_count: 'Additional skills beyond job requirements',
      skill_depth_score: 'Skill depth indicator (0-1)',
      
      // Experience features (7)
      experience_match_score: 'Experience level match (0-1)',
      years_of_experience: 'Total years of experience',
      required_years: 'Required years (null if not specified)',
      experience_gap: 'Years below requirement (0 if exceeds)',
      seniority_match: 'Seniority level alignment (0-1)',
      industry_match: 'Industry experience match (0-1)',
      company_size_match: 'Company size match (0-1)',
      
      // Education features (5)
      education_match: 'Education level match (0-1)',
      education_level_score: 'Education level (0-1)',
      field_match: 'Field of study match (0-1)',
      gpa_score: 'GPA score (0-1)',
      institution_bonus: 'Prestigious institution bonus (0-0.2)',
      
      // Location features (3)
      location_match: 'Location alignment (0-1)',
      is_remote: 'Remote position indicator (0/1)',
      relocation_willingness: 'Willing to relocate (0/1)',
      
      // Timing features (5)
      days_since_posted: 'Days since job was posted',
      application_speed_score: 'Application timing score (0-1)',
      is_early_applicant: 'Applied within first 3 days (0/1)',
      time_of_day_score: 'Applied during business hours (0-1)',
      day_of_week_score: 'Applied on weekday (0-1)',
      
      // Text similarity features (5)
      title_similarity: 'Job title similarity (0-1)',
      description_similarity: 'Description similarity (0-1)',
      keyword_density: 'Important keyword density (0-1)',
      resume_relevance_score: 'Resume relevance to job (0-1)',
      buzzword_match: 'Industry buzzword match (0-1)',
      
      // Job characteristics (5)
      job_popularity: 'Job popularity indicator (0-1)',
      company_size: 'Company size (0-1)',
      is_fortune_500: 'Fortune 500 company (0/1)',
      job_level: 'Job level (0-1)',
      salary_competitiveness: 'Salary competitiveness (0-1)'
    };
  }

  /**
   * Get feature importance weights (for model interpretation)
   */
  getFeatureImportance() {
    return {
      // Critical features (high importance)
      skill_match_score: 0.15,
      required_skills_coverage: 0.12,
      experience_match_score: 0.10,
      seniority_match: 0.08,
      
      // Important features (medium importance)
      education_match: 0.07,
      location_match: 0.06,
      description_similarity: 0.06,
      application_speed_score: 0.05,
      industry_match: 0.05,
      
      // Moderate features (lower importance)
      preferred_skills_coverage: 0.04,
      field_match: 0.04,
      company_size_match: 0.03,
      is_early_applicant: 0.03,
      keyword_density: 0.03,
      
      // Minor features (minimal importance)
      skill_depth_score: 0.02,
      gpa_score: 0.02,
      buzzword_match: 0.02,
      institution_bonus: 0.01,
      is_fortune_500: 0.01,
      salary_competitiveness: 0.01
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeatureEngineeringService;
}
