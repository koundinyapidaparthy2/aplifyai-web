/**
 * Job Description Analyzer
 * Advanced analysis of job descriptions to extract insights for resume customization
 */

class JobDescriptionAnalyzer {
  constructor() {
    this.skillKeywords = this.loadSkillKeywords();
    this.cultureKeywords = this.loadCultureKeywords();
    this.industryTerms = this.loadIndustryTerms();
    this.formalityIndicators = this.loadFormalityIndicators();
  }

  /**
   * Comprehensive job description analysis
   * @param {string} jobDescription - Full job description text
   * @param {string} companyName - Company name
   * @param {string} jobTitle - Job title
   * @returns {Promise<object>} Analysis results
   */
  async analyzeJobDescription(jobDescription, companyName = '', jobTitle = '') {
    const analysis = {
      skills: await this.analyzeSkills(jobDescription),
      culture: this.analyzeCulture(jobDescription, companyName),
      industry: this.detectIndustry(jobDescription, companyName),
      formality: this.assessFormality(jobDescription),
      requirements: this.parseRequirements(jobDescription),
      keywords: this.extractKeywords(jobDescription),
      seniorityLevel: this.detectSeniorityLevel(jobTitle, jobDescription),
      companyType: this.detectCompanyType(companyName, jobDescription),
      emphasis: this.detectEmphasis(jobDescription),
      metadata: {
        jobTitle,
        companyName,
        analyzedAt: new Date().toISOString(),
      },
    };

    // Generate recommendations based on analysis
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze skills mentioned in job description
   * Categorizes into required, preferred, and nice-to-have
   */
  async analyzeSkills(jobDescription) {
    const text = jobDescription.toLowerCase();
    
    // Extract skills by section
    const requiredSection = this.extractSection(text, [
      'required', 'must have', 'requirements', 'qualifications',
    ]);
    const preferredSection = this.extractSection(text, [
      'preferred', 'nice to have', 'bonus', 'plus',
    ]);

    const skills = {
      required: [],
      preferred: [],
      technical: [],
      soft: [],
      tools: [],
      certifications: [],
      priorityOrder: [],
    };

    // Detect technical skills
    const technicalSkills = this.detectTechnicalSkills(text);
    skills.technical = technicalSkills.map(skill => ({
      name: skill,
      importance: requiredSection.includes(skill.toLowerCase()) ? 'required' : 'preferred',
      frequency: this.countOccurrences(text, skill.toLowerCase()),
      context: this.getSkillContext(text, skill),
    }));

    // Detect soft skills
    const softSkills = this.detectSoftSkills(text);
    skills.soft = softSkills.map(skill => ({
      name: skill,
      importance: requiredSection.includes(skill.toLowerCase()) ? 'required' : 'preferred',
      frequency: this.countOccurrences(text, skill.toLowerCase()),
    }));

    // Detect tools and technologies
    skills.tools = this.detectTools(text);

    // Detect certifications
    skills.certifications = this.detectCertifications(text);

    // Categorize by requirement level
    skills.required = skills.technical
      .filter(s => s.importance === 'required')
      .map(s => s.name);
    
    skills.preferred = skills.technical
      .filter(s => s.importance === 'preferred')
      .map(s => s.name);

    // Create priority order based on frequency and position
    skills.priorityOrder = this.createSkillPriorityOrder(skills, text);

    return skills;
  }

  /**
   * Analyze company culture from job description
   */
  analyzeCulture(jobDescription, companyName) {
    const text = jobDescription.toLowerCase();
    
    const cultureTraits = {
      innovation: 0,
      collaboration: 0,
      fastPaced: 0,
      workLifeBalance: 0,
      diversity: 0,
      growth: 0,
      autonomy: 0,
      traditional: 0,
    };

    // Score each trait based on keywords
    Object.keys(this.cultureKeywords).forEach(trait => {
      const keywords = this.cultureKeywords[trait];
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          cultureTraits[trait] += 1;
        }
      });
    });

    // Detect company values
    const values = this.detectCompanyValues(text);

    // Detect perks and benefits
    const perks = this.detectPerks(text);

    // Overall culture type
    const cultureType = this.determineCultureType(cultureTraits);

    return {
      traits: cultureTraits,
      values,
      perks,
      type: cultureType,
      keywords: this.extractCultureKeywords(text),
      tone: this.detectTone(text),
    };
  }

  /**
   * Detect industry from job description
   */
  detectIndustry(jobDescription, companyName) {
    const text = (jobDescription + ' ' + companyName).toLowerCase();
    
    const industries = {
      technology: ['software', 'tech', 'saas', 'cloud', 'ai', 'ml', 'data'],
      finance: ['finance', 'fintech', 'banking', 'investment', 'trading'],
      healthcare: ['healthcare', 'medical', 'hospital', 'pharma', 'biotech'],
      ecommerce: ['ecommerce', 'e-commerce', 'retail', 'marketplace', 'shopping'],
      consulting: ['consulting', 'advisory', 'strategy', 'management consulting'],
      education: ['education', 'edtech', 'learning', 'university', 'training'],
      media: ['media', 'entertainment', 'gaming', 'streaming', 'content'],
      manufacturing: ['manufacturing', 'production', 'industrial', 'supply chain'],
    };

    const scores = {};
    Object.keys(industries).forEach(industry => {
      scores[industry] = 0;
      industries[industry].forEach(keyword => {
        scores[industry] += this.countOccurrences(text, keyword);
      });
    });

    // Get top industries
    const sortedIndustries = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0)
      .map(([industry, score]) => ({ industry, confidence: Math.min(score * 10, 100) }));

    return {
      primary: sortedIndustries[0]?.industry || 'general',
      secondary: sortedIndustries.slice(1, 3).map(i => i.industry),
      confidence: sortedIndustries[0]?.confidence || 50,
      terminology: this.extractIndustryTerminology(text),
    };
  }

  /**
   * Assess formality level of job description
   */
  assessFormality(jobDescription) {
    const text = jobDescription.toLowerCase();
    
    const formalIndicators = [
      'pursuant to', 'shall', 'aforementioned', 'herein', 'thereof',
      'in accordance with', 'respective', 'notwithstanding',
    ];
    
    const casualIndicators = [
      'awesome', 'cool', 'fun', 'rockstar', 'ninja', 'guru',
      'we\'re', 'you\'ll', 'we\'d love', 'join us', 'come work',
    ];

    const formalScore = formalIndicators.reduce((score, indicator) => 
      score + this.countOccurrences(text, indicator), 0
    );

    const casualScore = casualIndicators.reduce((score, indicator) => 
      score + this.countOccurrences(text, indicator), 0
    );

    // Analyze sentence structure
    const sentences = jobDescription.split(/[.!?]+/);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    // Formal writing tends to have longer sentences
    const lengthScore = avgSentenceLength > 20 ? 1 : 0;

    // Calculate overall formality (0-100)
    const totalScore = (formalScore * 2) + lengthScore - casualScore;
    const formalityScore = Math.max(0, Math.min(100, 50 + (totalScore * 10)));

    return {
      score: formalityScore,
      level: this.getFormalityLevel(formalityScore),
      formalIndicators: formalIndicators.filter(i => text.includes(i)),
      casualIndicators: casualIndicators.filter(i => text.includes(i)),
      avgSentenceLength,
      recommendedTone: this.getRecommendedTone(formalityScore),
    };
  }

  /**
   * Parse requirements from job description
   */
  parseRequirements(jobDescription) {
    const requirements = {
      education: [],
      experience: [],
      skills: [],
      mustHave: [],
      niceToHave: [],
    };

    // Extract education requirements
    const eduRegex = /(bachelor|master|phd|degree|diploma|certification)/gi;
    const eduMatches = jobDescription.match(eduRegex);
    if (eduMatches) {
      requirements.education = [...new Set(eduMatches.map(e => e.toLowerCase()))];
    }

    // Extract experience requirements
    const expRegex = /(\d+)\+?\s*(years?|yrs?)(\s*of)?\s*(experience|exp)/gi;
    const expMatches = [...jobDescription.matchAll(expRegex)];
    requirements.experience = expMatches.map(match => ({
      years: parseInt(match[1]),
      description: match[0],
    }));

    // Extract must-have vs nice-to-have
    const sections = this.splitIntoSections(jobDescription);
    requirements.mustHave = sections.required || [];
    requirements.niceToHave = sections.preferred || [];

    return requirements;
  }

  /**
   * Extract important keywords from job description
   */
  extractKeywords(jobDescription) {
    const text = jobDescription.toLowerCase();
    
    // Remove common words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'can', 'could', 'may', 'might', 'must', 'shall', 'this', 'that',
    ]);

    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    // Count frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get top keywords
    const topKeywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count, weight: count / words.length }));

    return {
      top: topKeywords,
      technical: topKeywords.filter(k => this.isTechnicalKeyword(k.word)),
      action: this.extractActionVerbs(text),
      industry: topKeywords.filter(k => this.isIndustryKeyword(k.word)),
    };
  }

  /**
   * Detect seniority level from job title and description
   */
  detectSeniorityLevel(jobTitle, jobDescription) {
    const text = (jobTitle + ' ' + jobDescription).toLowerCase();
    
    const seniorityKeywords = {
      intern: ['intern', 'internship', 'student'],
      junior: ['junior', 'entry level', 'entry-level', 'associate', '0-2 years'],
      mid: ['mid-level', 'intermediate', '2-5 years', '3-5 years'],
      senior: ['senior', 'sr.', '5+ years', '5-10 years', 'lead'],
      staff: ['staff', 'principal', 'expert', '10+ years'],
      director: ['director', 'head of', 'vp', 'vice president'],
      executive: ['cto', 'cio', 'ceo', 'chief', 'executive'],
    };

    let detectedLevel = 'mid'; // default
    let maxScore = 0;

    Object.entries(seniorityKeywords).forEach(([level, keywords]) => {
      const score = keywords.reduce((sum, keyword) => 
        sum + this.countOccurrences(text, keyword), 0
      );
      if (score > maxScore) {
        maxScore = score;
        detectedLevel = level;
      }
    });

    // Extract years of experience
    const yearsMatch = text.match(/(\d+)\+?\s*(years?|yrs?)/);
    const years = yearsMatch ? parseInt(yearsMatch[1]) : null;

    return {
      level: detectedLevel,
      years,
      confidence: Math.min(maxScore * 20, 100),
      indicators: seniorityKeywords[detectedLevel].filter(k => text.includes(k)),
    };
  }

  /**
   * Detect company type (startup, corporate, etc.)
   */
  detectCompanyType(companyName, jobDescription) {
    const text = (companyName + ' ' + jobDescription).toLowerCase();
    
    const indicators = {
      startup: ['startup', 'early stage', 'seed', 'series a', 'fast-growing', 'founded', 'venture-backed'],
      corporate: ['fortune 500', 'enterprise', 'global leader', 'established', 'multinational'],
      agency: ['agency', 'consultancy', 'consulting firm', 'client work', 'client projects'],
      nonprofit: ['nonprofit', 'non-profit', 'ngo', 'charity', 'foundation', 'mission-driven'],
    };

    const scores = {};
    Object.entries(indicators).forEach(([type, keywords]) => {
      scores[type] = keywords.reduce((sum, keyword) => 
        sum + this.countOccurrences(text, keyword), 0
      );
    });

    const topType = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      type: topType[1] > 0 ? topType[0] : 'unknown',
      confidence: Math.min(topType[1] * 20, 100),
      indicators: indicators[topType[0]]?.filter(k => text.includes(k)) || [],
    };
  }

  /**
   * Detect what the job description emphasizes
   */
  detectEmphasis(jobDescription) {
    const text = jobDescription.toLowerCase();
    
    const emphasisAreas = {
      technical: 0,
      leadership: 0,
      collaboration: 0,
      innovation: 0,
      impact: 0,
      growth: 0,
    };

    const emphasisKeywords = {
      technical: ['technical', 'coding', 'programming', 'architecture', 'engineering', 'development'],
      leadership: ['lead', 'manage', 'mentor', 'guide', 'oversee', 'direct'],
      collaboration: ['collaborate', 'team', 'cross-functional', 'stakeholder', 'partner'],
      innovation: ['innovate', 'create', 'build', 'pioneer', 'cutting-edge', 'new'],
      impact: ['impact', 'results', 'metrics', 'outcomes', 'deliver', 'achieve'],
      growth: ['grow', 'scale', 'expand', 'accelerate', 'advance'],
    };

    Object.entries(emphasisKeywords).forEach(([area, keywords]) => {
      keywords.forEach(keyword => {
        emphasisAreas[area] += this.countOccurrences(text, keyword);
      });
    });

    // Sort by emphasis
    const sortedEmphasis = Object.entries(emphasisAreas)
      .sort((a, b) => b[1] - a[1])
      .map(([area, score]) => ({ area, score, percentage: 0 }));

    const totalScore = sortedEmphasis.reduce((sum, e) => sum + e.score, 0);
    sortedEmphasis.forEach(e => {
      e.percentage = totalScore > 0 ? Math.round((e.score / totalScore) * 100) : 0;
    });

    return {
      primary: sortedEmphasis[0]?.area || 'technical',
      secondary: sortedEmphasis[1]?.area,
      distribution: sortedEmphasis,
      recommendation: this.getEmphasisRecommendation(sortedEmphasis[0]?.area),
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Skill recommendations
    if (analysis.skills.required.length > 0) {
      recommendations.push({
        type: 'skills',
        priority: 'high',
        message: `Highlight these required skills: ${analysis.skills.required.slice(0, 5).join(', ')}`,
        action: 'reorder_skills',
      });
    }

    // Tone recommendations
    if (analysis.formality.score > 70) {
      recommendations.push({
        type: 'tone',
        priority: 'medium',
        message: 'Use formal language and professional terminology',
        action: 'adjust_tone',
        target: 'formal',
      });
    } else if (analysis.formality.score < 40) {
      recommendations.push({
        type: 'tone',
        priority: 'medium',
        message: 'Use conversational language and show personality',
        action: 'adjust_tone',
        target: 'casual',
      });
    }

    // Emphasis recommendations
    if (analysis.emphasis.primary === 'leadership') {
      recommendations.push({
        type: 'content',
        priority: 'high',
        message: 'Emphasize leadership experience and team management',
        action: 'emphasize_leadership',
      });
    }

    // Quantification recommendations
    if (analysis.emphasis.distribution.find(d => d.area === 'impact')?.score > 5) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        message: 'Include quantified achievements and metrics',
        action: 'add_metrics',
      });
    }

    // Industry terminology
    if (analysis.industry.terminology.length > 0) {
      recommendations.push({
        type: 'keywords',
        priority: 'medium',
        message: `Use industry terminology: ${analysis.industry.terminology.slice(0, 3).join(', ')}`,
        action: 'add_industry_terms',
      });
    }

    return recommendations;
  }

  // Helper methods

  extractSection(text, keywords) {
    const sections = text.split(/\n\n+/);
    return sections.find(section => 
      keywords.some(keyword => section.includes(keyword))
    ) || '';
  }

  detectTechnicalSkills(text) {
    const skills = [
      // Programming languages
      'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'typescript',
      'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
      // Frameworks
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'rails', 'laravel', '.net', 'asp.net',
      // Databases
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra', 'dynamodb',
      // Cloud
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
      // Other
      'git', 'api', 'rest', 'graphql', 'microservices', 'ci/cd', 'agile', 'scrum',
    ];

    return skills.filter(skill => text.includes(skill));
  }

  detectSoftSkills(text) {
    const skills = [
      'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
      'creativity', 'adaptability', 'time management', 'collaboration', 'analytical',
    ];

    return skills.filter(skill => text.includes(skill));
  }

  detectTools(text) {
    const tools = [
      'jira', 'confluence', 'slack', 'github', 'gitlab', 'bitbucket',
      'jenkins', 'travis', 'circleci', 'figma', 'sketch', 'adobe xd',
    ];

    return tools.filter(tool => text.includes(tool));
  }

  detectCertifications(text) {
    const certs = [
      'aws certified', 'azure certified', 'pmp', 'scrum master', 'cissp',
      'cisa', 'comptia', 'ccna', 'mcsa',
    ];

    return certs.filter(cert => text.includes(cert));
  }

  createSkillPriorityOrder(skills, text) {
    // Combine all skills and sort by importance and frequency
    const allSkills = [
      ...skills.technical.map(s => ({ ...s, type: 'technical' })),
      ...skills.soft.map(s => ({ ...s, type: 'soft', frequency: this.countOccurrences(text, s.name) })),
    ];

    return allSkills
      .sort((a, b) => {
        if (a.importance === 'required' && b.importance !== 'required') return -1;
        if (a.importance !== 'required' && b.importance === 'required') return 1;
        return b.frequency - a.frequency;
      })
      .slice(0, 20)
      .map(s => s.name);
  }

  getSkillContext(text, skill) {
    const skillLower = skill.toLowerCase();
    const sentences = text.split(/[.!?]+/);
    const contextSentences = sentences.filter(s => s.includes(skillLower));
    return contextSentences.slice(0, 2);
  }

  detectCompanyValues(text) {
    const valueKeywords = {
      innovation: ['innovate', 'innovation', 'cutting-edge', 'pioneer'],
      integrity: ['integrity', 'honest', 'ethical', 'transparent'],
      excellence: ['excellence', 'quality', 'best-in-class', 'world-class'],
      diversity: ['diversity', 'inclusion', 'equal opportunity', 'diverse'],
      customer: ['customer-centric', 'customer-first', 'user-focused'],
    };

    const detectedValues = [];
    Object.entries(valueKeywords).forEach(([value, keywords]) => {
      if (keywords.some(k => text.includes(k))) {
        detectedValues.push(value);
      }
    });

    return detectedValues;
  }

  detectPerks(text) {
    const perkKeywords = [
      'remote', 'work from home', 'flexible hours', 'unlimited pto', 'equity',
      'stock options', '401k', 'health insurance', 'dental', 'vision',
      'gym membership', 'learning budget', 'conference', 'professional development',
    ];

    return perkKeywords.filter(perk => text.includes(perk));
  }

  determineCultureType(traits) {
    const maxTrait = Object.entries(traits)
      .sort((a, b) => b[1] - a[1])[0];

    const types = {
      innovation: 'innovative',
      fastPaced: 'fast-paced',
      collaboration: 'collaborative',
      traditional: 'traditional',
      workLifeBalance: 'balanced',
    };

    return types[maxTrait[0]] || 'professional';
  }

  extractCultureKeywords(text) {
    const allKeywords = Object.values(this.cultureKeywords).flat();
    return allKeywords.filter(keyword => text.includes(keyword));
  }

  detectTone(text) {
    const casualScore = this.assessFormality(text).score;
    if (casualScore < 40) return 'casual';
    if (casualScore < 60) return 'professional';
    return 'formal';
  }

  extractIndustryTerminology(text) {
    // This would be more sophisticated in production
    return [];
  }

  getFormalityLevel(score) {
    if (score < 30) return 'very casual';
    if (score < 50) return 'casual';
    if (score < 70) return 'professional';
    return 'formal';
  }

  getRecommendedTone(formalityScore) {
    if (formalityScore > 70) return 'Match formal tone with professional language';
    if (formalityScore < 40) return 'Use conversational tone with personality';
    return 'Balance professional and approachable tone';
  }

  splitIntoSections(text) {
    // Simple section splitting logic
    return {
      required: [],
      preferred: [],
    };
  }

  countOccurrences(text, term) {
    const regex = new RegExp(term, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  isTechnicalKeyword(word) {
    return this.skillKeywords.technical.includes(word);
  }

  isIndustryKeyword(word) {
    return this.industryTerms.includes(word);
  }

  extractActionVerbs(text) {
    const actionVerbs = [
      'lead', 'manage', 'develop', 'create', 'design', 'implement', 'build',
      'improve', 'optimize', 'analyze', 'coordinate', 'drive', 'deliver',
    ];

    return actionVerbs.filter(verb => text.includes(verb));
  }

  getEmphasisRecommendation(primaryEmphasis) {
    const recommendations = {
      technical: 'Highlight technical expertise and architecture skills',
      leadership: 'Emphasize management experience and team leadership',
      collaboration: 'Showcase cross-functional collaboration and communication',
      innovation: 'Feature innovative projects and creative solutions',
      impact: 'Quantify business impact and measurable results',
      growth: 'Demonstrate ability to scale systems and grow teams',
    };

    return recommendations[primaryEmphasis] || 'Tailor resume to job requirements';
  }

  // Load keyword databases (would be loaded from external files in production)
  
  loadSkillKeywords() {
    return {
      technical: [
        'javascript', 'python', 'java', 'react', 'node.js', 'aws', 'sql',
      ],
      soft: [
        'leadership', 'communication', 'teamwork', 'problem solving',
      ],
    };
  }

  loadCultureKeywords() {
    return {
      innovation: ['innovate', 'innovation', 'creative', 'cutting-edge', 'pioneer'],
      collaboration: ['collaborate', 'teamwork', 'cross-functional', 'together'],
      fastPaced: ['fast-paced', 'agile', 'dynamic', 'rapid', 'quick'],
      workLifeBalance: ['work-life balance', 'flexible', 'remote', 'wellness'],
      diversity: ['diversity', 'inclusion', 'equal opportunity', 'diverse'],
      growth: ['growth', 'learning', 'development', 'career path'],
      autonomy: ['autonomy', 'independent', 'self-directed', 'ownership'],
      traditional: ['established', 'stable', 'proven', 'reliable'],
    };
  }

  loadIndustryTerms() {
    return ['saas', 'fintech', 'ecommerce', 'blockchain', 'iot', 'ar', 'vr'];
  }

  loadFormalityIndicators() {
    return {
      formal: ['pursuant', 'shall', 'aforementioned', 'herein'],
      casual: ['awesome', 'cool', 'fun', 'rockstar'],
    };
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobDescriptionAnalyzer;
}
