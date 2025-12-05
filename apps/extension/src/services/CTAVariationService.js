/**
 * CTAVariationService
 * 
 * Generate contextual call-to-action variations for cover letters.
 * 
 * Features:
 * - Multiple CTA styles (eager, confident, professional, enthusiastic)
 * - Context-aware generation (seniority, company type, culture)
 * - A/B testing variations
 * - Tone matching
 * - Industry-specific language
 * 
 * CTA Styles:
 * - Eager: Entry-level, enthusiastic, learning-focused
 * - Confident: Senior, results-focused, value proposition
 * - Professional: Mid-level, balanced, competence-focused
 * - Enthusiastic: Startup, passionate, mission-driven
 * - Collaborative: Team-focused, partnership-oriented
 */

class CTAVariationService {
  constructor() {
    this.ctaTemplates = this.initializeCTATemplates();
  }

  /**
   * Initialize CTA templates
   * @returns {Object} Template library
   */
  initializeCTATemplates() {
    return {
      eager: {
        learning: [
          "I would love the opportunity to learn more about this role and contribute to {company}'s mission.",
          "I'm eager to discuss how I can grow with {company} while delivering value from day one.",
          "I would be thrilled to explore how my skills align with {company}'s needs and learn from your team."
        ],
        contribution: [
          "I'm excited about the possibility of contributing to {company}'s success.",
          "I can't wait to bring my enthusiasm and skills to {company}.",
          "I would love the chance to make an impact at {company}."
        ],
        opportunity: [
          "I would be honored to have the opportunity to work with {company}.",
          "This opportunity to join {company} is exactly what I've been looking for.",
          "I'm genuinely excited about the prospect of joining your team."
        ]
      },
      
      confident: {
        value: [
          "I'm confident that my experience in {skill} will drive immediate results for {company}.",
          "I bring {years} years of proven success in {industry} that will directly benefit {company}.",
          "My track record of {achievement} positions me to make significant contributions to {company}."
        ],
        results: [
          "I'm prepared to deliver {metric} improvements, similar to my past successes.",
          "I'm ready to leverage my expertise to help {company} achieve {goal}.",
          "I can bring immediate value through my experience in {domain}."
        ],
        leadership: [
          "I'm confident in my ability to lead {company}'s {initiative} to success.",
          "My leadership experience makes me well-suited to drive {company}'s vision forward.",
          "I'm prepared to take ownership of {responsibility} and deliver exceptional results."
        ]
      },

      professional: {
        discussion: [
          "I would welcome the opportunity to discuss how my qualifications align with {company}'s needs.",
          "I look forward to speaking with you about this {position} position.",
          "I would appreciate the chance to explore how I can contribute to {company}."
        ],
        interview: [
          "I'm available at your convenience to discuss my background and how it fits with {company}.",
          "I would be pleased to elaborate on my experience in an interview.",
          "I look forward to the opportunity to discuss this role in more detail."
        ],
        nextSteps: [
          "Thank you for considering my application. I look forward to the next steps.",
          "I'm eager to learn more about this opportunity and discuss how I can add value.",
          "I welcome the chance to further discuss my qualifications with your team."
        ]
      },

      enthusiastic: {
        mission: [
          "I'm genuinely passionate about {company}'s mission to {mission} and would love to contribute!",
          "Your vision for {goal} aligns perfectly with what drives me, and I'm excited to be part of it.",
          "I'm thrilled about the possibility of helping {company} {impact}!"
        ],
        innovation: [
          "I'm energized by the opportunity to drive innovation at {company}.",
          "I can't wait to bring fresh ideas and creativity to {company}'s {project}.",
          "I'm excited about pushing boundaries and creating impact at {company}."
        ],
        growth: [
          "I'm excited to grow alongside {company} during this pivotal phase.",
          "I would love to be part of {company}'s journey to {goal}!",
          "I'm thrilled about contributing to {company}'s ambitious growth plans."
        ]
      },

      collaborative: {
        team: [
          "I look forward to collaborating with your talented team to achieve {goal}.",
          "I'm excited about the opportunity to work alongside {company}'s experts in {field}.",
          "I would love to contribute my skills while learning from {company}'s exceptional team."
        ],
        partnership: [
          "I see this as an opportunity to build a mutually beneficial partnership with {company}.",
          "I'm eager to work together to drive {company}'s {initiative} forward.",
          "I look forward to partnering with {company} to deliver exceptional results."
        ],
        contribution: [
          "I'm ready to roll up my sleeves and contribute to {company}'s success.",
          "I would welcome the chance to be part of {company}'s collaborative culture.",
          "I'm excited about contributing my expertise to {company}'s team efforts."
        ]
      }
    };
  }

  /**
   * Generate CTA variations
   * @param {Object} context - Context for CTA generation
   * @returns {Object} CTA variations
   */
  generateCTAVariations(context) {
    const {
      companyName,
      companyResearch,
      jobAnalysis,
      resume,
      count = 5
    } = context;

    console.log(`[CTAVariation] Generating ${count} CTAs for ${companyName}`);

    // Determine optimal CTA styles
    const styles = this.selectCTAStyles(companyResearch, jobAnalysis, resume);

    // Generate variations
    const variations = [];
    for (let i = 0; i < count; i++) {
      const style = styles[i % styles.length];
      const cta = this.generateCTA(style, context);
      variations.push(cta);
    }

    // Score and rank variations
    const scored = variations.map(cta => ({
      ...cta,
      score: this.scoreCTA(cta, context)
    }));

    scored.sort((a, b) => b.score - a.score);

    return {
      count: scored.length,
      variations: scored,
      recommended: scored[0],
      styles: styles,
      context: {
        seniority: jobAnalysis.seniorityLevel,
        culture: companyResearch.culture?.primary,
        tone: companyResearch.culture?.tone
      }
    };
  }

  /**
   * Select optimal CTA styles
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @param {Object} resume - Resume data
   * @returns {Array} CTA styles
   */
  selectCTAStyles(companyResearch, jobAnalysis, resume) {
    const styles = [];

    // Seniority-based selection
    const seniority = jobAnalysis.seniorityLevel || 'mid';
    
    if (seniority === 'junior' || seniority === 'entry') {
      styles.push('eager', 'professional', 'enthusiastic');
    } else if (seniority === 'senior' || seniority === 'director' || seniority === 'executive') {
      styles.push('confident', 'professional', 'collaborative');
    } else {
      styles.push('professional', 'confident', 'collaborative');
    }

    // Culture-based selection
    const culture = companyResearch.culture?.primary;
    
    if (culture === 'innovative' || culture === 'fastPaced') {
      if (!styles.includes('enthusiastic')) styles.push('enthusiastic');
    }
    
    if (culture === 'collaborative') {
      if (!styles.includes('collaborative')) styles.push('collaborative');
    }

    // Company type-based selection
    const companyType = companyResearch.culture?.companyType;
    
    if (companyType === 'startup') {
      if (!styles.includes('enthusiastic')) styles.push('enthusiastic');
    } else if (companyType === 'corporate') {
      if (!styles.includes('professional')) styles.unshift('professional');
    }

    // Ensure variety
    return [...new Set(styles)].slice(0, 5);
  }

  /**
   * Generate single CTA
   * @param {string} style - CTA style
   * @param {Object} context - Generation context
   * @returns {Object} Generated CTA
   */
  generateCTA(style, context) {
    const {
      companyName,
      companyResearch,
      jobAnalysis,
      resume
    } = context;

    // Select subcategory within style
    const subcategories = Object.keys(this.ctaTemplates[style] || {});
    const subcategory = this.selectSubcategory(style, subcategories, context);

    // Get templates for this style/subcategory
    const templates = this.ctaTemplates[style][subcategory] || [];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Fill template with context
    const text = this.fillTemplate(template, context);

    // Add supporting sentence if appropriate
    const supporting = this.generateSupportingSentence(style, context);

    return {
      style: style,
      subcategory: subcategory,
      text: text,
      supporting: supporting,
      full: supporting ? `${supporting} ${text}` : text,
      tone: this.determineCTATone(style),
      length: text.split(' ').length
    };
  }

  /**
   * Select subcategory for CTA
   * @param {string} style - CTA style
   * @param {Array} subcategories - Available subcategories
   * @param {Object} context - Context
   * @returns {string} Subcategory
   */
  selectSubcategory(style, subcategories, context) {
    if (subcategories.length === 0) return 'default';

    // Context-based selection
    const { companyResearch, jobAnalysis } = context;

    if (style === 'eager') {
      // Entry-level focus on learning, others on contribution
      return jobAnalysis.seniorityLevel === 'entry' || jobAnalysis.seniorityLevel === 'junior'
        ? 'learning'
        : 'contribution';
    }

    if (style === 'confident') {
      // Senior roles focus on leadership, others on value/results
      if (jobAnalysis.seniorityLevel === 'director' || jobAnalysis.seniorityLevel === 'executive') {
        return 'leadership';
      }
      return Math.random() > 0.5 ? 'value' : 'results';
    }

    if (style === 'enthusiastic') {
      // Startup/mission-driven companies
      if (companyResearch.about?.mission) {
        return 'mission';
      }
      return companyResearch.culture?.primary === 'innovative' ? 'innovation' : 'growth';
    }

    // Default: random selection
    return subcategories[Math.floor(Math.random() * subcategories.length)];
  }

  /**
   * Fill template with context
   * @param {string} template - Template string
   * @param {Object} context - Context data
   * @returns {string} Filled template
   */
  fillTemplate(template, context) {
    const {
      companyName,
      companyResearch,
      jobAnalysis,
      resume
    } = context;

    let filled = template;

    // Company name
    filled = filled.replace(/{company}/g, companyName);

    // Position
    filled = filled.replace(/{position}/g, jobAnalysis.jobTitle || 'position');

    // Mission
    if (companyResearch.about?.mission) {
      const mission = companyResearch.about.mission.split('.')[0].toLowerCase();
      filled = filled.replace(/{mission}/g, mission);
    }

    // Goal (from news or values)
    const goal = this.extractGoal(companyResearch);
    filled = filled.replace(/{goal}/g, goal);

    // Impact (from mission or news)
    const impact = this.extractImpact(companyResearch);
    filled = filled.replace(/{impact}/g, impact);

    // Skill (from job requirements)
    const skill = jobAnalysis.skills?.required?.[0]?.name || 'my skills';
    filled = filled.replace(/{skill}/g, skill);

    // Industry
    const industry = jobAnalysis.industry?.primary || 'the industry';
    filled = filled.replace(/{industry}/g, industry);

    // Years of experience
    const years = this.calculateYearsExperience(resume);
    filled = filled.replace(/{years}/g, years);

    // Achievement (from resume)
    const achievement = this.extractTopAchievement(resume);
    filled = filled.replace(/{achievement}/g, achievement);

    // Metric (from resume)
    const metric = this.extractMetric(resume);
    filled = filled.replace(/{metric}/g, metric);

    // Domain (from resume)
    const domain = this.extractDomain(resume);
    filled = filled.replace(/{domain}/g, domain);

    // Initiative (from news or company)
    const initiative = this.extractInitiative(companyResearch);
    filled = filled.replace(/{initiative}/g, initiative);

    // Project (from news)
    const project = companyResearch.news?.mostRecent?.category || 'projects';
    filled = filled.replace(/{project}/g, project);

    // Field (from job)
    const field = this.extractField(jobAnalysis);
    filled = filled.replace(/{field}/g, field);

    // Responsibility (from job)
    const responsibility = this.extractResponsibility(jobAnalysis);
    filled = filled.replace(/{responsibility}/g, responsibility);

    return filled;
  }

  /**
   * Generate supporting sentence
   * @param {string} style - CTA style
   * @param {Object} context - Context
   * @returns {string|null} Supporting sentence
   */
  generateSupportingSentence(style, context) {
    const { companyResearch, jobAnalysis } = context;

    const sentences = {
      eager: [
        "I'm passionate about making a difference and learning from the best.",
        "I bring enthusiasm and a strong work ethic to every project.",
        null // Sometimes no supporting sentence
      ],
      confident: [
        "My proven track record speaks for itself.",
        "I'm ready to hit the ground running.",
        "I bring both expertise and execution."
      ],
      professional: [
        "Thank you for your time and consideration.",
        "I appreciate your review of my application.",
        null
      ],
      enthusiastic: [
        "This opportunity aligns perfectly with my passions and goals!",
        "I'm genuinely excited about this next chapter.",
        null
      ],
      collaborative: [
        "I believe great work happens through strong partnerships.",
        "I thrive in collaborative environments.",
        null
      ]
    };

    const options = sentences[style] || [null];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Score CTA quality
   * @param {Object} cta - CTA object
   * @param {Object} context - Context
   * @returns {number} Score 0-100
   */
  scoreCTA(cta, context) {
    let score = 50; // Base score

    // Length check (30-50 words ideal)
    const wordCount = cta.full.split(' ').length;
    if (wordCount >= 20 && wordCount <= 50) {
      score += 15;
    } else if (wordCount < 15 || wordCount > 60) {
      score -= 10;
    }

    // Personalization check
    if (cta.text.includes(context.companyName)) {
      score += 10;
    }

    // Context alignment
    const alignmentScore = this.calculateContextAlignment(cta.style, context);
    score += alignmentScore * 25;

    // Tone match
    if (cta.tone === context.companyResearch.culture?.tone) {
      score += 10;
    }

    // Supporting sentence bonus
    if (cta.supporting) {
      score += 5;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculate context alignment
   * @param {string} style - CTA style
   * @param {Object} context - Context
   * @returns {number} Alignment score 0-1
   */
  calculateContextAlignment(style, context) {
    const { companyResearch, jobAnalysis } = context;
    let alignment = 0.5; // Base

    // Seniority alignment
    const seniority = jobAnalysis.seniorityLevel;
    if ((seniority === 'entry' || seniority === 'junior') && style === 'eager') {
      alignment += 0.3;
    } else if ((seniority === 'senior' || seniority === 'director') && style === 'confident') {
      alignment += 0.3;
    }

    // Culture alignment
    const culture = companyResearch.culture?.primary;
    if (culture === 'innovative' && style === 'enthusiastic') {
      alignment += 0.2;
    } else if (culture === 'collaborative' && style === 'collaborative') {
      alignment += 0.2;
    }

    return Math.min(alignment, 1.0);
  }

  /**
   * Determine CTA tone
   * @param {string} style - CTA style
   * @returns {string} Tone
   */
  determineCTATone(style) {
    const toneMap = {
      eager: 'enthusiastic',
      confident: 'assertive',
      professional: 'formal',
      enthusiastic: 'passionate',
      collaborative: 'friendly'
    };
    return toneMap[style] || 'professional';
  }

  /**
   * Generate A/B testing variations
   * @param {Object} context - Context
   * @returns {Object} A/B variations
   */
  generateABVariations(context) {
    console.log(`[CTAVariation] Generating A/B test CTAs`);

    // Generate two contrasting styles
    const variantA = this.generateCTA('confident', context);
    const variantB = this.generateCTA('collaborative', context);

    return {
      variantA: {
        ...variantA,
        name: 'Variant A (Confident)',
        hypothesis: 'Emphasizes proven results and confidence',
        bestFor: 'Senior roles, competitive environments'
      },
      variantB: {
        ...variantB,
        name: 'Variant B (Collaborative)',
        hypothesis: 'Emphasizes teamwork and partnership',
        bestFor: 'Collaborative cultures, team-oriented roles'
      },
      testingGuide: {
        minimumApplications: 10,
        metricsToTrack: ['response rate', 'interview rate', 'time to response'],
        recommendedSplit: '50/50',
        duration: '2-4 weeks'
      }
    };
  }

  // Helper methods for template filling

  extractGoal(companyResearch) {
    if (companyResearch.news?.mostRecent) {
      return companyResearch.news.mostRecent.title.split(' ').slice(0, 5).join(' ').toLowerCase();
    }
    if (companyResearch.about?.mission) {
      return companyResearch.about.mission.split('.')[0].split(' ').slice(0, 5).join(' ').toLowerCase();
    }
    return 'your goals';
  }

  extractImpact(companyResearch) {
    if (companyResearch.about?.mission) {
      return companyResearch.about.mission.split('.')[0].toLowerCase();
    }
    return 'make an impact';
  }

  calculateYearsExperience(resume) {
    if (!resume.experience || resume.experience.length === 0) return '0';
    
    // Simple calculation based on experience count
    return Math.min(resume.experience.length * 2, 15).toString();
  }

  extractTopAchievement(resume) {
    if (!resume.experience || resume.experience.length === 0) return 'delivering results';
    
    const firstExp = resume.experience[0];
    if (firstExp.responsibilities && firstExp.responsibilities.length > 0) {
      return firstExp.responsibilities[0].toLowerCase().split('.')[0];
    }
    return 'achieving goals';
  }

  extractMetric(resume) {
    if (!resume.experience) return '20%';
    
    // Look for percentage in responsibilities
    for (const exp of resume.experience) {
      for (const resp of exp.responsibilities || []) {
        const match = resp.match(/(\d+%)/);
        if (match) return match[1];
      }
    }
    return '20%';
  }

  extractDomain(resume) {
    if (!resume.skills || resume.skills.length === 0) return 'my field';
    return resume.skills[0].toLowerCase();
  }

  extractInitiative(companyResearch) {
    if (companyResearch.news?.mostRecent) {
      return companyResearch.news.mostRecent.category;
    }
    return 'key initiatives';
  }

  extractField(jobAnalysis) {
    if (jobAnalysis.industry?.primary) {
      return jobAnalysis.industry.primary.toLowerCase();
    }
    return 'the field';
  }

  extractResponsibility(jobAnalysis) {
    if (jobAnalysis.emphasis?.primary) {
      return jobAnalysis.emphasis.primary + ' initiatives';
    }
    return 'key responsibilities';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CTAVariationService;
}
