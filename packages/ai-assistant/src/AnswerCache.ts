/**
 * AnswerCache - Cache and retrieve generated answers for reuse
 * 
 * Uses IndexedDB for persistent storage with semantic similarity matching.
 */

import type { CachedAnswer, QuestionType } from './types';

interface CacheEntry {
  id: string;
  questionText: string;
  questionType: QuestionType;
  answer: string;
  rating?: number;
  usageCount: number;
  createdAt: string;
  lastUsed: string;
  keywords: string[];
  jobContext?: {
    company?: string;
    title?: string;
  };
}

export class AnswerCache {
  private dbName = 'aplifyai-answer-cache';
  private dbVersion = 1;
  private storeName = 'answers';
  private db: IDBDatabase | null = null;

  /**
   * Initialize the cache database
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('questionType', 'questionType', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('lastUsed', 'lastUsed', { unique: false });
        }
      };
    });
  }

  /**
   * Save an answer to cache
   */
  async saveAnswer(data: {
    questionText: string;
    questionType: QuestionType;
    answer: string;
    rating?: number;
    jobContext?: { company?: string; title?: string };
  }): Promise<boolean> {
    await this.initialize();
    if (!this.db) return false;

    const entry: CacheEntry = {
      id: `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionText: data.questionText,
      questionType: data.questionType,
      answer: data.answer,
      rating: data.rating,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      keywords: this.extractKeywords(data.questionText),
      jobContext: data.jobContext
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(entry);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Find answers similar to a question
   */
  async findAnswers(
    questionText: string,
    questionType: QuestionType,
    options: { limit?: number; threshold?: number } = {}
  ): Promise<CachedAnswer[]> {
    await this.initialize();
    if (!this.db) return [];

    const limit = options.limit ?? 5;
    const threshold = options.threshold ?? 0.7;

    const entries = await this.getAllByType(questionType);
    const questionKeywords = this.extractKeywords(questionText);

    // Calculate similarity and filter
    const withScores = entries.map(entry => ({
      entry,
      similarity: this.calculateSimilarity(questionKeywords, entry.keywords)
    }));

    return withScores
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => {
        // Sort by similarity, then by rating, then by usage
        if (b.similarity !== a.similarity) return b.similarity - a.similarity;
        if ((b.entry.rating ?? 0) !== (a.entry.rating ?? 0)) {
          return (b.entry.rating ?? 0) - (a.entry.rating ?? 0);
        }
        return b.entry.usageCount - a.entry.usageCount;
      })
      .slice(0, limit)
      .map(item => ({
        id: item.entry.id,
        questionText: item.entry.questionText,
        questionType: item.entry.questionType,
        answer: item.entry.answer,
        similarity: item.similarity,
        rating: item.entry.rating,
        usageCount: item.entry.usageCount,
        createdAt: item.entry.createdAt,
        lastUsed: item.entry.lastUsed
      }));
  }

  /**
   * Record usage of a cached answer
   */
  async recordUsage(answerId: string): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const entry = await this.getById(answerId);
    if (!entry) return;

    entry.usageCount++;
    entry.lastUsed = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update rating for an answer
   */
  async updateRating(answerId: string, rating: number): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const entry = await this.getById(answerId);
    if (!entry) return;

    entry.rating = rating;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete an answer from cache
   */
  async deleteAnswer(answerId: string): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(answerId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached answers
   */
  async clear(): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache statistics
   */
  async getStatistics(): Promise<{
    totalAnswers: number;
    byType: Record<QuestionType, number>;
    totalUsage: number;
    averageRating: number;
  }> {
    await this.initialize();
    if (!this.db) {
      return { totalAnswers: 0, byType: {} as Record<QuestionType, number>, totalUsage: 0, averageRating: 0 };
    }

    const entries = await this.getAll();
    
    const stats = {
      totalAnswers: entries.length,
      byType: {} as Record<QuestionType, number>,
      totalUsage: 0,
      averageRating: 0
    };

    let ratedCount = 0;
    let ratingSum = 0;

    entries.forEach(entry => {
      stats.byType[entry.questionType] = (stats.byType[entry.questionType] || 0) + 1;
      stats.totalUsage += entry.usageCount;
      if (entry.rating) {
        ratedCount++;
        ratingSum += entry.rating;
      }
    });

    stats.averageRating = ratedCount > 0 ? ratingSum / ratedCount : 0;

    return stats;
  }

  // Private helper methods

  private async getById(id: string): Promise<CacheEntry | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAll(): Promise<CacheEntry[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllByType(type: QuestionType): Promise<CacheEntry[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('questionType');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why', 'your',
      'you', 'we', 'our', 'us', 'me', 'my', 'i', 'it', 'its'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  private calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);

    const intersection = keywords1.filter(k => set2.has(k)).length;
    const union = new Set([...keywords1, ...keywords2]).size;

    // Jaccard similarity
    return intersection / union;
  }
}
