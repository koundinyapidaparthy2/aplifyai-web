/**
 * Resume Tailoring Service
 * Sophisticated resume customization based on job description analysis
 */

class ResumeTailoring {
  constructor(analyzer) {
    this.analyzer = analyzer;
  }

  /**
   * Tailor resume based on job analysis
   * @param {object} resumeData - Original resume data
   * @param {object} jobAnalysis - Job description analysis results
   * @returns {object} Tailored resume data
   */
  async tailorResume(resumeData, jobAnalysis) {
    const tailored = JSON.parse(JSON.stringify(resumeData)); // Deep clone

    // Apply tailoring strategies
    tailored.skills = this.reorderSkills(resumeData.skills, jobAnalysis);
    tailored.experience = this.emphasizeRelevantExperience(resumeData.experience, jobAnalysis);
    tailored.projects = this.emphasizeRelevantProjects(resumeData.projects, jobAnalysis);
    tailored.summary = await this.adjustSummary(resumeData.summary, jobAnalysis);
    tailored.tone = this.adjustTone(resumeData, jobAnalysis);
    tailored.sections = this.adjustSections(resumeData, jobAnalysis);
    tailored.quantification = this.addQuantification(resumeData, jobAnalysis);

    // Add metadata
    tailored.meta = {
      tailoredFor: jobAnalysis.metadata.companyName,
      tailoredAt: new Date().toISOString(),
      matchScore: this.calculateMatchScore(tailored, jobAnalysis),
      appliedStrategies: this.getAppliedStrategies(jobAnalysis),
    };

    return tailored;
  }

  /**
   * Reorder skills based on job requirements priority
   */
  reorderSkills(skills, jobAnalysis) {
    if (!skills || !Array.isArray(skills)) return skills;

    const prioritySkills = jobAnalysis.skills.priorityOrder || [];
    const requiredSkills = jobAnalysis.skills.required || [];
    const preferredSkills = jobAnalysis.skills.preferred || [];

    // Create skill score map
    const skillScores = new Map();
    skills.forEach(skill => {
      let score = 0;
      const skillLower = skill.toLowerCase();

      // Check if required (highest priority)
      if (requiredSkills.some(rs => skillLower.includes(rs.toLowerCase()))) {
        score += 100;
      }

      // Check if preferred
      if (preferredSkills.some(ps => skillLower.includes(ps.toLowerCase()))) {
        score += 50;
      }

      // Check priority order
      const priorityIndex = prioritySkills.findIndex(ps => 
        skillLower.includes(ps.toLowerCase())
      );
      if (priorityIndex >= 0) {
        score += (prioritySkills.length - priorityIndex) * 10;
      }

      // Check frequency in job description
      const frequency = jobAnalysis.keywords.top.find(k => 
        skillLower.includes(k.word)
      )?.count || 0;
      score += frequency * 5;

      skillScores.set(skill, score);
    });

    // Sort skills by score
    return skills.sort((a, b) => {
      const scoreA = skillScores.get(a) || 0;
      const scoreB = skillScores.get(b) || 0;
      return scoreB - scoreA;
    });
  }

  /**
   * Emphasize relevant experience based on job requirements
   */
  emphasizeRelevantExperience(experience, jobAnalysis) {
    if (!experience || !Array.isArray(experience)) return experience;

    return experience.map(exp => {
      const emphasized = { ...exp };
      
      // Calculate relevance score for each responsibility
      if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
        const scoredResponsibilities = exp.responsibilities.map(resp => ({
          text: resp,
          score: this.calculateRelevanceScore(resp, jobAnalysis),
        }));

        // Sort by relevance
        scoredResponsibilities.sort((a, b) => b.score - a.score);
        
        // Take top responsibilities (limit to 5-6 for readability)
        emphasized.responsibilities = scoredResponsibilities
          .slice(0, 6)
          .map(r => r.text);
      }

      // Add relevance tags
      emphasized.relevanceScore = this.calculatePositionRelevance(exp, jobAnalysis);
      
      // Rewrite bullets to match job emphasis
      if (jobAnalysis.emphasis.primary) {
        emphasized.responsibilities = this.rewriteBulletsForEmphasis(
          emphasized.responsibilities,
          jobAnalysis.emphasis.primary
        );
      }

      return emphasized;
    });
  }

  /**
   * Emphasize relevant projects
   */
  emphasizeRelevantProjects(projects, jobAnalysis) {
    if (!projects || !Array.isArray(projects)) return projects;

    // Score each project
    const scoredProjects = projects.map(project => ({
      ...project,
      relevanceScore: this.calculateProjectRelevance(project, jobAnalysis),
    }));

    // Sort by relevance
    scoredProjects.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Enhance descriptions for top projects
    return scoredProjects.map((project, index) => {
      if (index < 3) {
        // Top 3 projects get enhanced descriptions
        project.description = this.enhanceProjectDescription(
          project.description,
          jobAnalysis
        );
      }
      return project;
    });
  }

  /**
   * Adjust summary/objective based on job analysis
   */
  async adjustSummary(summary, jobAnalysis) {
    if (!summary) return summary;

    const { formality, emphasis, seniorityLevel, companyType } = jobAnalysis;

    // Build enhanced summary
    let adjusted = summary;

    // Add relevant keywords
    const topKeywords = jobAnalysis.keywords.top.slice(0, 5).map(k => k.word);
    
    // Adjust tone
    if (formality.score > 70) {
      // Formal tone
      adjusted = this.makeFormal(adjusted);
    } else if (formality.score < 40) {
      // Casual tone
      adjusted = this.makeCasual(adjusted);
    }

    // Emphasize primary focus
    if (emphasis.primary === 'leadership') {
      adjusted = this.addLeadershipEmphasis(adjusted);
    } else if (emphasis.primary === 'technical') {
      adjusted = this.addTechnicalEmphasis(adjusted);
    }

    // Match seniority level
    adjusted = this.matchSeniorityLevel(adjusted, seniorityLevel.level);

    return adjusted;
  }

  /**
   * Adjust overall tone
   */
  adjustTone(resumeData, jobAnalysis) {
    const formality = jobAnalysis.formality.score;
    
    if (formality > 70) {
      return {
        level: 'formal',
        guidelines: [
          'Use third person or passive voice',
          'Avoid contractions',
          'Use professional terminology',
          'Formal section headers',
        ],
      };
    } else if (formality < 40) {
      return {
        level: 'casual',
        guidelines: [
          'Use first person',
          'Contractions are acceptable',
          'Show personality',
          'Creative section headers',
        ],
      };
    }

    return {
      level: 'professional',
      guidelines: [
        'Balance professional and approachable',
        'Clear and concise language',
        'Action-oriented bullets',
      ],
    };
  }

  /**
   * Adjust sections based on job requirements
   */
  adjustSections(resumeData, jobAnalysis) {
    const sections = {
      summary: { include: true, order: 1 },
      experience: { include: true, order: 2 },
      education: { include: true, order: 5 },
      skills: { include: true, order: 3 },
      projects: { include: true, order: 4 },
      certifications: { include: false, order: 6 },
      awards: { include: false, order: 7 },
      publications: { include: false, order: 8 },
    };

    // Adjust based on seniority
    if (jobAnalysis.seniorityLevel.level === 'executive' || 
        jobAnalysis.seniorityLevel.level === 'director') {
      // Leadership roles: Experience first
      sections.experience.order = 1;
      sections.summary.order = 2;
      sections.education.order = 6;
    } else if (jobAnalysis.seniorityLevel.level === 'junior' || 
               jobAnalysis.seniorityLevel.level === 'intern') {
      // Entry level: Education first
      sections.education.order = 2;
      sections.experience.order = 3;
    }

    // Include certifications if job mentions them
    if (jobAnalysis.skills.certifications.length > 0) {
      sections.certifications.include = true;
      sections.certifications.order = 4;
    }

    // Include projects if emphasis is on technical/innovation
    if (jobAnalysis.emphasis.primary === 'technical' || 
        jobAnalysis.emphasis.primary === 'innovation') {
      sections.projects.include = true;
      sections.projects.order = 3;
      sections.skills.order = 4;
    }

    return sections;
  }

  /**
   * Add quantification to achievements
   */
  addQuantification(resumeData, jobAnalysis) {
    const suggestions = [];

    // Check if job emphasizes impact/metrics
    const emphasizesImpact = jobAnalysis.emphasis.distribution
      .find(d => d.area === 'impact')?.score > 5;

    if (!emphasizesImpact) {
      return { needed: false, suggestions: [] };
    }

    // Analyze experience bullets
    if (resumeData.experience) {
      resumeData.experience.forEach((exp, expIndex) => {
        if (exp.responsibilities) {
          exp.responsibilities.forEach((resp, respIndex) => {
            if (!this.hasQuantification(resp)) {
              suggestions.push({
                section: 'experience',
                expIndex,
                respIndex,
                original: resp,
                suggestion: this.generateQuantificationSuggestion(resp),
              });
            }
          });
        }
      });
    }

    return {
      needed: true,
      suggestions,
      examples: this.getQuantificationExamples(),
    };
  }

  /**
   * Calculate relevance score for text against job analysis
   */
  calculateRelevanceScore(text, jobAnalysis) {
    let score = 0;
    const textLower = text.toLowerCase();

    // Check for required skills
    jobAnalysis.skills.required.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        score += 10;
      }
    });

    // Check for preferred skills
    jobAnalysis.skills.preferred.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        score += 5;
      }
    });

    // Check for keywords
    jobAnalysis.keywords.top.forEach(keyword => {
      if (textLower.includes(keyword.word)) {
        score += keyword.weight * 100;
      }
    });

    // Check for action verbs
    jobAnalysis.keywords.action.forEach(verb => {
      if (textLower.includes(verb)) {
        score += 3;
      }
    });

    return score;
  }

  /**
   * Calculate position relevance
   */
  calculatePositionRelevance(position, jobAnalysis) {
    let score = 0;

    // Title similarity
    if (position.title && jobAnalysis.metadata.jobTitle) {
      const titleSimilarity = this.calculateStringSimilarity(
        position.title.toLowerCase(),
        jobAnalysis.metadata.jobTitle.toLowerCase()
      );
      score += titleSimilarity * 20;
    }

    // Industry match
    if (position.industry === jobAnalysis.industry.primary) {
      score += 15;
    }

    // Skills used in position
    if (position.technologies) {
      position.technologies.forEach(tech => {
        if (jobAnalysis.skills.required.includes(tech.toLowerCase())) {
          score += 5;
        }
      });
    }

    // Responsibilities relevance
    if (position.responsibilities) {
      const avgRelevance = position.responsibilities.reduce((sum, resp) => 
        sum + this.calculateRelevanceScore(resp, jobAnalysis), 0
      ) / position.responsibilities.length;
      score += avgRelevance;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate project relevance
   */
  calculateProjectRelevance(project, jobAnalysis) {
    let score = 0;

    // Technologies match
    if (project.technologies) {
      project.technologies.forEach(tech => {
        if (jobAnalysis.skills.technical.some(s => 
          s.name.toLowerCase() === tech.toLowerCase())) {
          score += 10;
        }
      });
    }

    // Description relevance
    if (project.description) {
      score += this.calculateRelevanceScore(project.description, jobAnalysis);
    }

    // Impact/metrics mention
    if (project.impact || this.hasQuantification(project.description)) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  /**
   * Rewrite bullets to match emphasis
   */
  rewriteBulletsForEmphasis(responsibilities, emphasis) {
    if (!responsibilities) return responsibilities;

    const emphasisPrefixes = {
      leadership: ['Led', 'Managed', 'Directed', 'Oversaw', 'Mentored'],
      technical: ['Developed', 'Engineered', 'Architected', 'Implemented', 'Built'],
      collaboration: ['Collaborated', 'Partnered', 'Coordinated', 'Worked with'],
      innovation: ['Pioneered', 'Innovated', 'Created', 'Designed', 'Launched'],
      impact: ['Achieved', 'Delivered', 'Increased', 'Reduced', 'Improved'],
    };

    const prefixes = emphasisPrefixes[emphasis] || [];
    if (prefixes.length === 0) return responsibilities;

    return responsibilities.map(resp => {
      // If bullet doesn't start with strong verb, try to rewrite
      const startsWithStrongVerb = prefixes.some(prefix => 
        resp.toLowerCase().startsWith(prefix.toLowerCase())
      );

      if (!startsWithStrongVerb) {
        // Simple rewrite: prepend appropriate verb
        // In production, use AI to rewrite more naturally
        return resp; // Keep original for now
      }

      return resp;
    });
  }

  /**
   * Enhance project description
   */
  enhanceProjectDescription(description, jobAnalysis) {
    if (!description) return description;

    // Add relevant keywords if missing
    let enhanced = description;
    
    // Check if description has quantification
    if (!this.hasQuantification(enhanced)) {
      enhanced += ' (Note: Add specific metrics like users, performance, or impact)';
    }

    return enhanced;
  }

  /**
   * Make text more formal
   */
  makeFormal(text) {
    return text
      .replace(/I'm/g, 'I am')
      .replace(/I've/g, 'I have')
      .replace(/you're/g, 'you are')
      .replace(/can't/g, 'cannot');
  }

  /**
   * Make text more casual
   */
  makeCasual(text) {
    // Add personality while keeping professional
    return text;
  }

  /**
   * Add leadership emphasis to summary
   */
  addLeadershipEmphasis(summary) {
    if (summary.toLowerCase().includes('lead') || 
        summary.toLowerCase().includes('manage')) {
      return summary;
    }
    return summary + ' Proven leadership in managing cross-functional teams.';
  }

  /**
   * Add technical emphasis to summary
   */
  addTechnicalEmphasis(summary) {
    if (summary.toLowerCase().includes('technical') || 
        summary.toLowerCase().includes('engineer')) {
      return summary;
    }
    return summary + ' Strong technical expertise in modern technologies.';
  }

  /**
   * Match summary to seniority level
   */
  matchSeniorityLevel(summary, level) {
    const seniorityPhrases = {
      intern: 'Motivated student seeking to apply skills',
      junior: 'Early-career professional with foundational skills',
      mid: 'Experienced professional with proven track record',
      senior: 'Senior professional with extensive expertise',
      staff: 'Principal engineer with deep technical expertise',
      director: 'Strategic leader with proven ability to drive results',
      executive: 'Executive leader with comprehensive industry experience',
    };

    // Check if summary already reflects seniority
    const phrase = seniorityPhrases[level];
    if (phrase && !summary.includes(phrase)) {
      return phrase + '. ' + summary;
    }

    return summary;
  }

  /**
   * Check if text has quantification
   */
  hasQuantification(text) {
    if (!text) return false;
    
    const quantificationPatterns = [
      /\d+%/,  // Percentages
      /\d+\+/,  // Numbers with +
      /\$\d+/,  // Dollar amounts
      /\d+ (users|customers|clients|employees|projects)/i,
      /increased|decreased|improved|reduced/i,
    ];

    return quantificationPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Generate quantification suggestion
   */
  generateQuantificationSuggestion(text) {
    return `Add metrics to: "${text}"\n` +
           `Example: "${text} resulting in 30% improvement in performance"`;
  }

  /**
   * Get quantification examples
   */
  getQuantificationExamples() {
    return [
      'Led team of 5 engineers to deliver project 2 weeks ahead of schedule',
      'Improved application performance by 40% through optimization',
      'Increased user engagement by 25% through feature enhancements',
      'Reduced server costs by $50K annually through infrastructure optimization',
      'Mentored 3 junior developers, resulting in 2 promotions',
    ];
  }

  /**
   * Calculate string similarity (simple Jaccard similarity)
   */
  calculateStringSimilarity(str1, str2) {
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate match score
   */
  calculateMatchScore(tailoredResume, jobAnalysis) {
    let score = 0;
    const weights = {
      skills: 0.3,
      experience: 0.3,
      keywords: 0.2,
      formality: 0.1,
      quantification: 0.1,
    };

    // Skills match
    const skillsMatch = this.calculateSkillsMatch(tailoredResume.skills, jobAnalysis);
    score += skillsMatch * weights.skills;

    // Experience relevance
    const expRelevance = this.calculateExperienceRelevance(tailoredResume.experience, jobAnalysis);
    score += expRelevance * weights.experience;

    // Keyword density
    const keywordDensity = this.calculateKeywordDensity(tailoredResume, jobAnalysis);
    score += keywordDensity * weights.keywords;

    // Formality match
    const formalityMatch = this.calculateFormalityMatch(tailoredResume, jobAnalysis);
    score += formalityMatch * weights.formality;

    // Quantification
    const quantificationScore = this.calculateQuantificationScore(tailoredResume);
    score += quantificationScore * weights.quantification;

    return Math.round(score * 100);
  }

  calculateSkillsMatch(skills, jobAnalysis) {
    if (!skills || skills.length === 0) return 0;
    
    const requiredSkills = jobAnalysis.skills.required;
    const matchedSkills = skills.filter(skill => 
      requiredSkills.some(req => skill.toLowerCase().includes(req.toLowerCase()))
    );

    return requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0.5;
  }

  calculateExperienceRelevance(experience, jobAnalysis) {
    if (!experience || experience.length === 0) return 0;
    
    const avgRelevance = experience.reduce((sum, exp) => 
      sum + (exp.relevanceScore || 0), 0
    ) / experience.length;

    return avgRelevance / 100;
  }

  calculateKeywordDensity(resume, jobAnalysis) {
    const resumeText = JSON.stringify(resume).toLowerCase();
    const topKeywords = jobAnalysis.keywords.top.slice(0, 10);
    
    const matchedKeywords = topKeywords.filter(k => 
      resumeText.includes(k.word)
    );

    return matchedKeywords.length / topKeywords.length;
  }

  calculateFormalityMatch(resume, jobAnalysis) {
    // Simple check - in production, analyze actual tone
    return 0.8;
  }

  calculateQuantificationScore(resume) {
    if (!resume.experience) return 0;
    
    let total = 0;
    let quantified = 0;

    resume.experience.forEach(exp => {
      if (exp.responsibilities) {
        exp.responsibilities.forEach(resp => {
          total++;
          if (this.hasQuantification(resp)) {
            quantified++;
          }
        });
      }
    });

    return total > 0 ? quantified / total : 0;
  }

  /**
   * Get applied strategies
   */
  getAppliedStrategies(jobAnalysis) {
    const strategies = [];

    if (jobAnalysis.skills.required.length > 0) {
      strategies.push('skills_reordering');
    }

    if (jobAnalysis.formality.score > 70 || jobAnalysis.formality.score < 40) {
      strategies.push('tone_adjustment');
    }

    if (jobAnalysis.emphasis.primary) {
      strategies.push('emphasis_matching');
    }

    return strategies;
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResumeTailoring;
}
