/**
 * Feedback Generator Service
 * 
 * Generates actionable feedback based on prediction results:
 * - Identify skill gaps
 * - Suggest resume improvements
 * - Recommend experience to gain
 * - Provide specific action items
 * - Estimate impact of improvements
 */

class FeedbackGeneratorService {
  constructor() {
    this.featureService = new FeatureEngineeringService();
    this.predictionService = new ApplicationPredictionService();
    
    // Skill recommendations database
    this.skillSuggestions = {
      'javascript': ['React', 'Node.js', 'TypeScript', 'Vue.js', 'Angular'],
      'python': ['Django', 'Flask', 'Pandas', 'NumPy', 'TensorFlow'],
      'react': ['Redux', 'React Native', 'Next.js', 'TypeScript', 'Jest'],
      'java': ['Spring Boot', 'Hibernate', 'Maven', 'JUnit', 'Microservices'],
      'cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
      'data': ['SQL', 'Python', 'Tableau', 'Power BI', 'Spark']
    };
    
    // Experience level progression
    this.careerProgression = {
      'entry': { next: 'junior', years: 1, skills: 3 },
      'junior': { next: 'mid', years: 2, skills: 5 },
      'mid': { next: 'senior', years: 3, skills: 8 },
      'senior': { next: 'lead', years: 4, skills: 10 },
      'lead': { next: 'principal', years: 5, skills: 12 }
    };
  }

  /**
   * Generate comprehensive feedback for application
   * @param {Object} prediction - Prediction result from ApplicationPredictionService
   * @returns {Object} Actionable feedback
   */
  generateFeedback(prediction) {
    console.log('[Feedback] Generating actionable feedback');
    
    const feedback = {
      // Overall assessment
      assessment: this.generateAssessment(prediction),
      
      // Skill-specific feedback
      skills: this.generateSkillFeedback(prediction),
      
      // Experience feedback
      experience: this.generateExperienceFeedback(prediction),
      
      // Education feedback
      education: this.generateEducationFeedback(prediction),
      
      // Resume optimization
      resumeOptimization: this.generateResumeOptimization(prediction),
      
      // Quick wins (easy improvements)
      quickWins: this.identifyQuickWins(prediction),
      
      // Long-term improvements
      longTermGoals: this.generateLongTermGoals(prediction),
      
      // Estimated impact
      impactEstimates: this.estimateImprovementImpact(prediction),
      
      // Priority action items
      actionItems: this.generatePriorityActions(prediction),
      
      // Timeline
      timeline: this.generateImprovementTimeline(prediction)
    };
    
    return feedback;
  }

  /**
   * Generate overall assessment
   * @param {Object} prediction - Prediction result
   * @returns {Object} Assessment
   */
  generateAssessment(prediction) {
    const score = prediction.matchScore;
    const { strengths, weaknesses } = prediction.featureBreakdown;
    
    let status, message, priority;
    
    if (score >= 80) {
      status = 'excellent';
      message = 'You\'re well-positioned for this role. Focus on crafting a compelling application.';
      priority = 'low'; // No major improvements needed
    } else if (score >= 65) {
      status = 'good';
      message = 'You have a solid foundation. A few key improvements could significantly boost your chances.';
      priority = 'medium';
    } else if (score >= 50) {
      status = 'moderate';
      message = 'Substantial gaps exist. Strategic improvements in key areas are recommended before applying.';
      priority = 'high';
    } else {
      status = 'needs-work';
      message = 'Significant development needed. Consider targeting roles that better match your current profile, or invest time in skill/experience building.';
      priority = 'critical';
    }
    
    return {
      status,
      score,
      message,
      priority,
      strengthCount: strengths.length,
      weaknessCount: weaknesses.length,
      topStrength: strengths[0]?.description || 'N/A',
      topWeakness: weaknesses[0]?.description || 'N/A'
    };
  }

  /**
   * Generate skill-specific feedback
   * @param {Object} prediction - Prediction result
   * @returns {Object} Skill feedback
   */
  generateSkillFeedback(prediction) {
    const features = prediction.features;
    const missingRequired = features._missing_required || [];
    const missingPreferred = features._missing_preferred || [];
    const matchedSkills = [
      ...(features._matched_required || []),
      ...(features._matched_preferred || [])
    ];
    
    const feedback = {
      criticalGaps: [],
      recommendedSkills: [],
      complementarySkills: [],
      learningResources: []
    };
    
    // Critical gaps (missing required skills)
    for (const skill of missingRequired) {
      feedback.criticalGaps.push({
        skill,
        importance: 'critical',
        impact: '+15-20 match score',
        action: `Learn ${skill}`,
        urgency: 'high',
        estimatedTime: this.estimateSkillLearningTime(skill)
      });
    }
    
    // Recommended skills (missing preferred + complementary)
    for (const skill of missingPreferred.slice(0, 5)) {
      feedback.recommendedSkills.push({
        skill,
        importance: 'recommended',
        impact: '+5-10 match score',
        action: `Add ${skill} to skillset`,
        urgency: 'medium',
        estimatedTime: this.estimateSkillLearningTime(skill)
      });
    }
    
    // Complementary skills (boost existing skills)
    const complementary = this.suggestComplementarySkills(matchedSkills);
    for (const skill of complementary.slice(0, 3)) {
      feedback.complementarySkills.push({
        skill,
        importance: 'complementary',
        impact: '+3-5 match score',
        action: `Complement existing skills with ${skill}`,
        urgency: 'low',
        estimatedTime: this.estimateSkillLearningTime(skill)
      });
    }
    
    // Learning resources
    feedback.learningResources = this.suggestLearningResources([
      ...missingRequired,
      ...missingPreferred.slice(0, 3)
    ]);
    
    return feedback;
  }

  /**
   * Generate experience feedback
   * @param {Object} prediction - Prediction result
   * @returns {Object} Experience feedback
   */
  generateExperienceFeedback(prediction) {
    const features = prediction.features;
    const experienceGap = features.experience_gap || 0;
    const currentYears = features.years_of_experience || 0;
    const requiredYears = features.required_years || 0;
    const seniorityMatch = features.seniority_match || 0;
    
    const feedback = {
      currentLevel: this.estimateCurrentLevel(currentYears),
      targetLevel: this.estimateTargetLevel(requiredYears),
      gap: experienceGap,
      recommendations: []
    };
    
    // Experience gap
    if (experienceGap > 0) {
      if (experienceGap <= 1) {
        feedback.recommendations.push({
          type: 'minor-gap',
          message: `You're ${experienceGap.toFixed(1)} years short of the preferred experience level.`,
          action: 'Emphasize relevant projects and achievements to compensate',
          impact: 'Can be mitigated with strong portfolio'
        });
      } else if (experienceGap <= 3) {
        feedback.recommendations.push({
          type: 'moderate-gap',
          message: `${experienceGap.toFixed(1)} year experience gap exists.`,
          action: 'Consider roles at your current level, or highlight transferable experience',
          impact: 'Moderate hurdle, but addressable'
        });
      } else {
        feedback.recommendations.push({
          type: 'significant-gap',
          message: `Significant ${experienceGap.toFixed(1)} year gap in experience.`,
          action: 'Target roles 1-2 levels below, or gain experience before applying',
          impact: 'Major obstacle to success'
        });
      }
    }
    
    // Seniority mismatch
    if (seniorityMatch < 0.7) {
      feedback.recommendations.push({
        type: 'seniority-mismatch',
        message: 'Your seniority level doesn\'t align well with the role.',
        action: 'Clarify your level in resume title and summary',
        impact: '+5-10 match score'
      });
    }
    
    // Industry experience
    if (features.industry_match < 0.5) {
      feedback.recommendations.push({
        type: 'industry-gap',
        message: 'Limited experience in this industry.',
        action: 'Highlight transferable skills and quick learning ability',
        impact: '+3-5 match score'
      });
    }
    
    // Company size experience
    if (features.company_size_match < 0.5) {
      feedback.recommendations.push({
        type: 'company-size-gap',
        message: 'Your experience is primarily with different company sizes.',
        action: 'Research and address in cover letter how your experience translates',
        impact: '+2-4 match score'
      });
    }
    
    return feedback;
  }

  /**
   * Generate education feedback
   * @param {Object} prediction - Prediction result
   * @returns {Object} Education feedback
   */
  generateEducationFeedback(prediction) {
    const features = prediction.features;
    const educationMatch = features.education_match || 0;
    const fieldMatch = features.field_match || 0;
    const gpaScore = features.gpa_score || 0;
    
    const feedback = {
      level: educationMatch >= 0.8 ? 'meets-requirements' : 'below-requirements',
      recommendations: []
    };
    
    // Education level
    if (educationMatch < 1.0) {
      if (educationMatch >= 0.8) {
        feedback.recommendations.push({
          type: 'minor-gap',
          message: 'Your education level slightly below preferred.',
          action: 'Compensate with strong work experience and certifications',
          impact: '+2-3 match score'
        });
      } else {
        feedback.recommendations.push({
          type: 'significant-gap',
          message: 'Education level below requirements.',
          action: 'Consider pursuing additional education or target roles with lower requirements',
          impact: 'Major factor - consider long-term education goals'
        });
      }
    }
    
    // Field mismatch
    if (fieldMatch < 0.7) {
      feedback.recommendations.push({
        type: 'field-mismatch',
        message: 'Your field of study doesn\'t closely match role requirements.',
        action: 'Take online courses or certifications in the target field',
        impact: '+3-5 match score',
        suggestions: this.suggestCertifications(features._missing_required || [])
      });
    }
    
    // GPA (if low)
    if (gpaScore < 0.7 && gpaScore > 0) {
      feedback.recommendations.push({
        type: 'gpa-concern',
        message: 'GPA may be below some company thresholds.',
        action: 'Emphasize work achievements and skills gained since graduation',
        impact: 'Minor factor for experienced candidates'
      });
    }
    
    return feedback;
  }

  /**
   * Generate resume optimization suggestions
   * @param {Object} prediction - Prediction result
   * @returns {Object} Resume optimization
   */
  generateResumeOptimization(prediction) {
    const features = prediction.features;
    
    const optimization = {
      keywords: [],
      structure: [],
      content: [],
      formatting: []
    };
    
    // Keyword optimization
    if (features.keyword_density < 0.6) {
      optimization.keywords.push({
        issue: 'Low keyword density',
        action: 'Add more job-specific keywords from the posting',
        impact: '+5-10 match score',
        priority: 'high'
      });
    }
    
    if (features.description_similarity < 0.4) {
      optimization.keywords.push({
        issue: 'Weak alignment between resume and job description',
        action: 'Rephrase experience bullets to match job requirements language',
        impact: '+8-12 match score',
        priority: 'critical'
      });
    }
    
    // Structure optimization
    if (features.title_similarity < 0.5) {
      optimization.structure.push({
        issue: 'Resume title doesn\'t match target role',
        action: 'Update resume title to match or closely align with job title',
        impact: '+3-5 match score',
        priority: 'high'
      });
    }
    
    // Content optimization
    if (features.resume_relevance_score < 0.5) {
      optimization.content.push({
        issue: 'Much of resume content not relevant to role',
        action: 'Tailor resume to emphasize relevant experience and hide/minimize irrelevant items',
        impact: '+10-15 match score',
        priority: 'critical'
      });
    }
    
    if (features.buzzword_match < 0.6) {
      optimization.content.push({
        issue: 'Missing industry buzzwords',
        action: 'Incorporate relevant industry terminology naturally',
        impact: '+4-6 match score',
        priority: 'medium'
      });
    }
    
    return optimization;
  }

  /**
   * Identify quick wins (easy improvements with high impact)
   * @param {Object} prediction - Prediction result
   * @returns {Array} Quick win recommendations
   */
  identifyQuickWins(prediction) {
    const features = prediction.features;
    const quickWins = [];
    
    // Application timing
    if (features.application_speed_score < 0.8 && features.days_since_posted <= 7) {
      quickWins.push({
        action: 'Apply immediately (job posted recently)',
        impact: '+3-5 match score',
        effort: 'immediate',
        category: 'timing'
      });
    }
    
    // Resume title
    if (features.title_similarity < 0.5) {
      quickWins.push({
        action: 'Update resume title to match job title',
        impact: '+3-5 match score',
        effort: '5 minutes',
        category: 'resume'
      });
    }
    
    // Keywords
    if (features.keyword_density < 0.5) {
      quickWins.push({
        action: 'Add 5-10 keywords from job description',
        impact: '+5-8 match score',
        effort: '15 minutes',
        category: 'resume'
      });
    }
    
    // Cover letter customization
    quickWins.push({
      action: 'Write custom cover letter addressing key requirements',
      impact: '+8-12 match score',
      effort: '30-45 minutes',
      category: 'application'
    });
    
    // Location (if remote)
    if (features.is_remote === 1 && features.location_match < 0.8) {
      quickWins.push({
        action: 'Emphasize remote work experience in resume',
        impact: '+5-7 match score',
        effort: '10 minutes',
        category: 'resume'
      });
    }
    
    // Sort by impact/effort ratio
    quickWins.sort((a, b) => {
      const aImpact = parseInt(a.impact) || 0;
      const bImpact = parseInt(b.impact) || 0;
      return bImpact - aImpact;
    });
    
    return quickWins.slice(0, 5); // Top 5 quick wins
  }

  /**
   * Generate long-term improvement goals
   * @param {Object} prediction - Prediction result
   * @returns {Array} Long-term goals
   */
  generateLongTermGoals(prediction) {
    const features = prediction.features;
    const goals = [];
    
    // Skill development
    const missingRequired = features._missing_required || [];
    if (missingRequired.length > 0) {
      goals.push({
        goal: `Master critical skills: ${missingRequired.slice(0, 3).join(', ')}`,
        timeline: '3-6 months',
        impact: '+15-25 match score',
        steps: [
          'Take online courses (Coursera, Udemy, etc.)',
          'Build 2-3 projects using these skills',
          'Get certification if available',
          'Add to resume with project examples'
        ],
        priority: 'critical'
      });
    }
    
    // Experience building
    if (features.experience_gap > 2) {
      goals.push({
        goal: 'Gain relevant work experience',
        timeline: '1-2 years',
        impact: '+20-30 match score',
        steps: [
          'Target intermediate-level roles first',
          'Take on stretch projects in current role',
          'Contribute to open source projects',
          'Seek mentorship from senior professionals'
        ],
        priority: 'high'
      });
    }
    
    // Education advancement
    if (features.education_match < 0.8) {
      goals.push({
        goal: 'Pursue additional education or certifications',
        timeline: '6-24 months',
        impact: '+10-15 match score',
        steps: [
          'Research relevant certifications or degree programs',
          'Start with online courses to test interest',
          'Consider part-time or evening programs',
          'Seek employer tuition assistance'
        ],
        priority: 'medium'
      });
    }
    
    // Industry experience
    if (features.industry_match < 0.5) {
      goals.push({
        goal: 'Build industry-specific experience',
        timeline: '6-12 months',
        impact: '+8-12 match score',
        steps: [
          'Take on projects in target industry',
          'Network with industry professionals',
          'Attend industry conferences/meetups',
          'Read industry publications and blogs'
        ],
        priority: 'medium'
      });
    }
    
    return goals;
  }

  /**
   * Estimate impact of potential improvements
   * @param {Object} prediction - Prediction result
   * @returns {Object} Impact estimates
   */
  estimateImprovementImpact(prediction) {
    const features = prediction.features;
    const currentScore = prediction.matchScore;
    
    const improvements = [];
    
    // Skill improvements
    const skillGap = 1.0 - (features.required_skills_coverage || 0);
    if (skillGap > 0) {
      const impact = skillGap * 20; // Up to 20 points
      improvements.push({
        category: 'Skills',
        description: 'Add all missing required skills',
        currentScore: features.required_skills_coverage * 100,
        potentialScore: 100,
        impact: Math.round(impact),
        newTotalScore: Math.min(100, currentScore + impact)
      });
    }
    
    // Experience improvements
    if (features.experience_gap > 0) {
      const impact = Math.min(features.experience_gap * 5, 15); // Up to 15 points
      improvements.push({
        category: 'Experience',
        description: `Gain ${features.experience_gap.toFixed(1)} more years of experience`,
        currentScore: features.experience_match_score * 100,
        potentialScore: 100,
        impact: Math.round(impact),
        newTotalScore: Math.min(100, currentScore + impact)
      });
    }
    
    // Resume optimization
    if (features.description_similarity < 0.7) {
      const impact = (0.7 - features.description_similarity) * 15; // Up to ~10 points
      improvements.push({
        category: 'Resume',
        description: 'Optimize resume for better alignment',
        currentScore: features.description_similarity * 100,
        potentialScore: 70,
        impact: Math.round(impact),
        newTotalScore: Math.min(100, currentScore + impact)
      });
    }
    
    // Combined impact (all improvements together)
    const totalPotentialImpact = improvements.reduce((sum, imp) => sum + imp.impact, 0);
    const maxAchievableScore = Math.min(100, currentScore + totalPotentialImpact);
    
    return {
      current: currentScore,
      improvements,
      totalPotentialImpact: Math.round(totalPotentialImpact),
      maxAchievableScore: Math.round(maxAchievableScore),
      realisti: Math.round(currentScore + (totalPotentialImpact * 0.7)) // 70% of potential
    };
  }

  /**
   * Generate priority action items
   * @param {Object} prediction - Prediction result
   * @returns {Array} Prioritized actions
   */
  generatePriorityActions(prediction) {
    const allActions = [
      ...this.identifyQuickWins(prediction).map(qw => ({
        ...qw,
        type: 'quick-win',
        priority: 1
      })),
      ...this.generateSkillFeedback(prediction).criticalGaps.map(gap => ({
        action: gap.action,
        impact: gap.impact,
        effort: gap.estimatedTime,
        category: 'skill',
        type: 'critical',
        priority: 2
      })),
      ...this.generateResumeOptimization(prediction).keywords.filter(k => k.priority === 'critical').map(opt => ({
        action: opt.action,
        impact: opt.impact,
        effort: '15-30 minutes',
        category: 'resume',
        type: 'optimization',
        priority: 1
      }))
    ];
    
    // Sort by priority (lower number = higher priority), then by impact
    allActions.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const aImpact = parseInt(a.impact) || 0;
      const bImpact = parseInt(b.impact) || 0;
      return bImpact - aImpact;
    });
    
    return allActions.slice(0, 10); // Top 10 actions
  }

  /**
   * Generate improvement timeline
   * @param {Object} prediction - Prediction result
   * @returns {Object} Timeline
   */
  generateImprovementTimeline(prediction) {
    return {
      immediate: this.identifyQuickWins(prediction),
      shortTerm: {
        timeframe: '1-4 weeks',
        actions: [
          'Complete online courses for 1-2 critical skills',
          'Update resume with optimized keywords',
          'Build small project demonstrating key skill',
          'Get resume reviewed by peer or professional'
        ]
      },
      mediumTerm: {
        timeframe: '1-3 months',
        actions: [
          'Complete 2-3 substantial projects',
          'Earn relevant certification',
          'Gain hands-on experience through freelancing or contributions',
          'Network in target industry'
        ]
      },
      longTerm: {
        timeframe: '3-12 months',
        actions: this.generateLongTermGoals(prediction).map(goal => goal.goal)
      }
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Estimate skill learning time
   */
  estimateSkillLearningTime(skill) {
    const skillLower = skill.toLowerCase();
    
    // Framework/library (faster)
    if (['react', 'vue', 'angular', 'express', 'flask'].some(s => skillLower.includes(s))) {
      return '2-4 weeks';
    }
    
    // Language (medium)
    if (['javascript', 'python', 'java', 'typescript'].some(s => skillLower.includes(s))) {
      return '1-3 months';
    }
    
    // Platform/cloud (medium)
    if (['aws', 'azure', 'gcp', 'docker', 'kubernetes'].some(s => skillLower.includes(s))) {
      return '1-2 months';
    }
    
    // Default
    return '2-6 weeks';
  }

  /**
   * Suggest complementary skills
   */
  suggestComplementarySkills(matchedSkills) {
    const suggestions = [];
    
    for (const skill of matchedSkills) {
      const skillLower = skill.toLowerCase();
      for (const [key, complements] of Object.entries(this.skillSuggestions)) {
        if (skillLower.includes(key)) {
          suggestions.push(...complements);
        }
      }
    }
    
    // Remove duplicates and already matched
    return [...new Set(suggestions)]
      .filter(s => !matchedSkills.some(ms => ms.toLowerCase().includes(s.toLowerCase())));
  }

  /**
   * Suggest learning resources
   */
  suggestLearningResources(skills) {
    const resources = [];
    
    for (const skill of skills.slice(0, 3)) {
      resources.push({
        skill,
        resources: [
          { name: 'Coursera', type: 'course', url: `https://coursera.org/search?query=${skill}` },
          { name: 'Udemy', type: 'course', url: `https://udemy.com/courses/search/?q=${skill}` },
          { name: 'YouTube', type: 'tutorial', url: `https://youtube.com/results?search_query=${skill}+tutorial` },
          { name: 'Official Docs', type: 'documentation', url: `Search for "${skill} documentation"` }
        ]
      });
    }
    
    return resources;
  }

  /**
   * Suggest certifications
   */
  suggestCertifications(missingSkills) {
    const certs = [];
    
    if (missingSkills.some(s => s.toLowerCase().includes('aws'))) {
      certs.push('AWS Certified Solutions Architect');
    }
    
    if (missingSkills.some(s => ['python', 'data', 'ml'].some(t => s.toLowerCase().includes(t)))) {
      certs.push('Google Data Analytics Certificate');
    }
    
    if (missingSkills.some(s => s.toLowerCase().includes('scrum'))) {
      certs.push('Certified Scrum Master (CSM)');
    }
    
    return certs;
  }

  /**
   * Estimate current level from years
   */
  estimateCurrentLevel(years) {
    if (years < 1) return 'entry';
    if (years < 3) return 'junior';
    if (years < 6) return 'mid';
    if (years < 10) return 'senior';
    return 'lead';
  }

  /**
   * Estimate target level from required years
   */
  estimateTargetLevel(requiredYears) {
    if (!requiredYears) return 'mid';
    if (requiredYears < 2) return 'junior';
    if (requiredYears < 5) return 'mid';
    if (requiredYears < 8) return 'senior';
    return 'lead';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeedbackGeneratorService;
}
