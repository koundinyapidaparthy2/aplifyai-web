/**
 * Resume Variant Generator
 * Generate multiple resume variants optimized for different purposes
 */

class ResumeVariantGenerator {
  constructor(tailoringService) {
    this.tailoringService = tailoringService;
  }

  /**
   * Generate multiple resume variants
   * @param {object} resumeData - Base resume data
   * @param {object} jobAnalysis - Job description analysis
   * @returns {Promise<Array>} Array of resume variants
   */
  async generateVariants(resumeData, jobAnalysis) {
    const variants = [];

    // 1. ATS-Optimized Variant
    variants.push(await this.generateATSOptimized(resumeData, jobAnalysis));

    // 2. Visual/Creative Variant
    variants.push(await this.generateVisual(resumeData, jobAnalysis));

    // 3. Concise Variant (1-page)
    variants.push(await this.generateConcise(resumeData, jobAnalysis));

    // 4. Detailed Variant (2-page)
    variants.push(await this.generateDetailed(resumeData, jobAnalysis));

    // Score each variant
    variants.forEach(variant => {
      variant.score = this.scoreVariant(variant, jobAnalysis);
    });

    // Sort by score
    variants.sort((a, b) => b.score.overall - a.score.overall);

    return variants;
  }

  /**
   * Generate ATS-optimized variant
   */
  async generateATSOptimized(resumeData, jobAnalysis) {
    const variant = JSON.parse(JSON.stringify(resumeData));

    return {
      id: 'ats-optimized',
      name: 'ATS-Optimized',
      description: 'Optimized for Applicant Tracking Systems with keyword density',
      data: {
        ...variant,
        format: 'simple',
        font: 'Arial',
        sections: {
          summary: { weight: 'high', keywords: this.getTopKeywords(jobAnalysis, 10) },
          experience: { weight: 'high', keywordDensity: 'high' },
          skills: { weight: 'high', format: 'list' },
          education: { weight: 'medium' },
        },
        styling: {
          colors: false,
          graphics: false,
          tables: false,
          columns: 1,
        },
        keywords: this.injectKeywords(variant, jobAnalysis, 'high'),
      },
      optimizations: [
        'Simple formatting for ATS parsing',
        'High keyword density',
        'Standard section headers',
        'Single column layout',
        'No graphics or complex formatting',
      ],
      recommendedFor: ['Large companies', 'Fortune 500', 'Corporate applications'],
    };
  }

  /**
   * Generate visual/creative variant
   */
  async generateVisual(resumeData, jobAnalysis) {
    const variant = JSON.parse(JSON.stringify(resumeData));

    return {
      id: 'visual',
      name: 'Visual/Creative',
      description: 'Eye-catching design with visual elements',
      data: {
        ...variant,
        format: 'modern',
        font: 'Modern Sans-serif',
        sections: {
          summary: { weight: 'high', style: 'highlighted' },
          experience: { weight: 'high', style: 'timeline' },
          skills: { weight: 'high', format: 'bars' },
          projects: { weight: 'high', style: 'cards' },
        },
        styling: {
          colors: true,
          graphics: true,
          charts: true,
          columns: 2,
          accentColor: this.getSuggestedColor(jobAnalysis),
        },
      },
      optimizations: [
        'Two-column layout',
        'Visual skill indicators',
        'Accent colors for emphasis',
        'Icons for sections',
        'Modern typography',
      ],
      recommendedFor: ['Startups', 'Creative agencies', 'Design roles', 'Small companies'],
    };
  }

  /**
   * Generate concise variant (1-page)
   */
  async generateConcise(resumeData, jobAnalysis) {
    const variant = JSON.parse(JSON.stringify(resumeData));

    // Limit experience to top 2-3
    if (variant.experience) {
      variant.experience = variant.experience.slice(0, 3);
      variant.experience.forEach(exp => {
        if (exp.responsibilities) {
          exp.responsibilities = exp.responsibilities.slice(0, 3);
        }
      });
    }

    // Limit projects to top 2
    if (variant.projects) {
      variant.projects = variant.projects.slice(0, 2);
    }

    return {
      id: 'concise',
      name: 'Concise (1-page)',
      description: 'Condensed to one page with most relevant information',
      data: {
        ...variant,
        format: 'compact',
        font: 'Compact Sans-serif',
        pageLimit: 1,
        sections: {
          summary: { weight: 'medium', maxLength: 100 },
          experience: { weight: 'high', maxItems: 3, maxBulletsPerItem: 3 },
          skills: { weight: 'high', maxItems: 12 },
          projects: { weight: 'medium', maxItems: 2 },
          education: { weight: 'low' },
        },
      },
      optimizations: [
        'Strict one-page limit',
        'Top 3 most relevant experiences',
        'Concise bullet points',
        'Essential skills only',
        'Tight spacing',
      ],
      recommendedFor: ['Junior positions', 'Quick applications', 'Career fairs', 'Networking'],
    };
  }

  /**
   * Generate detailed variant (2-page)
   */
  async generateDetailed(resumeData, jobAnalysis) {
    const variant = JSON.parse(JSON.stringify(resumeData));

    return {
      id: 'detailed',
      name: 'Detailed (2-page)',
      description: 'Comprehensive with full project details and achievements',
      data: {
        ...variant,
        format: 'detailed',
        font: 'Professional Serif',
        pageLimit: 2,
        sections: {
          summary: { weight: 'high', maxLength: 200 },
          experience: { weight: 'high', maxItems: 5, maxBulletsPerItem: 6 },
          projects: { weight: 'high', maxItems: 5, includeDetails: true },
          skills: { weight: 'high', categorized: true },
          education: { weight: 'medium', includeCoursework: true },
          certifications: { weight: 'medium' },
          awards: { weight: 'low' },
        },
      },
      optimizations: [
        'Full professional history',
        'Detailed project descriptions',
        'Comprehensive skill categories',
        'Additional sections included',
        'Academic details',
      ],
      recommendedFor: ['Senior positions', 'Technical roles', 'Academia', 'Research'],
    };
  }

  /**
   * Score variant against job requirements
   */
  scoreVariant(variant, jobAnalysis) {
    const scores = {
      atsCompatibility: this.scoreATSCompatibility(variant),
      keywordMatch: this.scoreKeywordMatch(variant, jobAnalysis),
      relevance: this.scoreRelevance(variant, jobAnalysis),
      readability: this.scoreReadability(variant),
      completeness: this.scoreCompleteness(variant),
    };

    // Calculate overall score
    scores.overall = Math.round(
      (scores.atsCompatibility * 0.25) +
      (scores.keywordMatch * 0.30) +
      (scores.relevance * 0.25) +
      (scores.readability * 0.10) +
      (scores.completeness * 0.10)
    );

    return scores;
  }

  scoreATSCompatibility(variant) {
    let score = 100;

    // Penalize complex formatting
    if (variant.data.styling?.colors) score -= 10;
    if (variant.data.styling?.graphics) score -= 10;
    if (variant.data.styling?.tables) score -= 15;
    if (variant.data.styling?.columns > 1) score -= 20;

    // Reward standard format
    if (variant.data.format === 'simple') score += 20;

    return Math.max(0, Math.min(100, score));
  }

  scoreKeywordMatch(variant, jobAnalysis) {
    const variantText = JSON.stringify(variant.data).toLowerCase();
    const topKeywords = jobAnalysis.keywords.top.slice(0, 20);
    
    const matchedKeywords = topKeywords.filter(k => 
      variantText.includes(k.word)
    );

    return Math.round((matchedKeywords.length / topKeywords.length) * 100);
  }

  scoreRelevance(variant, jobAnalysis) {
    // Check required skills
    const requiredSkills = jobAnalysis.skills.required;
    const variantSkills = variant.data.skills || [];
    
    const matchedSkills = variantSkills.filter(skill =>
      requiredSkills.some(req => skill.toLowerCase().includes(req.toLowerCase()))
    );

    const skillScore = requiredSkills.length > 0 
      ? (matchedSkills.length / requiredSkills.length) * 100 
      : 50;

    return Math.round(skillScore);
  }

  scoreReadability(variant) {
    // Simple heuristic based on structure
    let score = 70;

    if (variant.data.sections?.summary) score += 10;
    if (variant.data.sections?.experience) score += 10;
    if (variant.data.sections?.skills) score += 10;

    return Math.min(100, score);
  }

  scoreCompleteness(variant) {
    const sections = variant.data.sections || {};
    const totalSections = Object.keys(sections).length;
    
    return Math.min(100, totalSections * 15);
  }

  /**
   * Get top keywords from job analysis
   */
  getTopKeywords(jobAnalysis, count = 10) {
    return jobAnalysis.keywords.top.slice(0, count).map(k => k.word);
  }

  /**
   * Inject keywords into resume
   */
  injectKeywords(resume, jobAnalysis, density = 'medium') {
    const keywords = this.getTopKeywords(jobAnalysis, density === 'high' ? 20 : 10);
    
    return {
      ...resume,
      keywordsInjected: keywords,
      keywordDensity: density,
    };
  }

  /**
   * Get suggested accent color based on industry/company
   */
  getSuggestedColor(jobAnalysis) {
    const colorMap = {
      technology: '#3498db', // Blue
      finance: '#2c3e50', // Dark Blue
      healthcare: '#27ae60', // Green
      creative: '#e74c3c', // Red
      consulting: '#34495e', // Dark Grey
      default: '#2980b9', // Professional Blue
    };

    return colorMap[jobAnalysis.industry.primary] || colorMap.default;
  }

  /**
   * Get variant recommendations
   */
  getRecommendations(variants, jobAnalysis) {
    const recommendations = [];

    // Recommend based on company type
    if (jobAnalysis.companyType.type === 'startup') {
      recommendations.push({
        variantId: 'visual',
        reason: 'Startups often appreciate creative, modern resumes',
        confidence: 80,
      });
    } else if (jobAnalysis.companyType.type === 'corporate') {
      recommendations.push({
        variantId: 'ats-optimized',
        reason: 'Large companies typically use ATS systems',
        confidence: 90,
      });
    }

    // Recommend based on seniority
    if (jobAnalysis.seniorityLevel.level === 'junior' || 
        jobAnalysis.seniorityLevel.level === 'intern') {
      recommendations.push({
        variantId: 'concise',
        reason: 'Entry-level positions prefer concise resumes',
        confidence: 75,
      });
    } else if (jobAnalysis.seniorityLevel.level === 'senior' ||
               jobAnalysis.seniorityLevel.level === 'director') {
      recommendations.push({
        variantId: 'detailed',
        reason: 'Senior roles benefit from detailed experience',
        confidence: 85,
      });
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations;
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResumeVariantGenerator;
}
