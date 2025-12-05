/**
 * Resume Scoring Service
 * Comprehensive scoring algorithm for resume quality and job match
 */

class ResumeScoring {
  /**
   * Score resume against job requirements
   * @param {object} resume - Resume data
   * @param {object} jobAnalysis - Job analysis results
   * @returns {object} Detailed scoring breakdown
   */
  scoreResume(resume, jobAnalysis) {
    const scores = {
      overall: 0,
      categories: {
        keywordMatch: this.scoreKeywordMatch(resume, jobAnalysis),
        experienceRelevance: this.scoreExperienceRelevance(resume, jobAnalysis),
        skillsMatch: this.scoreSkillsMatch(resume, jobAnalysis),
        atsCompatibility: this.scoreATSCompatibility(resume),
        quantification: this.scoreQuantification(resume),
        formatting: this.scoreFormatting(resume),
        completeness: this.scoreCompleteness(resume),
      },
      strengths: [],
      weaknesses: [],
      recommendations: [],
    };

    // Calculate overall score (weighted average)
    const weights = {
      keywordMatch: 0.25,
      experienceRelevance: 0.20,
      skillsMatch: 0.20,
      atsCompatibility: 0.15,
      quantification: 0.10,
      formatting: 0.05,
      completeness: 0.05,
    };

    scores.overall = Object.entries(weights).reduce((sum, [category, weight]) => {
      return sum + (scores.categories[category].score * weight);
    }, 0);

    scores.overall = Math.round(scores.overall);

    // Generate insights
    this.generateInsights(scores, resume, jobAnalysis);

    return scores;
  }

  /**
   * Score keyword match
   */
  scoreKeywordMatch(resume, jobAnalysis) {
    const resumeText = JSON.stringify(resume).toLowerCase();
    const topKeywords = jobAnalysis.keywords?.top || [];
    const requiredSkills = jobAnalysis.skills?.required || [];

    const matchedKeywords = topKeywords.filter(k => 
      resumeText.includes(k.word?.toLowerCase())
    );

    const matchedSkills = requiredSkills.filter(skill =>
      resumeText.includes(skill.toLowerCase())
    );

    const keywordScore = topKeywords.length > 0 
      ? (matchedKeywords.length / topKeywords.length) * 100 
      : 50;

    const missingKeywords = topKeywords
      .filter(k => !resumeText.includes(k.word?.toLowerCase()))
      .map(k => k.word)
      .slice(0, 5);

    return {
      score: Math.round(keywordScore),
      matched: matchedKeywords.length,
      total: topKeywords.length,
      missingKeywords,
      details: `${matchedKeywords.length} of ${topKeywords.length} top keywords present`,
    };
  }

  /**
   * Score experience relevance
   */
  scoreExperienceRelevance(resume, jobAnalysis) {
    const experience = resume.experience || [];
    const requiredYears = jobAnalysis.seniorityLevel?.years || 0;

    // Calculate total years of experience
    const totalYears = this.calculateTotalYears(experience);

    // Score based on years match
    let yearsScore = 100;
    if (requiredYears > 0) {
      if (totalYears < requiredYears) {
        yearsScore = (totalYears / requiredYears) * 100;
      } else if (totalYears > requiredYears * 2) {
        // Slight penalty for being overqualified
        yearsScore = 90;
      }
    }

    // Score based on role similarity
    const roleSimilarity = this.calculateRoleSimilarity(
      experience,
      jobAnalysis.metadata?.jobTitle
    );

    // Score based on industry match
    const industryMatch = this.calculateIndustryMatch(
      experience,
      jobAnalysis.industry?.primary
    );

    const avgScore = (yearsScore + roleSimilarity + industryMatch) / 3;

    return {
      score: Math.round(avgScore),
      totalYears,
      requiredYears,
      roleSimilarity: Math.round(roleSimilarity),
      industryMatch: Math.round(industryMatch),
      details: `${totalYears} years experience vs ${requiredYears} required`,
    };
  }

  /**
   * Score skills match
   */
  scoreSkillsMatch(resume, jobAnalysis) {
    const resumeSkills = (resume.skills || []).map(s => s.toLowerCase());
    const requiredSkills = (jobAnalysis.skills?.required || []).map(s => s.toLowerCase());
    const preferredSkills = (jobAnalysis.skills?.preferred || []).map(s => s.toLowerCase());

    const matchedRequired = requiredSkills.filter(skill =>
      resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
    );

    const matchedPreferred = preferredSkills.filter(skill =>
      resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
    );

    const requiredScore = requiredSkills.length > 0
      ? (matchedRequired.length / requiredSkills.length) * 100
      : 100;

    const preferredScore = preferredSkills.length > 0
      ? (matchedPreferred.length / preferredSkills.length) * 100
      : 100;

    const overallScore = (requiredScore * 0.8) + (preferredScore * 0.2);

    const missingSkills = requiredSkills
      .filter(skill => !matchedRequired.includes(skill))
      .slice(0, 5);

    return {
      score: Math.round(overallScore),
      matchedRequired: matchedRequired.length,
      totalRequired: requiredSkills.length,
      matchedPreferred: matchedPreferred.length,
      totalPreferred: preferredSkills.length,
      missingSkills,
      details: `${matchedRequired.length}/${requiredSkills.length} required skills, ${matchedPreferred.length}/${preferredSkills.length} preferred`,
    };
  }

  /**
   * Score ATS compatibility
   */
  scoreATSCompatibility(resume) {
    let score = 100;
    const issues = [];

    // Check for standard section names
    const standardSections = ['experience', 'education', 'skills'];
    const hasSections = standardSections.filter(s => resume[s]);
    if (hasSections.length < standardSections.length) {
      score -= 20;
      issues.push('Missing standard sections');
    }

    // Check for complex formatting indicators
    if (resume.formatting?.columns > 1) {
      score -= 15;
      issues.push('Multi-column layout may confuse ATS');
    }

    if (resume.formatting?.tables) {
      score -= 10;
      issues.push('Tables can cause parsing issues');
    }

    if (resume.formatting?.graphics) {
      score -= 10;
      issues.push('Graphics not readable by ATS');
    }

    // Check for contact information
    if (!resume.contact || !resume.contact.email) {
      score -= 15;
      issues.push('Missing contact information');
    }

    // Check for dates format
    if (resume.experience) {
      const hasStandardDates = resume.experience.every(exp =>
        exp.startDate && exp.endDate
      );
      if (!hasStandardDates) {
        score -= 10;
        issues.push('Inconsistent date formatting');
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      details: issues.length === 0 
        ? 'Good ATS compatibility' 
        : `${issues.length} compatibility issues found`,
    };
  }

  /**
   * Score quantification of achievements
   */
  scoreQuantification(resume) {
    let totalAchievements = 0;
    let quantifiedAchievements = 0;

    // Check experience bullets
    if (resume.experience) {
      resume.experience.forEach(exp => {
        if (exp.responsibilities) {
          exp.responsibilities.forEach(resp => {
            totalAchievements++;
            if (this.hasQuantification(resp)) {
              quantifiedAchievements++;
            }
          });
        }
      });
    }

    // Check projects
    if (resume.projects) {
      resume.projects.forEach(project => {
        totalAchievements++;
        if (project.description && this.hasQuantification(project.description)) {
          quantifiedAchievements++;
        }
      });
    }

    const score = totalAchievements > 0
      ? (quantifiedAchievements / totalAchievements) * 100
      : 50;

    const unquantified = totalAchievements - quantifiedAchievements;

    return {
      score: Math.round(score),
      quantified: quantifiedAchievements,
      total: totalAchievements,
      percentage: totalAchievements > 0 
        ? Math.round((quantifiedAchievements / totalAchievements) * 100)
        : 0,
      details: `${quantifiedAchievements} of ${totalAchievements} achievements quantified`,
      unquantified,
    };
  }

  /**
   * Score formatting quality
   */
  scoreFormatting(resume) {
    let score = 100;
    const issues = [];

    // Check consistency
    if (resume.experience) {
      const hasConsistentFormat = this.checkFormatConsistency(resume.experience);
      if (!hasConsistentFormat) {
        score -= 20;
        issues.push('Inconsistent formatting across sections');
      }
    }

    // Check length
    const estimatedLength = this.estimateResumeLength(resume);
    if (estimatedLength > 2.5) {
      score -= 15;
      issues.push('Resume likely exceeds 2 pages');
    }

    // Check bullet points
    if (resume.experience) {
      const avgBullets = resume.experience.reduce((sum, exp) => 
        sum + (exp.responsibilities?.length || 0), 0
      ) / resume.experience.length;

      if (avgBullets > 7) {
        score -= 10;
        issues.push('Too many bullets per position (>7)');
      } else if (avgBullets < 3) {
        score -= 10;
        issues.push('Too few bullets per position (<3)');
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      estimatedLength,
      details: issues.length === 0 
        ? 'Good formatting' 
        : `${issues.length} formatting issues`,
    };
  }

  /**
   * Score completeness
   */
  scoreCompleteness(resume) {
    const requiredSections = [
      'contact',
      'summary',
      'experience',
      'education',
      'skills',
    ];

    const presentSections = requiredSections.filter(section => resume[section]);
    const score = (presentSections.length / requiredSections.length) * 100;

    const missingSections = requiredSections.filter(section => !resume[section]);

    return {
      score: Math.round(score),
      present: presentSections.length,
      total: requiredSections.length,
      missingSections,
      details: `${presentSections.length} of ${requiredSections.length} essential sections present`,
    };
  }

  /**
   * Generate insights based on scores
   */
  generateInsights(scores, resume, jobAnalysis) {
    // Identify strengths
    Object.entries(scores.categories).forEach(([category, result]) => {
      if (result.score >= 85) {
        scores.strengths.push(this.getStrengthMessage(category, result));
      } else if (result.score < 60) {
        scores.weaknesses.push(this.getWeaknessMessage(category, result));
      }
    });

    // Generate recommendations
    scores.recommendations = this.generateRecommendations(scores, resume, jobAnalysis);

    // Sort recommendations by priority
    scores.recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(scores, resume, jobAnalysis) {
    const recommendations = [];

    // Keyword recommendations
    if (scores.categories.keywordMatch.score < 75) {
      const missing = scores.categories.keywordMatch.missingKeywords.slice(0, 3);
      recommendations.push({
        priority: 'high',
        category: 'keywords',
        issue: `Missing key terms: ${missing.join(', ')}`,
        fix: `Add these keywords to your skills or experience sections`,
        impact: 'Improves ATS ranking and recruiter matching',
      });
    }

    // Skills recommendations
    if (scores.categories.skillsMatch.score < 75) {
      const missing = scores.categories.skillsMatch.missingSkills.slice(0, 3);
      if (missing.length > 0) {
        recommendations.push({
          priority: 'high',
          category: 'skills',
          issue: `Missing required skills: ${missing.join(', ')}`,
          fix: `If you have experience with these, add them to skills section`,
          impact: 'Significantly increases match score',
        });
      }
    }

    // Quantification recommendations
    if (scores.categories.quantification.score < 70) {
      recommendations.push({
        priority: 'high',
        category: 'quantification',
        issue: `Only ${scores.categories.quantification.percentage}% of achievements are quantified`,
        fix: `Add metrics to ${scores.categories.quantification.unquantified} more achievements`,
        impact: 'Shows measurable impact and results',
        examples: [
          '"Led team" → "Led team of 5 engineers"',
          '"Improved performance" → "Improved performance by 40%"',
        ],
      });
    }

    // ATS recommendations
    if (scores.categories.atsCompatibility.score < 75) {
      recommendations.push({
        priority: 'medium',
        category: 'ats',
        issue: 'ATS compatibility issues detected',
        fix: scores.categories.atsCompatibility.issues.join('; '),
        impact: 'Ensures resume is properly parsed by applicant tracking systems',
      });
    }

    // Formatting recommendations
    if (scores.categories.formatting.score < 75) {
      recommendations.push({
        priority: 'low',
        category: 'formatting',
        issue: 'Formatting improvements needed',
        fix: scores.categories.formatting.issues.join('; '),
        impact: 'Improves readability and professional appearance',
      });
    }

    return recommendations;
  }

  // Helper methods

  hasQuantification(text) {
    if (!text) return false;
    const patterns = [
      /\d+%/,
      /\d+\+/,
      /\$\d+/,
      /\d+ (users|customers|clients|employees|team|members|projects)/i,
      /(increased|decreased|improved|reduced|grew|scaled)/i,
    ];
    return patterns.some(p => p.test(text));
  }

  calculateTotalYears(experience) {
    if (!experience || experience.length === 0) return 0;
    
    // Simple calculation - count unique months
    let totalMonths = 0;
    experience.forEach(exp => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    });

    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
  }

  calculateRoleSimilarity(experience, jobTitle) {
    if (!experience || !jobTitle) return 50;
    
    const jobTitleLower = jobTitle.toLowerCase();
    const hasTitle = experience.some(exp =>
      exp.title?.toLowerCase().includes(jobTitleLower) ||
      jobTitleLower.includes(exp.title?.toLowerCase())
    );

    return hasTitle ? 90 : 60;
  }

  calculateIndustryMatch(experience, industry) {
    if (!experience || !industry) return 50;
    
    const hasIndustry = experience.some(exp =>
      exp.industry?.toLowerCase() === industry.toLowerCase()
    );

    return hasIndustry ? 90 : 60;
  }

  checkFormatConsistency(experience) {
    if (!experience || experience.length < 2) return true;
    
    // Check if all have same properties
    const firstKeys = new Set(Object.keys(experience[0]));
    return experience.every(exp => {
      const keys = new Set(Object.keys(exp));
      return keys.size === firstKeys.size;
    });
  }

  estimateResumeLength(resume) {
    let lines = 0;
    
    if (resume.summary) lines += 3;
    if (resume.experience) {
      resume.experience.forEach(exp => {
        lines += 2; // Title and company
        lines += (exp.responsibilities?.length || 0);
      });
    }
    if (resume.education) lines += resume.education.length * 2;
    if (resume.skills) lines += Math.ceil(resume.skills.length / 4);
    
    return lines / 45; // Approx 45 lines per page
  }

  getStrengthMessage(category, result) {
    const messages = {
      keywordMatch: `Strong keyword match (${result.score}%)`,
      experienceRelevance: `Highly relevant experience (${result.score}%)`,
      skillsMatch: `Excellent skills alignment (${result.score}%)`,
      atsCompatibility: `Resume is ATS-friendly (${result.score}%)`,
      quantification: `Good use of metrics (${result.score}%)`,
      formatting: `Professional formatting (${result.score}%)`,
      completeness: `Complete resume structure (${result.score}%)`,
    };
    return messages[category] || `Strong ${category}`;
  }

  getWeaknessMessage(category, result) {
    const messages = {
      keywordMatch: `Low keyword match (${result.score}%) - missing key terms`,
      experienceRelevance: `Experience could be more relevant (${result.score}%)`,
      skillsMatch: `Missing important skills (${result.score}%)`,
      atsCompatibility: `ATS compatibility issues (${result.score}%)`,
      quantification: `Needs more quantified achievements (${result.score}%)`,
      formatting: `Formatting needs improvement (${result.score}%)`,
      completeness: `Missing essential sections (${result.score}%)`,
    };
    return messages[category] || `Weak ${category}`;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResumeScoring;
}
