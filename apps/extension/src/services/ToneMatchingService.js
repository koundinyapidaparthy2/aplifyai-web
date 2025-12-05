/**
 * ToneMatchingService
 * 
 * Intelligent tone detection and matching for cover letters.
 * 
 * Features:
 * - Detect company tone from multiple sources
 * - Analyze formality level
 * - Detect communication style
 * - Provide tone adjustment recommendations
 * - Score tone match
 * 
 * Tone Dimensions:
 * - Formality: casual, professional, formal
 * - Energy: calm, balanced, energetic
 * - Style: conversational, business, technical
 * - Personality: friendly, neutral, authoritative
 */

class ToneMatchingService {
  constructor() {
    this.toneIndicators = {
      casual: {
        words: ['awesome', 'cool', 'love', 'excited', 'fun', 'hey', 'folks', 'team', 'yeah'],
        patterns: ['contractions', 'exclamation marks', 'emojis', 'informal greetings'],
        score: 0
      },
      professional: {
        words: ['please', 'thank you', 'appreciate', 'opportunity', 'consider', 'experience'],
        patterns: ['balanced tone', 'clear structure', 'moderate formality'],
        score: 1
      },
      formal: {
        words: ['pursuant', 'hereby', 'aforementioned', 'endeavor', 'cordially', 'esteemed'],
        patterns: ['no contractions', 'passive voice', 'complex sentences', 'technical jargon'],
        score: 2
      }
    };
  }

  /**
   * Detect company tone from research
   * @param {Object} companyResearch - Research results
   * @param {Object} jobAnalysis - Job analysis
   * @returns {Object} Tone analysis
   */
  detectCompanyTone(companyResearch, jobAnalysis) {
    console.log(`[ToneMatching] Detecting tone for ${companyResearch.companyName}`);

    const sources = {
      website: companyResearch.homepage || {},
      about: companyResearch.about || {},
      careers: companyResearch.careers || {},
      news: companyResearch.news || {},
      culture: companyResearch.culture || {},
      jobDescription: jobAnalysis || {}
    };

    // Analyze each source
    const analyses = {
      website: this.analyzeToneFromText(sources.website.description || ''),
      about: this.analyzeToneFromText(sources.about.mission || ''),
      careers: this.analyzeToneFromText(JSON.stringify(sources.careers)),
      news: sources.news.items ? this.analyzeToneFromText(sources.news.items[0]?.snippet || '') : null,
      culture: this.analyzeCultureTone(sources.culture),
      jobDescription: this.analyzeToneFromText(sources.jobDescription.description || '')
    };

    // Aggregate results
    const aggregated = this.aggregateToneAnalyses(analyses);

    return {
      primary: aggregated.primary,
      secondary: aggregated.secondary,
      formality: aggregated.formality,
      energy: aggregated.energy,
      style: aggregated.style,
      personality: aggregated.personality,
      confidence: aggregated.confidence,
      sources: analyses,
      recommendations: this.generateToneRecommendations(aggregated),
      examples: this.generateToneExamples(aggregated)
    };
  }

  /**
   * Analyze tone from text
   * @param {string} text - Text to analyze
   * @returns {Object} Tone analysis
   */
  analyzeToneFromText(text) {
    if (!text || text.length < 20) {
      return { formality: 'professional', confidence: 0.3 };
    }

    const textLower = text.toLowerCase();
    const scores = {
      casual: 0,
      professional: 0,
      formal: 0
    };

    // Count indicator words
    for (const [tone, indicators] of Object.entries(this.toneIndicators)) {
      for (const word of indicators.words) {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = textLower.match(regex);
        if (matches) {
          scores[tone] += matches.length;
        }
      }
    }

    // Check for contractions (casual indicator)
    const contractions = text.match(/\b\w+'\w+\b/g);
    if (contractions && contractions.length > 0) {
      scores.casual += contractions.length * 0.5;
    }

    // Check for exclamation marks (energetic/casual indicator)
    const exclamations = text.match(/!/g);
    if (exclamations && exclamations.length > 0) {
      scores.casual += exclamations.length * 0.3;
    }

    // Check sentence length (longer = more formal)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    if (avgSentenceLength > 25) {
      scores.formal += 2;
    } else if (avgSentenceLength < 15) {
      scores.casual += 1;
    }

    // Determine primary tone
    const maxScore = Math.max(...Object.values(scores));
    const primary = Object.keys(scores).find(k => scores[k] === maxScore) || 'professional';

    // Calculate confidence
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.5;

    return {
      formality: primary,
      scores: scores,
      confidence: Math.min(confidence, 1.0),
      metrics: {
        avgSentenceLength,
        contractions: contractions ? contractions.length : 0,
        exclamations: exclamations ? exclamations.length : 0
      }
    };
  }

  /**
   * Analyze culture tone
   * @param {Object} culture - Culture data
   * @returns {Object} Tone analysis
   */
  analyzeCultureTone(culture) {
    if (!culture || !culture.tone) {
      return { formality: 'professional', confidence: 0.3 };
    }

    // Direct tone from culture analysis
    return {
      formality: culture.tone,
      confidence: culture.confidence || 0.7,
      traits: culture.scores || {}
    };
  }

  /**
   * Aggregate tone analyses
   * @param {Object} analyses - Individual analyses
   * @returns {Object} Aggregated tone
   */
  aggregateToneAnalyses(analyses) {
    const weights = {
      culture: 0.3,
      careers: 0.25,
      jobDescription: 0.2,
      website: 0.15,
      about: 0.1
    };

    const scores = {
      casual: 0,
      professional: 0,
      formal: 0
    };

    // Weighted aggregation
    for (const [source, analysis] of Object.entries(analyses)) {
      if (!analysis || !analysis.formality) continue;

      const weight = weights[source] || 0.05;
      const confidence = analysis.confidence || 0.5;

      scores[analysis.formality] += weight * confidence;
    }

    // Determine primary and secondary tones
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a);

    const primary = sorted[0][0];
    const secondary = sorted[1][0];

    // Determine other dimensions
    const energy = this.determineEnergy(analyses);
    const style = this.determineStyle(analyses);
    const personality = this.determinePersonality(analyses);

    // Calculate overall confidence
    const maxScore = sorted[0][1];
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.5;

    return {
      primary,
      secondary,
      formality: this.mapToFormalityLevel(primary),
      energy,
      style,
      personality,
      confidence,
      scores
    };
  }

  /**
   * Determine energy level
   * @param {Object} analyses - Tone analyses
   * @returns {string} Energy level
   */
  determineEnergy(analyses) {
    let energyScore = 0;
    let count = 0;

    for (const analysis of Object.values(analyses)) {
      if (!analysis || !analysis.metrics) continue;

      if (analysis.metrics.exclamations > 0) energyScore += 2;
      if (analysis.formality === 'casual') energyScore += 1;
      count++;
    }

    const avgEnergy = count > 0 ? energyScore / count : 1;

    if (avgEnergy > 1.5) return 'energetic';
    if (avgEnergy < 0.5) return 'calm';
    return 'balanced';
  }

  /**
   * Determine communication style
   * @param {Object} analyses - Tone analyses
   * @returns {string} Style
   */
  determineStyle(analyses) {
    // Check for technical language
    const hasTechnical = Object.values(analyses).some(a => 
      a && a.formality === 'formal'
    );

    // Check for conversational style
    const hasConversational = Object.values(analyses).some(a =>
      a && a.formality === 'casual'
    );

    if (hasTechnical) return 'technical';
    if (hasConversational) return 'conversational';
    return 'business';
  }

  /**
   * Determine personality
   * @param {Object} analyses - Tone analyses
   * @returns {string} Personality
   */
  determinePersonality(analyses) {
    // Check for friendly indicators
    const hasFriendly = Object.values(analyses).some(a =>
      a && (a.formality === 'casual' || (a.metrics && a.metrics.exclamations > 0))
    );

    // Check for authoritative indicators
    const hasAuthoritative = Object.values(analyses).some(a =>
      a && a.formality === 'formal'
    );

    if (hasFriendly) return 'friendly';
    if (hasAuthoritative) return 'authoritative';
    return 'neutral';
  }

  /**
   * Map tone to formality level
   * @param {string} tone - Tone
   * @returns {number} Formality level 0-100
   */
  mapToFormalityLevel(tone) {
    const mapping = {
      casual: 30,
      professional: 60,
      formal: 90
    };
    return mapping[tone] || 60;
  }

  /**
   * Adjust cover letter tone
   * @param {string} coverLetter - Cover letter text
   * @param {Object} targetTone - Target tone
   * @returns {Object} Adjusted cover letter
   */
  adjustCoverLetterTone(coverLetter, targetTone) {
    console.log(`[ToneMatching] Adjusting to ${targetTone.primary} tone`);

    let adjusted = coverLetter;
    const changes = [];

    switch (targetTone.primary) {
      case 'casual':
        const casualChanges = this.makeCasual(adjusted);
        adjusted = casualChanges.text;
        changes.push(...casualChanges.changes);
        break;

      case 'formal':
        const formalChanges = this.makeFormal(adjusted);
        adjusted = formalChanges.text;
        changes.push(...formalChanges.changes);
        break;

      case 'professional':
      default:
        const professionalChanges = this.makeProfessional(adjusted);
        adjusted = professionalChanges.text;
        changes.push(...professionalChanges.changes);
        break;
    }

    return {
      original: coverLetter,
      adjusted: adjusted,
      targetTone: targetTone.primary,
      changes: changes,
      matchScore: this.calculateToneMatch(adjusted, targetTone)
    };
  }

  /**
   * Make text more casual
   * @param {string} text - Text to adjust
   * @returns {Object} Adjusted text and changes
   */
  makeCasual(text) {
    const changes = [];
    let adjusted = text;

    // Add contractions
    const contractionMap = {
      'I am': "I'm",
      'I would': "I'd",
      'I will': "I'll",
      'I have': "I've",
      'do not': "don't",
      'cannot': "can't",
      'will not': "won't"
    };

    for (const [formal, casual] of Object.entries(contractionMap)) {
      if (adjusted.includes(formal)) {
        adjusted = adjusted.replace(new RegExp(formal, 'g'), casual);
        changes.push({ type: 'contraction', from: formal, to: casual });
      }
    }

    // Replace formal words with casual alternatives
    const wordReplacements = {
      'utilize': 'use',
      'endeavor': 'try',
      'commence': 'start',
      'terminate': 'end',
      'assist': 'help',
      'obtain': 'get'
    };

    for (const [formal, casual] of Object.entries(wordReplacements)) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      if (regex.test(adjusted)) {
        adjusted = adjusted.replace(regex, casual);
        changes.push({ type: 'vocabulary', from: formal, to: casual });
      }
    }

    return { text: adjusted, changes };
  }

  /**
   * Make text more formal
   * @param {string} text - Text to adjust
   * @returns {Object} Adjusted text and changes
   */
  makeFormal(text) {
    const changes = [];
    let adjusted = text;

    // Remove contractions
    const expansionMap = {
      "I'm": 'I am',
      "I'd": 'I would',
      "I'll": 'I will',
      "I've": 'I have',
      "don't": 'do not',
      "can't": 'cannot',
      "won't": 'will not',
      "it's": 'it is'
    };

    for (const [contraction, expansion] of Object.entries(expansionMap)) {
      if (adjusted.includes(contraction)) {
        adjusted = adjusted.replace(new RegExp(contraction, 'g'), expansion);
        changes.push({ type: 'expansion', from: contraction, to: expansion });
      }
    }

    // Replace casual words with formal alternatives
    const wordReplacements = {
      'use': 'utilize',
      'try': 'endeavor',
      'start': 'commence',
      'end': 'conclude',
      'help': 'assist',
      'get': 'obtain',
      'show': 'demonstrate'
    };

    for (const [casual, formal] of Object.entries(wordReplacements)) {
      const regex = new RegExp(`\\b${casual}\\b`, 'gi');
      if (regex.test(adjusted)) {
        adjusted = adjusted.replace(regex, formal);
        changes.push({ type: 'vocabulary', from: casual, to: formal });
      }
    }

    // Remove exclamation marks
    if (adjusted.includes('!')) {
      adjusted = adjusted.replace(/!/g, '.');
      changes.push({ type: 'punctuation', from: '!', to: '.' });
    }

    return { text: adjusted, changes };
  }

  /**
   * Make text professional (balanced)
   * @param {string} text - Text to adjust
   * @returns {Object} Adjusted text and changes
   */
  makeProfessional(text) {
    const changes = [];
    let adjusted = text;

    // Allow some contractions but not all
    const allowedContractions = ["I'm", "I've", "I'll"];
    const disallowedContractions = ["don't", "can't", "won't"];

    for (const contraction of disallowedContractions) {
      if (adjusted.includes(contraction)) {
        const expansion = {
          "don't": 'do not',
          "can't": 'cannot',
          "won't": 'will not'
        }[contraction];
        
        adjusted = adjusted.replace(new RegExp(contraction, 'g'), expansion);
        changes.push({ type: 'professionalize', from: contraction, to: expansion });
      }
    }

    // Replace overly casual language
    const replacements = {
      'awesome': 'excellent',
      'cool': 'interesting',
      'super': 'very',
      'tons of': 'extensive',
      'a lot of': 'considerable'
    };

    for (const [casual, professional] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${casual}\\b`, 'gi');
      if (regex.test(adjusted)) {
        adjusted = adjusted.replace(regex, professional);
        changes.push({ type: 'vocabulary', from: casual, to: professional });
      }
    }

    return { text: adjusted, changes };
  }

  /**
   * Calculate tone match score
   * @param {string} text - Cover letter text
   * @param {Object} targetTone - Target tone
   * @returns {number} Match score 0-100
   */
  calculateToneMatch(text, targetTone) {
    const analysis = this.analyzeToneFromText(text);
    
    // Compare formality
    const formalityMatch = analysis.formality === targetTone.primary ? 1.0 : 0.5;
    
    // Compare metrics
    let metricsMatch = 0.7; // Default

    if (targetTone.primary === 'casual') {
      metricsMatch = (analysis.metrics.contractions > 0 ? 0.5 : 0) +
                     (analysis.metrics.exclamations > 0 ? 0.3 : 0) +
                     (analysis.metrics.avgSentenceLength < 20 ? 0.2 : 0);
    } else if (targetTone.primary === 'formal') {
      metricsMatch = (analysis.metrics.contractions === 0 ? 0.5 : 0) +
                     (analysis.metrics.exclamations === 0 ? 0.3 : 0) +
                     (analysis.metrics.avgSentenceLength > 20 ? 0.2 : 0);
    }

    const score = (formalityMatch * 0.6 + metricsMatch * 0.4) * 100;
    return Math.round(score);
  }

  /**
   * Generate tone recommendations
   * @param {Object} tone - Tone analysis
   * @returns {Array} Recommendations
   */
  generateToneRecommendations(tone) {
    const recommendations = [];

    recommendations.push({
      category: 'formality',
      suggestion: `Use ${tone.primary} tone throughout your cover letter`,
      examples: this.getToneExamples(tone.primary)
    });

    if (tone.energy === 'energetic') {
      recommendations.push({
        category: 'energy',
        suggestion: 'Match the company\'s energetic culture with enthusiastic language',
        examples: ['I\'m excited about...', 'I\'m thrilled to...', 'I can\'t wait to...']
      });
    }

    if (tone.style === 'conversational') {
      recommendations.push({
        category: 'style',
        suggestion: 'Use a conversational writing style',
        examples: ['I believe...', 'In my experience...', 'What draws me to...']
      });
    }

    return recommendations;
  }

  /**
   * Get tone examples
   * @param {string} tone - Tone type
   * @returns {Array} Examples
   */
  getToneExamples(tone) {
    const examples = {
      casual: [
        "I'm super excited about this opportunity",
        "I'd love to chat about how I can contribute",
        "Your company's mission really resonates with me"
      ],
      professional: [
        "I am excited about this opportunity",
        "I would welcome the chance to discuss my qualifications",
        "Your company's mission aligns with my professional values"
      ],
      formal: [
        "I am writing to express my interest in this position",
        "I would be honored to discuss my qualifications further",
        "Your organization's mission statement aligns with my professional objectives"
      ]
    };

    return examples[tone] || examples.professional;
  }

  /**
   * Generate tone examples for guidance
   * @param {Object} tone - Tone analysis
   * @returns {Object} Examples
   */
  generateToneExamples(tone) {
    return {
      opening: this.getToneExamples(tone.primary),
      vocabulary: this.getVocabularyExamples(tone.primary),
      punctuation: this.getPunctuationExamples(tone.primary)
    };
  }

  /**
   * Get vocabulary examples
   * @param {string} tone - Tone type
   * @returns {Object} Examples
   */
  getVocabularyExamples(tone) {
    const examples = {
      casual: {
        good: ['use', 'help', 'start', 'get', 'show'],
        avoid: ['utilize', 'assist', 'commence', 'obtain', 'demonstrate']
      },
      professional: {
        good: ['experienced', 'qualified', 'proficient', 'accomplished'],
        avoid: ['awesome', 'super', 'tons of', 'a lot']
      },
      formal: {
        good: ['utilize', 'demonstrate', 'endeavor', 'facilitate'],
        avoid: ['use', 'show', 'try', 'help']
      }
    };

    return examples[tone] || examples.professional;
  }

  /**
   * Get punctuation examples
   * @param {string} tone - Tone type
   * @returns {Object} Examples
   */
  getPunctuationExamples(tone) {
    return {
      casual: {
        exclamations: 'Acceptable',
        contractions: 'Encouraged',
        emDashes: 'Acceptable'
      },
      professional: {
        exclamations: 'Use sparingly',
        contractions: 'Some acceptable',
        emDashes: 'Use appropriately'
      },
      formal: {
        exclamations: 'Avoid',
        contractions: 'Avoid',
        emDashes: 'Use judiciously'
      }
    }[tone];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToneMatchingService;
}
