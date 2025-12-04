/**
 * AIAssistantManager - Main orchestrator for AI-powered job application assistance
 * 
 * Coordinates:
 * - Question detection via QuestionDetector
 * - Answer generation via GeminiService
 * - Answer caching via AnswerCache
 * - Form filling functionality
 * - Cover letter and resume generation
 */

import { QuestionDetector } from './QuestionDetector';
import { GeminiService } from './GeminiService';
import { AnswerCache } from './AnswerCache';
import type {
  UserProfile,
  JobData,
  ScreeningQuestion,
  GeneratedAnswer,
  GenerationOptions,
  GenerationResult,
  FillOptions,
  FillResult,
  AIServiceConfig,
  CoverLetterInput,
  GeneratedCoverLetter,
  TailoredResumeInput,
  TailoredResume,
  AssistantState
} from './types';

export class AIAssistantManager {
  private questionDetector: QuestionDetector;
  private geminiService: GeminiService;
  private answerCache: AnswerCache;

  private currentQuestions: ScreeningQuestion[] = [];
  private generatedAnswers: Map<string, GeneratedAnswer> = new Map();
  private isGenerating = false;
  private lastError?: string;

  constructor(config: AIServiceConfig) {
    this.questionDetector = new QuestionDetector();
    this.geminiService = new GeminiService(config);
    this.answerCache = new AnswerCache();
  }

  /**
   * Initialize the manager and cache
   */
  async initialize(): Promise<void> {
    await this.answerCache.initialize();
  }

  /**
   * Get current state
   */
  getState(): AssistantState {
    return {
      isActive: true,
      detectedQuestions: this.currentQuestions,
      generatedAnswers: this.generatedAnswers,
      isGenerating: this.isGenerating,
      lastError: this.lastError
    };
  }

  /**
   * Detect questions on the current page
   */
  detectQuestions(document: Document): ScreeningQuestion[] {
    this.currentQuestions = this.questionDetector.detectAllQuestions(document);
    return this.currentQuestions;
  }

  /**
   * Get preview of detected questions with cached suggestions
   */
  async getQuestionsPreview(): Promise<Array<{
    question: ScreeningQuestion;
    hasCachedAnswers: boolean;
    cachedAnswers: Array<{ id: string; answer: string; similarity: number }>;
  }>> {
    const preview = [];

    for (const question of this.currentQuestions) {
      const cachedAnswers = await this.answerCache.findAnswers(
        question.questionText,
        question.type,
        { limit: 3, threshold: 0.8 }
      );

      preview.push({
        question,
        hasCachedAnswers: cachedAnswers.length > 0,
        cachedAnswers: cachedAnswers.map(a => ({
          id: a.id,
          answer: a.answer,
          similarity: a.similarity
        }))
      });
    }

    return preview;
  }

  /**
   * Generate answers for all detected questions
   */
  async generateAllAnswers(
    userProfile: UserProfile,
    jobData: JobData,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    if (this.isGenerating) {
      throw new Error('Generation already in progress');
    }

    this.isGenerating = true;
    this.lastError = undefined;

    const results: GenerationResult = {
      answers: [],
      errors: [],
      fromCache: [],
      generated: []
    };

    try {
      for (const question of this.currentQuestions) {
        try {
          // Skip if already has value and skipFilled is set
          if (options.skipFilled && question.currentValue) {
            continue;
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
              const answer: GeneratedAnswer = {
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

              await this.answerCache.recordUsage(cached.id);
              continue;
            }
          }

          // Generate new answer
          const answer = await this.geminiService.generateAnswer(
            question,
            userProfile,
            jobData,
            { temperature: options.temperature, maxTokens: options.maxTokens }
          );

          this.generatedAnswers.set(question.id, answer);
          results.answers.push(answer);
          results.generated.push(answer);

          // Progress callback
          options.onProgress?.({
            current: results.answers.length,
            total: this.currentQuestions.length,
            question: question.questionText
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push({
            questionId: question.id,
            questionText: question.questionText,
            error: errorMessage
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
   */
  async generateSingleAnswer(
    questionId: string,
    userProfile: UserProfile,
    jobData: JobData,
    options: { useCached?: boolean; temperature?: number } = {}
  ): Promise<GeneratedAnswer> {
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
        const answer: GeneratedAnswer = {
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
      { temperature: options.temperature }
    );

    this.generatedAnswers.set(question.id, answer);
    return answer;
  }

  /**
   * Regenerate answer with different parameters
   */
  async regenerateAnswer(
    questionId: string,
    userProfile: UserProfile,
    jobData: JobData,
    options: { temperature?: number } = {}
  ): Promise<GeneratedAnswer> {
    return this.generateSingleAnswer(questionId, userProfile, jobData, {
      ...options,
      useCached: false
    });
  }

  /**
   * Update a generated answer (user edited)
   */
  updateAnswer(questionId: string, newAnswer: string): boolean {
    const answer = this.generatedAnswers.get(questionId);
    if (!answer) return false;

    answer.answer = newAnswer;
    answer.userEdited = true;
    answer.editedAt = new Date().toISOString();

    return true;
  }

  /**
   * Save answer to cache for future reuse
   */
  async saveAnswerToCache(
    questionId: string,
    rating?: number,
    jobContext?: { company?: string; title?: string }
  ): Promise<boolean> {
    const answer = this.generatedAnswers.get(questionId);
    if (!answer || answer.fromCache) return false;

    return this.answerCache.saveAnswer({
      questionText: answer.questionText,
      questionType: answer.questionType,
      answer: answer.answer,
      rating,
      jobContext
    });
  }

  /**
   * Fill form fields with generated answers
   * Note: This requires DOM access and should be called from browser context
   */
  async fillForm(document: Document, options: FillOptions = {}): Promise<FillResult> {
    const results: FillResult = {
      filled: [],
      skipped: [],
      errors: []
    };

    for (const question of this.currentQuestions) {
      try {
        const answer = this.generatedAnswers.get(question.id);

        if (!answer) {
          results.skipped.push({ questionId: question.id, reason: 'No answer generated' });
          continue;
        }

        if (options.skipFilled && question.currentValue) {
          results.skipped.push({ questionId: question.id, reason: 'Already filled' });
          continue;
        }

        // Find the field element
        const field = question.fieldSelector
          ? document.querySelector<HTMLTextAreaElement | HTMLInputElement>(question.fieldSelector)
          : null;

        if (!field) {
          results.errors.push({ questionId: question.id, error: 'Field not found' });
          continue;
        }

        // Fill the field
        await this.fillField(field, answer.answer, options);

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({ questionId: question.id, error: errorMessage });
      }
    }

    return results;
  }

  /**
   * Fill a single field
   */
  private async fillField(
    element: HTMLTextAreaElement | HTMLInputElement,
    value: string,
    options: FillOptions
  ): Promise<void> {
    element.focus();

    if (options.simulateTyping) {
      element.value = '';
      for (const char of value) {
        element.value += char;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await this.sleep(30);
      }
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
  }

  /**
   * Generate a cover letter
   */
  async generateCoverLetter(input: CoverLetterInput): Promise<GeneratedCoverLetter> {
    return this.geminiService.generateCoverLetter(input);
  }

  /**
   * Tailor a resume for a specific job
   */
  async tailorResume(input: TailoredResumeInput): Promise<TailoredResume> {
    return this.geminiService.tailorResume(input);
  }

  /**
   * Get all generated answers
   */
  getAllAnswers(): GeneratedAnswer[] {
    return Array.from(this.generatedAnswers.values());
  }

  /**
   * Get answer by question ID
   */
  getAnswer(questionId: string): GeneratedAnswer | null {
    return this.generatedAnswers.get(questionId) || null;
  }

  /**
   * Clear all generated answers
   */
  clearAnswers(): void {
    this.generatedAnswers.clear();
  }

  /**
   * Get generation statistics
   */
  getStatistics(): {
    totalQuestions: number;
    totalAnswers: number;
    fromCache: number;
    generated: number;
    userEdited: number;
    byType: Record<string, number>;
  } {
    const answers = this.getAllAnswers();

    const stats = {
      totalQuestions: this.currentQuestions.length,
      totalAnswers: answers.length,
      fromCache: answers.filter(a => a.fromCache).length,
      generated: answers.filter(a => !a.fromCache).length,
      userEdited: answers.filter(a => a.userEdited).length,
      byType: {} as Record<string, number>
    };

    answers.forEach(answer => {
      stats.byType[answer.questionType] = (stats.byType[answer.questionType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Validate user profile completeness
   */
  validateProfile(userProfile: UserProfile): {
    isComplete: boolean;
    missing: string[];
    recommendations: string[];
  } {
    const missing: string[] = [];
    const recommendations: string[] = [];

    // Required fields
    if (!userProfile.firstName) missing.push('firstName');
    if (!userProfile.lastName) missing.push('lastName');
    if (!userProfile.email) missing.push('email');

    // Check if any questions require resume data
    const needsResume = this.currentQuestions.some(q => q.requiresResume);

    if (needsResume) {
      if (!userProfile.yearsOfExperience) missing.push('yearsOfExperience');
      if (!userProfile.skills || userProfile.skills.length === 0) missing.push('skills');
      if (!userProfile.experienceSummary) missing.push('experienceSummary');
    }

    // Recommendations
    if (missing.includes('experienceSummary')) {
      recommendations.push('Add a brief summary of your work experience for better answers');
    }
    if (missing.includes('skills')) {
      recommendations.push('List your key skills to highlight strengths effectively');
    }
    if (missing.includes('yearsOfExperience')) {
      recommendations.push('Specify years of experience for accurate positioning');
    }

    return {
      isComplete: missing.length === 0,
      missing,
      recommendations
    };
  }

  /**
   * Export all answers to JSON
   */
  exportAnswers(): string {
    return JSON.stringify({
      questions: this.currentQuestions.map(q => ({
        id: q.id,
        text: q.questionText,
        type: q.type,
        isRequired: q.isRequired
      })),
      answers: this.getAllAnswers(),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
