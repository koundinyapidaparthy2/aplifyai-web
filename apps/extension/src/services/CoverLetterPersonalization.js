/**
 * CoverLetterPersonalization
 * 
 * Intelligent cover letter personalization using company research.
 * 
 * Features:
 * - Incorporate company news and achievements
 * - Align with company values
 * - Reference specific initiatives
 * - Use hiring manager name (if found)
 * - Match company tone and culture
 * - Personalized call-to-action
 * - Industry-specific language
 * 
 * Personalization Strategies:
 * - Opening: Reference recent news or achievement
 * - Body: Align experience with company values
 * - Closing: Company-specific CTA
 */

class CoverLetterPersonalization {
  constructor() {
    this.personalizationStrategies = {
      opening: ['news', 'achievement', 'value', 'mission'],
      body: ['values_alignment', 'initiative_support', 'culture_fit'],
      closing: ['eager', 'confident', 'professional', 'enthusiastic']
    };
  }

  /**
   * Generate personalized cover letter
   * @param {Object} baseContent - Base cover letter content
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job description analysis
   * @param {Object} resume - Resume data
   * @param {Object} options - Personalization options
   * @returns {Promise<Object>} Personalized cover letter
   */
  async personalizeCoverLetter(baseContent, companyResearch, jobAnalysis, resume, options = {}) {
    console.log(`[CoverLetterPersonalization] Personalizing for ${companyResearch.companyName}`);

    const personalized = {
      companyName: companyResearch.companyName,
      jobTitle: jobAnalysis.jobTitle || options.jobTitle,
      
      // Personalized sections
      greeting: this.personalizeGreeting(companyResearch, jobAnalysis),
      opening: await this.personalizeOpening(baseContent.opening, companyResearch, jobAnalysis, options),
      body: await this.personalizeBody(baseContent.body, companyResearch, jobAnalysis, resume, options),
      closing: await this.personalizeClosing(baseContent.closing, companyResearch, jobAnalysis, options),
      signature: this.personalizeSignature(resume),
      
      // Metadata
      personalizationScore: 0,
      personalizations: [],
      tone: companyResearch.culture?.tone || 'professional',
      confidence: companyResearch.confidence?.overall || 0.5,
      
      // Full letter
      fullLetter: null
    };

    // Calculate personalization score
    personalized.personalizationScore = this.calculatePersonalizationScore(personalized);

    // Assemble full letter
    personalized.fullLetter = this.assembleLetter(personalized);

    return personalized;
  }

  /**
   * Personalize greeting
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @returns {Object} Personalized greeting
   */
  personalizeGreeting(companyResearch, jobAnalysis) {
    const greeting = {
      text: '',
      personalized: false,
      hiringManager: null
    };

    // Try to find hiring manager
    const hiringManager = companyResearch.leadership?.hiringManager;
    
    if (hiringManager && hiringManager.name) {
      greeting.text = `Dear ${hiringManager.name},`;
      greeting.personalized = true;
      greeting.hiringManager = hiringManager.name;
    } else if (companyResearch.leadership?.ceo && jobAnalysis.seniorityLevel === 'executive') {
      // For executive roles, address to CEO
      greeting.text = `Dear ${companyResearch.leadership.ceo.name},`;
      greeting.personalized = true;
      greeting.hiringManager = companyResearch.leadership.ceo.name;
    } else {
      // Generic greeting
      const title = jobAnalysis.jobTitle || 'Position';
      greeting.text = `Dear Hiring Manager,`;
      greeting.personalized = false;
    }

    return greeting;
  }

  /**
   * Personalize opening paragraph
   * @param {string} baseOpening - Base opening content
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @param {Object} options - Options
   * @returns {Promise<Object>} Personalized opening
   */
  async personalizeOpening(baseOpening, companyResearch, jobAnalysis, options) {
    const opening = {
      text: baseOpening,
      hook: null,
      references: [],
      strategy: 'generic'
    };

    // Choose best opening strategy
    const strategy = this.selectOpeningStrategy(companyResearch, jobAnalysis);
    opening.strategy = strategy;

    switch (strategy) {
      case 'news':
        opening.hook = this.createNewsHook(companyResearch.news, companyResearch.companyName);
        break;
      
      case 'achievement':
        opening.hook = this.createAchievementHook(companyResearch.achievements, companyResearch.companyName);
        break;
      
      case 'value':
        opening.hook = this.createValueHook(companyResearch.values, companyResearch.companyName);
        break;
      
      case 'mission':
        opening.hook = this.createMissionHook(companyResearch.about, companyResearch.companyName);
        break;
      
      default:
        opening.hook = this.createGenericHook(companyResearch.companyName, jobAnalysis.jobTitle);
    }

    // Integrate hook with base opening
    if (opening.hook) {
      opening.text = `${opening.hook} ${baseOpening}`;
      opening.references.push({
        type: strategy,
        content: opening.hook
      });
    }

    return opening;
  }

  /**
   * Select best opening strategy
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @returns {string} Strategy
   */
  selectOpeningStrategy(companyResearch, jobAnalysis) {
    // Priority: Recent positive news > Achievement > Value > Mission
    
    if (companyResearch.news?.mostRecent?.sentiment === 'positive') {
      return 'news';
    }
    
    if (companyResearch.achievements?.count > 0) {
      return 'achievement';
    }
    
    if (companyResearch.values?.values?.length > 0) {
      return 'value';
    }
    
    if (companyResearch.about?.mission) {
      return 'mission';
    }
    
    return 'generic';
  }

  /**
   * Create news-based hook
   * @param {Object} news - News data
   * @param {string} companyName - Company name
   * @returns {string} Hook
   */
  createNewsHook(news, companyName) {
    if (!news || !news.mostRecent) return null;

    const article = news.mostRecent;
    const templates = [
      `I was excited to learn about ${companyName}'s recent ${article.category} - ${article.title.toLowerCase()}.`,
      `${companyName}'s recent announcement about ${article.title.toLowerCase()} caught my attention.`,
      `Following ${companyName}'s ${article.category} news, I'm eager to contribute to this momentum.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Create achievement-based hook
   * @param {Object} achievements - Achievements data
   * @param {string} companyName - Company name
   * @returns {string} Hook
   */
  createAchievementHook(achievements, companyName) {
    if (!achievements || achievements.count === 0) return null;

    const achievement = achievements.items[0];
    const templates = [
      `I've been impressed by ${companyName}'s ${achievement.category} success, particularly ${achievement.title.toLowerCase()}.`,
      `${companyName}'s recognition for ${achievement.title.toLowerCase()} demonstrates your commitment to excellence.`,
      `Learning about ${companyName}'s achievement in ${achievement.category} reinforced my interest in joining your team.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Create value-based hook
   * @param {Object} values - Values data
   * @param {string} companyName - Company name
   * @returns {string} Hook
   */
  createValueHook(values, companyName) {
    if (!values || !values.values || values.values.length === 0) return null;

    const topValue = values.values[0].value.toLowerCase();
    const templates = [
      `${companyName}'s commitment to ${topValue} deeply resonates with my professional values.`,
      `I'm drawn to ${companyName}'s emphasis on ${topValue}, which aligns with my approach to work.`,
      `Your focus on ${topValue} is what sets ${companyName} apart and why I'm excited about this opportunity.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Create mission-based hook
   * @param {Object} about - About data
   * @param {string} companyName - Company name
   * @returns {string} Hook
   */
  createMissionHook(about, companyName) {
    if (!about || !about.mission) return null;

    // Extract key phrase from mission (first 30 chars or until comma)
    const missionSnippet = about.mission.split(',')[0].slice(0, 50);

    const templates = [
      `${companyName}'s mission to ${missionSnippet.toLowerCase()} aligns perfectly with my career goals.`,
      `I'm inspired by ${companyName}'s focus on ${missionSnippet.toLowerCase()}.`,
      `Your mission - ${missionSnippet.toLowerCase()} - is what draws me to ${companyName}.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Create generic hook
   * @param {string} companyName - Company name
   * @param {string} jobTitle - Job title
   * @returns {string} Hook
   */
  createGenericHook(companyName, jobTitle) {
    const templates = [
      `I'm excited to apply for the ${jobTitle} position at ${companyName}.`,
      `I'm writing to express my strong interest in the ${jobTitle} role at ${companyName}.`,
      `The ${jobTitle} opportunity at ${companyName} is exactly what I've been seeking in my next role.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Personalize body paragraphs
   * @param {Array} bodyParagraphs - Base body content
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @param {Object} resume - Resume data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Personalized body
   */
  async personalizeBody(bodyParagraphs, companyResearch, jobAnalysis, resume, options) {
    const body = {
      paragraphs: [],
      valueAlignments: [],
      initiativeReferences: [],
      cultureFit: []
    };

    // Process each paragraph
    for (const paragraph of bodyParagraphs) {
      const personalized = await this.personalizeParagraph(
        paragraph,
        companyResearch,
        jobAnalysis,
        resume
      );
      
      body.paragraphs.push(personalized.text);
      body.valueAlignments.push(...personalized.valueAlignments);
      body.initiativeReferences.push(...personalized.initiatives);
      body.cultureFit.push(...personalized.cultureFit);
    }

    // Add value alignment paragraph if strong matches found
    if (companyResearch.values?.values?.length > 0) {
      const valuesParagraph = this.createValuesAlignmentParagraph(
        companyResearch.values,
        resume,
        jobAnalysis
      );
      
      if (valuesParagraph) {
        body.paragraphs.splice(1, 0, valuesParagraph); // Insert after first paragraph
        body.valueAlignments.push({
          type: 'dedicated_paragraph',
          values: companyResearch.values.values.slice(0, 3).map(v => v.value)
        });
      }
    }

    return body;
  }

  /**
   * Personalize individual paragraph
   * @param {string} paragraph - Base paragraph
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @param {Object} resume - Resume data
   * @returns {Promise<Object>} Personalized paragraph
   */
  async personalizeParagraph(paragraph, companyResearch, jobAnalysis, resume) {
    const result = {
      text: paragraph,
      valueAlignments: [],
      initiatives: [],
      cultureFit: []
    };

    // Add company-specific keywords
    result.text = this.injectCompanyKeywords(paragraph, companyResearch, jobAnalysis);

    // Add culture fit indicators
    if (companyResearch.culture) {
      result.text = this.addCultureFitLanguage(result.text, companyResearch.culture);
      result.cultureFit.push({
        tone: companyResearch.culture.tone,
        trait: companyResearch.culture.primary
      });
    }

    return result;
  }

  /**
   * Create values alignment paragraph
   * @param {Object} values - Values data
   * @param {Object} resume - Resume data
   * @param {Object} jobAnalysis - Job analysis
   * @returns {string|null} Paragraph
   */
  createValuesAlignmentParagraph(values, resume, jobAnalysis) {
    if (!values.values || values.values.length === 0) return null;

    const topValues = values.values.slice(0, 3).map(v => v.value.toLowerCase());
    
    // Find resume experiences that demonstrate these values
    const alignments = this.findValueAlignments(topValues, resume);

    if (alignments.length === 0) return null;

    const value1 = topValues[0];
    const value2 = topValues[1];
    const example = alignments[0];

    const templates = [
      `I particularly appreciate your emphasis on ${value1} and ${value2}. In my previous role, ${example.toLowerCase()}, demonstrating my commitment to similar values.`,
      `Your company values of ${value1} and ${value2} resonate with my professional approach. For example, ${example.toLowerCase()}.`,
      `The focus on ${value1} and ${value2} at your company aligns with my experience, where ${example.toLowerCase()}.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Find resume examples that align with values
   * @param {Array} values - Company values
   * @param {Object} resume - Resume data
   * @returns {Array} Alignments
   */
  findValueAlignments(values, resume) {
    const alignments = [];

    // Map values to experience keywords
    const valueKeywords = {
      innovation: ['innovative', 'new', 'created', 'developed', 'pioneered'],
      collaboration: ['team', 'collaborated', 'partnered', 'cross-functional'],
      excellence: ['achieved', 'exceeded', 'improved', 'optimized'],
      customer: ['customer', 'user', 'client', 'satisfaction'],
      diversity: ['diverse', 'inclusive', 'global', 'multicultural'],
      integrity: ['maintained', 'ensured', 'compliance', 'ethical']
    };

    // Search resume experiences
    if (resume.experience) {
      for (const exp of resume.experience) {
        for (const responsibility of exp.responsibilities || []) {
          const text = responsibility.toLowerCase();
          
          for (const value of values) {
            const keywords = valueKeywords[value] || [];
            if (keywords.some(k => text.includes(k))) {
              alignments.push(responsibility);
              break;
            }
          }
          
          if (alignments.length >= 3) break;
        }
        if (alignments.length >= 3) break;
      }
    }

    return alignments;
  }

  /**
   * Inject company keywords
   * @param {string} paragraph - Base paragraph
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @returns {string} Enhanced paragraph
   */
  injectCompanyKeywords(paragraph, companyResearch, jobAnalysis) {
    // This is a simplified version - in production, use more sophisticated NLP
    return paragraph;
  }

  /**
   * Add culture fit language
   * @param {string} text - Base text
   * @param {Object} culture - Culture data
   * @returns {string} Enhanced text
   */
  addCultureFitLanguage(text, culture) {
    // Adjust language based on culture tone
    if (culture.tone === 'casual') {
      text = text.replace(/I am/g, "I'm");
      text = text.replace(/I would/g, "I'd");
    } else if (culture.tone === 'formal') {
      text = text.replace(/I'm/g, "I am");
      text = text.replace(/I'd/g, "I would");
    }

    return text;
  }

  /**
   * Personalize closing paragraph
   * @param {string} baseClosing - Base closing
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @param {Object} options - Options
   * @returns {Promise<Object>} Personalized closing
   */
  async personalizeClosing(baseClosing, companyResearch, jobAnalysis, options) {
    const closing = {
      text: baseClosing,
      cta: null,
      style: 'professional',
      references: []
    };

    // Select CTA style based on culture and seniority
    const ctaStyle = this.selectCTAStyle(companyResearch.culture, jobAnalysis);
    closing.style = ctaStyle;

    // Generate personalized CTA
    closing.cta = this.generateCTA(
      ctaStyle,
      companyResearch.companyName,
      jobAnalysis.jobTitle,
      companyResearch.culture?.tone
    );

    // Add future-focused statement
    const futureStatement = this.generateFutureStatement(
      companyResearch,
      jobAnalysis
    );

    closing.text = `${futureStatement} ${closing.cta}`;

    return closing;
  }

  /**
   * Select CTA style
   * @param {Object} culture - Culture data
   * @param {Object} jobAnalysis - Job analysis
   * @returns {string} CTA style
   */
  selectCTAStyle(culture, jobAnalysis) {
    // Senior roles + formal culture = confident
    if (jobAnalysis.seniorityLevel === 'senior' && culture?.tone === 'formal') {
      return 'confident';
    }

    // Junior roles + casual culture = eager
    if (jobAnalysis.seniorityLevel === 'junior' && culture?.tone === 'casual') {
      return 'eager';
    }

    // Startup culture = enthusiastic
    if (culture?.primary === 'innovative' || culture?.primary === 'fastPaced') {
      return 'enthusiastic';
    }

    return 'professional';
  }

  /**
   * Generate CTA
   * @param {string} style - CTA style
   * @param {string} companyName - Company name
   * @param {string} jobTitle - Job title
   * @param {string} tone - Company tone
   * @returns {string} CTA
   */
  generateCTA(style, companyName, jobTitle, tone) {
    const templates = {
      eager: [
        `I would love the opportunity to discuss how I can contribute to ${companyName}'s continued success.`,
        `I'm excited about the possibility of joining your team and contributing to ${companyName}.`,
        `I'd be thrilled to learn more about this opportunity and discuss how I can add value.`
      ],
      confident: [
        `I'm confident that my experience and skills make me an excellent fit for this role.`,
        `I look forward to discussing how my background aligns with ${companyName}'s goals.`,
        `I'm prepared to make immediate contributions to ${companyName} and would welcome the opportunity to discuss this further.`
      ],
      enthusiastic: [
        `I'm genuinely excited about the prospect of contributing to ${companyName}'s mission!`,
        `This opportunity to join ${companyName} is exactly what I've been looking for, and I can't wait to discuss it further.`,
        `I'd love to explore how we can work together to drive ${companyName}'s continued growth and innovation.`
      ],
      professional: [
        `I would welcome the opportunity to discuss how my qualifications align with ${companyName}'s needs.`,
        `I look forward to speaking with you about this ${jobTitle} position.`,
        `Thank you for considering my application. I'm eager to discuss how I can contribute to your team.`
      ]
    };

    const options = templates[style] || templates.professional;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate future-focused statement
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @returns {string} Statement
   */
  generateFutureStatement(companyResearch, jobAnalysis) {
    const templates = [];

    // If company is growing/expanding
    if (companyResearch.news?.categories?.expansion) {
      templates.push(
        `I'm excited about the opportunity to be part of ${companyResearch.companyName}'s growth trajectory.`
      );
    }

    // If company has recent product launch
    if (companyResearch.news?.categories?.product_launch) {
      templates.push(
        `I'm eager to contribute to the next phase of ${companyResearch.companyName}'s product evolution.`
      );
    }

    // If company emphasizes innovation
    if (companyResearch.culture?.primary === 'innovative') {
      templates.push(
        `I'm energized by the prospect of driving innovation at ${companyResearch.companyName}.`
      );
    }

    // Default
    templates.push(
      `I'm enthusiastic about the opportunity to contribute to ${companyResearch.companyName}'s success.`
    );

    return templates[Math.floor(Math.random() * Math.min(templates.length, 3))];
  }

  /**
   * Personalize signature
   * @param {Object} resume - Resume data
   * @returns {Object} Signature
   */
  personalizeSignature(resume) {
    return {
      closing: 'Sincerely,',
      name: resume.personalInfo?.name || 'Your Name',
      contact: {
        email: resume.personalInfo?.email,
        phone: resume.personalInfo?.phone,
        linkedin: resume.personalInfo?.linkedin
      }
    };
  }

  /**
   * Calculate personalization score
   * @param {Object} personalized - Personalized cover letter
   * @returns {number} Score 0-100
   */
  calculatePersonalizationScore(personalized) {
    let score = 0;
    const weights = {
      greeting: 15,
      opening: 30,
      body: 35,
      closing: 20
    };

    // Greeting score
    if (personalized.greeting.personalized) {
      score += weights.greeting;
    }

    // Opening score
    if (personalized.opening.hook) {
      score += weights.opening;
    } else {
      score += weights.opening * 0.3; // Partial credit
    }

    // Body score
    const bodyScore = (
      (personalized.body.valueAlignments.length > 0 ? 0.4 : 0) +
      (personalized.body.initiativeReferences.length > 0 ? 0.3 : 0) +
      (personalized.body.cultureFit.length > 0 ? 0.3 : 0)
    );
    score += weights.body * bodyScore;

    // Closing score
    if (personalized.closing.cta && personalized.closing.style !== 'professional') {
      score += weights.closing;
    } else {
      score += weights.closing * 0.5;
    }

    return Math.round(score);
  }

  /**
   * Assemble full letter
   * @param {Object} personalized - Personalized sections
   * @returns {string} Full letter
   */
  assembleLetter(personalized) {
    const parts = [
      personalized.greeting.text,
      '',
      personalized.opening.text,
      '',
      ...personalized.body.paragraphs.map(p => `${p}\n`),
      personalized.closing.text,
      '',
      personalized.signature.closing,
      personalized.signature.name
    ];

    return parts.join('\n');
  }

  /**
   * Generate personalization report
   * @param {Object} personalized - Personalized cover letter
   * @returns {Object} Report
   */
  generatePersonalizationReport(personalized) {
    return {
      score: personalized.personalizationScore,
      confidence: personalized.confidence,
      personalizations: {
        greeting: personalized.greeting.personalized,
        openingHook: !!personalized.opening.hook,
        valueAlignments: personalized.body.valueAlignments.length,
        initiativeReferences: personalized.body.initiativeReferences.length,
        cultureFit: personalized.body.cultureFit.length,
        customCTA: personalized.closing.style !== 'professional'
      },
      recommendations: this.generateRecommendations(personalized),
      highlights: this.generateHighlights(personalized)
    };
  }

  /**
   * Generate recommendations for improvement
   * @param {Object} personalized - Personalized cover letter
   * @returns {Array} Recommendations
   */
  generateRecommendations(personalized) {
    const recommendations = [];

    if (!personalized.greeting.personalized) {
      recommendations.push({
        priority: 'medium',
        category: 'greeting',
        suggestion: 'Try to find the hiring manager\'s name on LinkedIn for a more personal greeting'
      });
    }

    if (!personalized.opening.hook) {
      recommendations.push({
        priority: 'high',
        category: 'opening',
        suggestion: 'Add a reference to recent company news or achievements in the opening'
      });
    }

    if (personalized.body.valueAlignments.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'body',
        suggestion: 'Include specific examples of how your experience aligns with company values'
      });
    }

    if (personalized.personalizationScore < 60) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        suggestion: 'Cover letter needs more personalization. Research the company more deeply.'
      });
    }

    return recommendations;
  }

  /**
   * Generate highlights
   * @param {Object} personalized - Personalized cover letter
   * @returns {Array} Highlights
   */
  generateHighlights(personalized) {
    const highlights = [];

    if (personalized.greeting.personalized) {
      highlights.push({
        section: 'greeting',
        text: `Addressed to ${personalized.greeting.hiringManager}`,
        impact: 'high'
      });
    }

    if (personalized.opening.hook) {
      highlights.push({
        section: 'opening',
        text: `Referenced ${personalized.opening.strategy}`,
        impact: 'high'
      });
    }

    if (personalized.body.valueAlignments.length > 0) {
      highlights.push({
        section: 'body',
        text: `Aligned with ${personalized.body.valueAlignments.length} company values`,
        impact: 'medium'
      });
    }

    if (personalized.closing.style !== 'professional') {
      highlights.push({
        section: 'closing',
        text: `${personalized.closing.style.charAt(0).toUpperCase() + personalized.closing.style.slice(1)} closing that matches company culture`,
        impact: 'medium'
      });
    }

    return highlights;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoverLetterPersonalization;
}
