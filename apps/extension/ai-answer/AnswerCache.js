/**
 * AnswerCache - Store and retrieve previously used answers
 * 
 * Features:
 * - Save good answers for reuse
 * - Fuzzy match similar questions
 * - CRUD operations via Chrome storage
 * - Export/import answer library
 * - Analytics on answer usage
 */

class AnswerCache {
  constructor() {
    this.storageKey = 'aiAnswerCache';
    this.maxCacheSize = 100; // Store up to 100 answers
    this.similarityThreshold = 0.7; // For fuzzy matching
  }

  /**
   * Initialize cache from Chrome storage
   * @returns {Promise<Array>} Cached answers
   */
  async initialize() {
    try {
      const result = await chrome.storage.local.get(this.storageKey);
      const cache = result[this.storageKey] || [];
      return cache;
    } catch (error) {
      console.error('Error initializing answer cache:', error);
      return [];
    }
  }

  /**
   * Save an answer to cache
   * @param {Object} answerData - Answer object with metadata
   * @returns {Promise<boolean>} Success status
   */
  async saveAnswer(answerData) {
    try {
      const cache = await this.initialize();

      // Create cache entry
      const entry = {
        id: this.generateId(),
        questionText: answerData.questionText,
        questionType: answerData.questionType,
        answer: answerData.answer,
        keywords: this.extractKeywords(answerData.questionText),
        savedAt: new Date().toISOString(),
        usageCount: 0,
        lastUsed: null,
        rating: answerData.rating || null,
        jobContext: answerData.jobContext || null,
        metadata: answerData.metadata || {}
      };

      // Add to cache
      cache.unshift(entry); // Add to beginning

      // Enforce size limit
      if (cache.length > this.maxCacheSize) {
        cache.pop(); // Remove oldest
      }

      // Save to storage
      await chrome.storage.local.set({ [this.storageKey]: cache });
      return true;
    } catch (error) {
      console.error('Error saving answer:', error);
      return false;
    }
  }

  /**
   * Find cached answers for a question
   * @param {string} questionText - The question text
   * @param {string} questionType - Question type
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching cached answers
   */
  async findAnswers(questionText, questionType, options = {}) {
    try {
      const cache = await this.initialize();
      const matches = [];

      for (const entry of cache) {
        // Exact type match (if type is known)
        if (questionType && entry.questionType !== questionType) {
          continue;
        }

        // Calculate similarity
        const similarity = this.calculateSimilarity(questionText, entry.questionText);
        
        if (similarity >= (options.threshold || this.similarityThreshold)) {
          matches.push({
            ...entry,
            similarity
          });
        }
      }

      // Sort by similarity (highest first)
      matches.sort((a, b) => b.similarity - a.similarity);

      // Limit results
      const limit = options.limit || 5;
      return matches.slice(0, limit);
    } catch (error) {
      console.error('Error finding answers:', error);
      return [];
    }
  }

  /**
   * Get answer by ID
   * @param {string} id - Answer ID
   * @returns {Promise<Object|null>} Answer object or null
   */
  async getAnswer(id) {
    try {
      const cache = await this.initialize();
      return cache.find(entry => entry.id === id) || null;
    } catch (error) {
      console.error('Error getting answer:', error);
      return null;
    }
  }

  /**
   * Update an existing answer
   * @param {string} id - Answer ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<boolean>} Success status
   */
  async updateAnswer(id, updates) {
    try {
      const cache = await this.initialize();
      const index = cache.findIndex(entry => entry.id === id);
      
      if (index === -1) {
        return false;
      }

      // Update entry
      cache[index] = {
        ...cache[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await chrome.storage.local.set({ [this.storageKey]: cache });
      return true;
    } catch (error) {
      console.error('Error updating answer:', error);
      return false;
    }
  }

  /**
   * Delete an answer from cache
   * @param {string} id - Answer ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteAnswer(id) {
    try {
      const cache = await this.initialize();
      const filtered = cache.filter(entry => entry.id !== id);
      
      await chrome.storage.local.set({ [this.storageKey]: filtered });
      return true;
    } catch (error) {
      console.error('Error deleting answer:', error);
      return false;
    }
  }

  /**
   * Record usage of an answer
   * @param {string} id - Answer ID
   * @returns {Promise<boolean>} Success status
   */
  async recordUsage(id) {
    try {
      const cache = await this.initialize();
      const index = cache.findIndex(entry => entry.id === id);
      
      if (index === -1) {
        return false;
      }

      cache[index].usageCount++;
      cache[index].lastUsed = new Date().toISOString();

      await chrome.storage.local.set({ [this.storageKey]: cache });
      return true;
    } catch (error) {
      console.error('Error recording usage:', error);
      return false;
    }
  }

  /**
   * Rate an answer
   * @param {string} id - Answer ID
   * @param {number} rating - Rating (1-5)
   * @returns {Promise<boolean>} Success status
   */
  async rateAnswer(id, rating) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return this.updateAnswer(id, { rating });
  }

  /**
   * Calculate text similarity using Jaccard index
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(text1, text2) {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    // Calculate intersection and union
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Tokenize text into words
   * @param {string} text - Text to tokenize
   * @returns {Array} Array of tokens
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2); // Remove short words
  }

  /**
   * Extract keywords from question text
   * @param {string} text - Question text
   * @returns {Array} Keywords
   */
  extractKeywords(text) {
    // Common stop words to ignore
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'you', 'your', 'do', 'does', 'did',
      'have', 'had', 'can', 'could', 'should', 'would'
    ]);

    const words = this.tokenize(text);
    return words.filter(word => !stopWords.has(word));
  }

  /**
   * Get all cached answers
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} All answers
   */
  async getAllAnswers(filters = {}) {
    try {
      let cache = await this.initialize();

      // Apply filters
      if (filters.type) {
        cache = cache.filter(entry => entry.questionType === filters.type);
      }

      if (filters.minRating) {
        cache = cache.filter(entry => entry.rating && entry.rating >= filters.minRating);
      }

      if (filters.sortBy) {
        cache = this.sortAnswers(cache, filters.sortBy);
      }

      return cache;
    } catch (error) {
      console.error('Error getting all answers:', error);
      return [];
    }
  }

  /**
   * Sort answers
   * @param {Array} answers - Answers to sort
   * @param {string} sortBy - Sort field
   * @returns {Array} Sorted answers
   */
  sortAnswers(answers, sortBy) {
    switch (sortBy) {
      case 'recent':
        return answers.sort((a, b) => 
          new Date(b.savedAt) - new Date(a.savedAt)
        );
      case 'popular':
        return answers.sort((a, b) => b.usageCount - a.usageCount);
      case 'rating':
        return answers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return answers;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    try {
      const cache = await this.initialize();

      const stats = {
        totalAnswers: cache.length,
        byType: {},
        averageRating: 0,
        totalUsage: 0,
        mostUsed: null,
        highestRated: null
      };

      let ratingSum = 0;
      let ratedCount = 0;

      cache.forEach(entry => {
        // Count by type
        stats.byType[entry.questionType] = (stats.byType[entry.questionType] || 0) + 1;

        // Sum usage
        stats.totalUsage += entry.usageCount;

        // Track ratings
        if (entry.rating) {
          ratingSum += entry.rating;
          ratedCount++;
        }

        // Track most used
        if (!stats.mostUsed || entry.usageCount > stats.mostUsed.usageCount) {
          stats.mostUsed = entry;
        }

        // Track highest rated
        if (entry.rating && (!stats.highestRated || entry.rating > stats.highestRated.rating)) {
          stats.highestRated = entry;
        }
      });

      stats.averageRating = ratedCount > 0 ? ratingSum / ratedCount : 0;

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }

  /**
   * Export cache to JSON
   * @returns {Promise<string>} JSON string
   */
  async exportCache() {
    try {
      const cache = await this.initialize();
      return JSON.stringify(cache, null, 2);
    } catch (error) {
      console.error('Error exporting cache:', error);
      throw error;
    }
  }

  /**
   * Import cache from JSON
   * @param {string} jsonData - JSON string
   * @param {boolean} merge - Merge with existing or replace
   * @returns {Promise<boolean>} Success status
   */
  async importCache(jsonData, merge = false) {
    try {
      const imported = JSON.parse(jsonData);
      
      if (!Array.isArray(imported)) {
        throw new Error('Invalid cache format');
      }

      let cache = merge ? await this.initialize() : [];
      
      // Add imported answers
      imported.forEach(entry => {
        // Regenerate IDs to avoid conflicts
        entry.id = this.generateId();
        cache.push(entry);
      });

      // Enforce size limit
      if (cache.length > this.maxCacheSize) {
        cache = cache.slice(0, this.maxCacheSize);
      }

      await chrome.storage.local.set({ [this.storageKey]: cache });
      return true;
    } catch (error) {
      console.error('Error importing cache:', error);
      throw error;
    }
  }

  /**
   * Clear all cached answers
   * @returns {Promise<boolean>} Success status
   */
  async clearCache() {
    try {
      await chrome.storage.local.set({ [this.storageKey]: [] });
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Search cache by keyword
   * @param {string} keyword - Keyword to search
   * @returns {Promise<Array>} Matching answers
   */
  async searchByKeyword(keyword) {
    try {
      const cache = await this.initialize();
      const lowerKeyword = keyword.toLowerCase();

      return cache.filter(entry => {
        const searchText = `${entry.questionText} ${entry.answer}`.toLowerCase();
        return searchText.includes(lowerKeyword) || 
               entry.keywords.some(kw => kw.includes(lowerKeyword));
      });
    } catch (error) {
      console.error('Error searching cache:', error);
      return [];
    }
  }

  /**
   * Get recently used answers
   * @param {number} limit - Number of answers to return
   * @returns {Promise<Array>} Recent answers
   */
  async getRecentlyUsed(limit = 10) {
    try {
      const cache = await this.initialize();
      const used = cache.filter(entry => entry.lastUsed);
      
      used.sort((a, b) => 
        new Date(b.lastUsed) - new Date(a.lastUsed)
      );

      return used.slice(0, limit);
    } catch (error) {
      console.error('Error getting recently used:', error);
      return [];
    }
  }

  /**
   * Get top-rated answers
   * @param {number} limit - Number of answers to return
   * @returns {Promise<Array>} Top-rated answers
   */
  async getTopRated(limit = 10) {
    try {
      const cache = await this.initialize();
      const rated = cache.filter(entry => entry.rating);
      
      rated.sort((a, b) => b.rating - a.rating);

      return rated.slice(0, limit);
    } catch (error) {
      console.error('Error getting top-rated:', error);
      return [];
    }
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnswerCache;
}
