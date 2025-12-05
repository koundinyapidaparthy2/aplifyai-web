/**
 * AIAnswerManager - Orchestrate AI-powered answer generation
 * 
 * Coordinates:
 * - Question detection via QuestionDetector
 * - Answer generation via GeminiService
 * - Answer caching via AnswerCache
 * - Form filling via FormFiller
 * - User review workflow
 */

class AIAnswerManager {
  constructor(apiKey) {
    this.questionDetector = new QuestionDetector();
    this.geminiService = new GeminiService(apiKey);
    this.answerCache = new AnswerCache();
    this.formFiller = null; // Will be set if FormFiller is available
    
    this.currentQuestions = [];
    this.generatedAnswers = new Map(); // questionId -> answer
    this.isGenerating = false;
  }

  /**
   * Initialize manager and detect questions on page
   * @returns {Promise<Object>} Detection result
   */
  async initialize() {
    try {
      // Detect questions on page
      this.currentQuestions = this.questionDetector.detectAllQuestions();
      
      // Get statistics
      const stats = this.questionDetector.getStatistics(this.currentQuestions);
      
      return {
        success: true,
        questionCount: this.currentQuestions.length,
        statistics: stats,
        questions: this.currentQuestions
      };
    } catch (error) {
      console.error('Error initializing AI Answer Manager:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get preview of detected questions with cached suggestions
   * @returns {Promise<Array>} Preview data
   */
  async getQuestionsPreview() {
    const preview = [];

    for (const question of this.currentQuestions) {
      // Check cache for similar answers
      const cachedAnswers = await this.answerCache.findAnswers(
        question.questionText,
        question.type,
        { limit: 3, threshold: 0.8 }
      );

      preview.push({
        id: question.id,
        text: question.questionText,
        type: question.type,
        isRequired: question.isRequired,
        maxLength: question.maxLength,
        currentValue: question.currentValue,
        hasCachedAnswers: cachedAnswers.length > 0,
        cachedAnswers: cachedAnswers.slice(0, 3), // Top 3 matches
        requiresResearch: question.requiresResearch,
        requiresResume: question.requiresResume,
        format: question.format
      });
    }

    return preview;
  }

  /**
   * Generate answers for all detected questions
   * @param {Object} userProfile - User profile with resume data
   * @param {Object} jobData - Job description and company info
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation result
   */
  async generateAllAnswers(userProfile, jobData, options = {}) {
    if (this.isGenerating) {
      throw new Error('Generation already in progress');
    }

    this.isGenerating = true;
    const results = {
      answers: [],
      errors: [],
      fromCache: [],
      generated: []
    };

    try {
      for (const question of this.currentQuestions) {
        try {
          // Skip if already has value and skipFilled option is set
          if (options.skipFilled && question.currentValue) {
            continue;
          }

          // Check cache first if useCached option is set
          if (options.useCached !== false) {
            const cachedAnswers = await this.answerCache.findAnswers(
              question.questionText,
              question.type,
              { limit: 1, threshold: 0.85 }
            );

            if (cachedAnswers.length > 0) {
              const cached = cachedAnswers[0];
              const answer = {
                questionId: question.id,
                questionText: question.questionText,
                questionType: question.type,
                answer: cached.answer,
                fromCache: true,
                cacheId: cached.id,
                similarity: cached.similarity,
                generatedAt: new Date().toISOString()
              };

              this.generatedAnswers.set(question.id, answer);
              results.answers.push(answer);
              results.fromCache.push(answer);

              // Record usage
              await this.answerCache.recordUsage(cached.id);
              continue;
            }
          }

          // Generate new answer
          const answer = await this.geminiService.generateAnswer(
            question,
            userProfile,
            jobData,
            options
          );

          answer.fromCache = false;
          this.generatedAnswers.set(question.id, answer);
          results.answers.push(answer);
          results.generated.push(answer);

          // Progress callback
          if (options.onProgress) {
            options.onProgress({
              current: results.answers.length,
              total: this.currentQuestions.length,
              question: question.questionText
            });
          }

        } catch (error) {
          console.error(`Error generating answer for question ${question.id}:`, error);
          results.errors.push({
            questionId: question.id,
            questionText: question.questionText,
            error: error.message
          });
        }
      }
    } finally {
      this.isGenerating = false;
    }

    return results;
  }

  /**
   * Generate answer for a single question
   * @param {string} questionId - Question ID
   * @param {Object} userProfile - User profile
   * @param {Object} jobData - Job data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Generated answer
   */
  async generateSingleAnswer(questionId, userProfile, jobData, options = {}) {
    const question = this.currentQuestions.find(q => q.id === questionId);
    
    if (!question) {
      throw new Error('Question not found');
    }

    // Check cache first
    if (options.useCached !== false) {
      const cachedAnswers = await this.answerCache.findAnswers(
        question.questionText,
        question.type,
        { limit: 1, threshold: 0.85 }
      );

      if (cachedAnswers.length > 0) {
        const cached = cachedAnswers[0];
        const answer = {
          questionId: question.id,
          questionText: question.questionText,
          questionType: question.type,
          answer: cached.answer,
          fromCache: true,
          cacheId: cached.id,
          similarity: cached.similarity,
          generatedAt: new Date().toISOString()
        };

        this.generatedAnswers.set(question.id, answer);
        await this.answerCache.recordUsage(cached.id);
        return answer;
      }
    }

    // Generate new answer
    const answer = await this.geminiService.generateAnswer(
      question,
      userProfile,
      jobData,
      options
    );

    answer.fromCache = false;
    this.generatedAnswers.set(question.id, answer);
    return answer;
  }

  /**
   * Regenerate answer with different parameters
   * @param {string} questionId - Question ID
   * @param {Object} userProfile - User profile
   * @param {Object} jobData - Job data
   * @param {Object} options - Options (e.g., different temperature)
   * @returns {Promise<Object>} New answer
   */
  async regenerateAnswer(questionId, userProfile, jobData, options = {}) {
    options.useCached = false; // Force new generation
    return this.generateSingleAnswer(questionId, userProfile, jobData, options);
  }

  /**
   * Update a generated answer (user edited)
   * @param {string} questionId - Question ID
   * @param {string} newAnswer - Updated answer text
   * @returns {boolean} Success status
   */
  updateAnswer(questionId, newAnswer) {
    const answer = this.generatedAnswers.get(questionId);
    if (!answer) return false;

    answer.answer = newAnswer;
    answer.userEdited = true;
    answer.editedAt = new Date().toISOString();
    
    return true;
  }

  /**
   * Save answer to cache for future reuse
   * @param {string} questionId - Question ID
   * @param {number} rating - Optional rating (1-5)
   * @param {Object} jobContext - Optional job context
   * @returns {Promise<boolean>} Success status
   */
  async saveAnswerToCache(questionId, rating = null, jobContext = null) {
    const answer = this.generatedAnswers.get(questionId);
    if (!answer) return false;

    // Don't save cached answers again
    if (answer.fromCache) return false;

    const cacheData = {
      questionText: answer.questionText,
      questionType: answer.questionType,
      answer: answer.answer,
      rating: rating,
      jobContext: jobContext,
      metadata: {
        originallyGenerated: answer.generatedAt,
        userEdited: answer.userEdited || false,
        tokenCount: answer.tokenCount,
        confidence: answer.confidence
      }
    };

    return this.answerCache.saveAnswer(cacheData);
  }

  /**
   * Fill answers into form fields
   * @param {Object} options - Fill options
   * @returns {Promise<Object>} Fill result
   */
  async fillAnswers(options = {}) {
    const results = {
      filled: [],
      skipped: [],
      errors: []
    };

    for (const question of this.currentQuestions) {
      try {
        const answer = this.generatedAnswers.get(question.id);
        
        if (!answer) {
          results.skipped.push({
            questionId: question.id,
            reason: 'No answer generated'
          });
          continue;
        }

        // Skip if question already has value and skipFilled is true
        if (options.skipFilled && question.currentValue) {
          results.skipped.push({
            questionId: question.id,
            reason: 'Already filled'
          });
          continue;
        }

        // Fill the field
        await this.fillField(question.element, answer.answer, options);
        
        results.filled.push({
          questionId: question.id,
          questionText: question.questionText,
          answerLength: answer.answer.length
        });

        // Delay between fills
        if (options.delay) {
          await this.sleep(options.delay);
        }

      } catch (error) {
        console.error(`Error filling question ${question.id}:`, error);
        results.errors.push({
          questionId: question.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Fill a single field with answer
   * @param {HTMLElement} element - Field element
   * @param {string} value - Answer text
   * @param {Object} options - Options
   * @returns {Promise<void>}
   */
  async fillField(element, value, options = {}) {
    // If FormFiller is available, use it for better simulation
    if (this.formFiller) {
      return this.formFiller.fillTextarea(element, value);
    }

    // Otherwise, use simple filling
    element.focus();
    
    if (options.simulateTyping) {
      // Type character by character
      element.value = '';
      for (const char of value) {
        element.value += char;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await this.sleep(50); // 50ms per character
      }
    } else {
      element.value = value;
    }

    // Trigger change events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
  }

  /**
   * Get all generated answers
   * @returns {Array} Array of answer objects
   */
  getAllAnswers() {
    return Array.from(this.generatedAnswers.values());
  }

  /**
   * Get answer by question ID
   * @param {string} questionId - Question ID
   * @returns {Object|null} Answer object or null
   */
  getAnswer(questionId) {
    return this.generatedAnswers.get(questionId) || null;
  }

  /**
   * Clear all generated answers
   */
  clearAnswers() {
    this.generatedAnswers.clear();
  }

  /**
   * Get generation statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    const answers = this.getAllAnswers();
    
    const stats = {
      totalQuestions: this.currentQuestions.length,
      totalAnswers: answers.length,
      fromCache: answers.filter(a => a.fromCache).length,
      generated: answers.filter(a => !a.fromCache).length,
      userEdited: answers.filter(a => a.userEdited).length,
      byType: {},
      totalTokens: 0,
      averageConfidence: 0
    };

    let confidenceSum = 0;
    answers.forEach(answer => {
      // Count by type
      stats.byType[answer.questionType] = (stats.byType[answer.questionType] || 0) + 1;
      
      // Sum tokens
      if (answer.tokenCount) {
        stats.totalTokens += answer.tokenCount;
      }
      
      // Sum confidence
      if (answer.confidence) {
        confidenceSum += answer.confidence;
      }
    });

    stats.averageConfidence = answers.length > 0 ? confidenceSum / answers.length : 0;

    return stats;
  }

  /**
   * Validate user profile completeness
   * @param {Object} userProfile - User profile
   * @param {Array} questions - Questions to check
   * @returns {Object} Validation result
   */
  validateProfile(userProfile, questions = null) {
    const questionsToCheck = questions || this.currentQuestions;
    const missing = [];

    const requiredFields = {
      basic: ['firstName', 'lastName', 'email'],
      resume: ['yearsOfExperience', 'skills', 'experienceSummary'],
      education: ['educationLevel', 'university']
    };

    // Check if any questions require resume data
    const needsResume = questionsToCheck.some(q => q.requiresResume);
    
    // Check basic fields
    requiredFields.basic.forEach(field => {
      if (!userProfile[field]) {
        missing.push(field);
      }
    });

    // Check resume fields if needed
    if (needsResume) {
      requiredFields.resume.forEach(field => {
        if (!userProfile[field] || (Array.isArray(userProfile[field]) && userProfile[field].length === 0)) {
          missing.push(field);
        }
      });
    }

    return {
      isComplete: missing.length === 0,
      missing: missing,
      recommendations: this.getProfileRecommendations(missing)
    };
  }

  /**
   * Get recommendations for profile improvement
   * @param {Array} missingFields - Missing fields
   * @returns {Array} Recommendations
   */
  getProfileRecommendations(missingFields) {
    const recommendations = [];

    if (missingFields.includes('experienceSummary')) {
      recommendations.push('Add a brief summary of your work experience for better answers');
    }
    if (missingFields.includes('skills')) {
      recommendations.push('List your key skills to highlight strengths effectively');
    }
    if (missingFields.includes('yearsOfExperience')) {
      recommendations.push('Specify years of experience for accurate positioning');
    }

    return recommendations;
  }

  /**
   * Export answers to JSON
   * @returns {string} JSON string
   */
  exportAnswers() {
    const data = {
      questions: this.currentQuestions.map(q => ({
        id: q.id,
        text: q.questionText,
        type: q.type,
        isRequired: q.isRequired
      })),
      answers: this.getAllAnswers(),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set FormFiller instance for better field filling
   * @param {Object} formFiller - FormFiller instance
   */
  setFormFiller(formFiller) {
    this.formFiller = formFiller;
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIAnswerManager;
}
