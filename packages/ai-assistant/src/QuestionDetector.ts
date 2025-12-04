/**
 * QuestionDetector - Identifies screening questions in application forms
 * 
 * Cross-platform implementation for detecting question types in job applications.
 * Works in browser context (extension, Electron webview, Capacitor).
 */

import type { ScreeningQuestion, QuestionType } from './types';

// Question patterns organized by type
const QUESTION_PATTERNS: Record<QuestionType, {
  keywords: string[];
  score: number;
  requiresResearch?: boolean;
  requiresResume?: boolean;
  format?: 'STAR' | 'bullet' | 'paragraph';
}> = {
  companyInterest: {
    keywords: [
      'why do you want to work here',
      'why are you interested in this',
      'why this company',
      'what interests you about',
      'why do you want to join',
      'what attracts you to',
      'why should we hire you',
      'what makes you want to work',
      'why are you applying'
    ],
    score: 15,
    requiresResearch: true
  },
  strengths: {
    keywords: [
      'greatest strength',
      'top skill',
      'what are you good at',
      'your strengths',
      'key competencies',
      'what makes you qualified',
      'unique skills',
      'standout abilities',
      'core strengths'
    ],
    score: 10,
    requiresResume: true
  },
  weaknesses: {
    keywords: [
      'greatest weakness',
      'areas for improvement',
      'what do you struggle with',
      'challenges you face',
      'areas to develop',
      'where do you need growth'
    ],
    score: 10,
    requiresResume: true
  },
  projectExperience: {
    keywords: [
      'describe a project',
      'challenging project',
      'difficult situation',
      'problem you solved',
      'achievement',
      'accomplishment',
      'example of when you',
      'tell me about a time',
      'give an example',
      'describe your experience with'
    ],
    score: 12,
    requiresResume: true,
    format: 'STAR'
  },
  careerMotivation: {
    keywords: [
      'why are you leaving',
      'why change jobs',
      'career goals',
      'where do you see yourself',
      'what are you looking for',
      'career aspirations',
      'professional goals',
      'why this role',
      'what motivates you'
    ],
    score: 10,
    requiresResume: false
  },
  salary: {
    keywords: [
      'salary expectations',
      'desired salary',
      'compensation requirements',
      'expected pay',
      'salary range',
      'pay expectations',
      'compensation needs'
    ],
    score: 8,
    requiresResume: true
  },
  availability: {
    keywords: [
      'when can you start',
      'availability',
      'start date',
      'notice period',
      'how soon can you begin',
      'earliest start'
    ],
    score: 5,
    requiresResume: false
  },
  workStyle: {
    keywords: [
      'work style',
      'how do you work',
      'team or independent',
      'work environment preference',
      'ideal work setting',
      'collaboration style',
      'remote or office'
    ],
    score: 8,
    requiresResume: true
  },
  technicalSkills: {
    keywords: [
      'technical skills',
      'programming languages',
      'tools and technologies',
      'software proficiency',
      'technical experience',
      'frameworks you know',
      'development experience'
    ],
    score: 10,
    requiresResume: true
  },
  generic: {
    keywords: [],
    score: 0
  }
};

// Field selectors for screening questions
const FIELD_SELECTORS = [
  'textarea[name*="question"]',
  'textarea[name*="answer"]',
  'textarea[name*="response"]',
  'textarea[placeholder*="why"]',
  'textarea[placeholder*="describe"]',
  'textarea[placeholder*="tell us"]',
  'textarea[placeholder*="explain"]',
  'textarea[aria-label*="question"]',
  'textarea[aria-label*="answer"]',
  'input[type="text"][name*="question"]',
  'input[type="text"][placeholder*="why"]',
  'input[type="text"][placeholder*="describe"]',
  'textarea[id*="question"]',
  'textarea[id*="screening"]',
  'textarea[id*="essay"]',
  'div[class*="question"] textarea',
  'div[class*="screening"] textarea',
  'div[class*="essay"] textarea'
];

export class QuestionDetector {
  private fieldSelectors: string[];

  constructor(customSelectors?: string[]) {
    this.fieldSelectors = customSelectors || FIELD_SELECTORS;
  }

  /**
   * Detect all screening questions on the page
   */
  detectAllQuestions(document: Document): ScreeningQuestion[] {
    const allQuestions: ScreeningQuestion[] = [];
    const forms = document.querySelectorAll('form');

    forms.forEach((form, formIndex) => {
      const questions = this.detectQuestionsInForm(form);
      questions.forEach(q => {
        allQuestions.push({ ...q, metadata: { ...q.metadata, formIndex } });
      });
    });

    // Also check for fields outside forms
    if (allQuestions.length === 0) {
      const standaloneQuestions = this.detectStandaloneQuestions(document);
      allQuestions.push(...standaloneQuestions);
    }

    return allQuestions;
  }

  /**
   * Detect questions within a specific form
   */
  detectQuestionsInForm(form: HTMLFormElement): ScreeningQuestion[] {
    const questions: ScreeningQuestion[] = [];
    const selector = this.fieldSelectors.join(', ');
    const fields = form.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(selector);

    fields.forEach((field, index) => {
      const question = this.analyzeField(field, index);
      if (question) {
        questions.push(question);
      }
    });

    return questions;
  }

  /**
   * Detect questions outside form elements
   */
  private detectStandaloneQuestions(document: Document): ScreeningQuestion[] {
    const questions: ScreeningQuestion[] = [];
    const selector = this.fieldSelectors.join(', ');
    const fields = document.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(selector);

    fields.forEach((field, index) => {
      const question = this.analyzeField(field, index);
      if (question) {
        questions.push(question);
      }
    });

    return questions;
  }

  /**
   * Analyze a single field to determine if it's a screening question
   */
  analyzeField(field: HTMLTextAreaElement | HTMLInputElement, index: number): ScreeningQuestion | null {
    const context = this.extractContext(field);
    const classification = this.classifyQuestion(context);

    if (!classification) {
      return null;
    }

    const fieldSelector = this.generateFieldSelector(field);

    return {
      id: `question_${index}_${Date.now()}`,
      type: classification.type,
      questionText: context.questionText,
      placeholder: context.placeholder,
      isRequired: this.isRequired(field),
      maxLength: field.maxLength > 0 ? field.maxLength : undefined,
      currentValue: field.value || undefined,
      requiresResearch: classification.requiresResearch,
      requiresResume: classification.requiresResume,
      format: classification.format,
      fieldSelector,
      metadata: {
        name: field.name || '',
        id: field.id || '',
        className: field.className || '',
        label: context.label,
        helpText: context.helpText
      }
    };
  }

  /**
   * Extract context from field and surrounding elements
   */
  private extractContext(field: HTMLElement): {
    questionText: string;
    placeholder: string;
    label: string;
    helpText: string;
  } {
    const context = {
      questionText: '',
      placeholder: (field as HTMLInputElement).placeholder || '',
      label: '',
      helpText: ''
    };

    // Try to find label
    const label = this.findLabel(field);
    if (label) {
      context.label = label.textContent?.trim() || '';
      context.questionText = context.label;
    }

    // Look for question text in parent elements
    const parent = field.closest('div[class*="question"], div[class*="field"], div[class*="form-group"]');
    if (parent) {
      const heading = parent.querySelector('h1, h2, h3, h4, h5, h6, .question-text, .field-label');
      if (heading && heading !== label) {
        const headingText = heading.textContent?.trim() || '';
        if (headingText.length > context.questionText.length) {
          context.questionText = headingText;
        }
      }

      const helpText = parent.querySelector('.help-text, .hint, .description, small');
      if (helpText) {
        context.helpText = helpText.textContent?.trim() || '';
      }
    }

    // Use placeholder if no question text found
    if (!context.questionText && context.placeholder) {
      context.questionText = context.placeholder;
    }

    return context;
  }

  /**
   * Find label element for a field
   */
  private findLabel(field: HTMLElement): HTMLLabelElement | null {
    // Try by ID
    if (field.id) {
      const label = field.ownerDocument.querySelector<HTMLLabelElement>(`label[for="${field.id}"]`);
      if (label) return label;
    }

    // Try by parent label
    const parentLabel = field.closest('label');
    if (parentLabel) return parentLabel;

    // Try previous sibling label
    const prevSibling = field.previousElementSibling;
    if (prevSibling && prevSibling.tagName === 'LABEL') {
      return prevSibling as HTMLLabelElement;
    }

    return null;
  }

  /**
   * Classify the question type based on context
   */
  private classifyQuestion(context: { questionText: string; placeholder: string; label: string }): {
    type: QuestionType;
    requiresResearch?: boolean;
    requiresResume?: boolean;
    format?: 'STAR' | 'bullet' | 'paragraph';
  } | null {
    const text = `${context.questionText} ${context.placeholder} ${context.label}`.toLowerCase();
    
    let bestMatch: { type: QuestionType; score: number; requiresResearch?: boolean; requiresResume?: boolean; format?: 'STAR' | 'bullet' | 'paragraph' } | null = null;

    for (const [type, config] of Object.entries(QUESTION_PATTERNS)) {
      if (type === 'generic') continue;
      
      for (const keyword of config.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          if (!bestMatch || config.score > bestMatch.score) {
            bestMatch = {
              type: type as QuestionType,
              score: config.score,
              requiresResearch: config.requiresResearch,
              requiresResume: config.requiresResume,
              format: config.format
            };
          }
          break;
        }
      }
    }

    // Only return if score is significant (>= 5)
    return bestMatch && bestMatch.score >= 5 ? bestMatch : null;
  }

  /**
   * Generate a unique CSS selector for a field
   */
  private generateFieldSelector(field: HTMLElement): string {
    if (field.id) {
      return `#${field.id}`;
    }
    
    if (field.getAttribute('name')) {
      return `[name="${field.getAttribute('name')}"]`;
    }

    // Generate path selector
    const path: string[] = [];
    let current: HTMLElement | null = field;
    
    while (current && current !== current.ownerDocument.body) {
      let selector = current.tagName.toLowerCase();
      if (current.className) {
        selector += `.${current.className.split(' ')[0]}`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  /**
   * Check if field is required
   */
  private isRequired(field: HTMLElement): boolean {
    if ((field as HTMLInputElement).required) return true;
    if (field.getAttribute('aria-required') === 'true') return true;

    const label = this.findLabel(field);
    if (label && (label.textContent?.includes('*') || label.textContent?.toLowerCase().includes('required'))) {
      return true;
    }

    const parent = field.closest('div[class*="required"], div[class*="mandatory"]');
    return !!parent;
  }

  /**
   * Get statistics about detected questions
   */
  getStatistics(questions: ScreeningQuestion[]): {
    total: number;
    required: number;
    byType: Record<QuestionType, number>;
    requiresResearch: number;
    requiresResume: number;
  } {
    const stats = {
      total: questions.length,
      required: questions.filter(q => q.isRequired).length,
      byType: {} as Record<QuestionType, number>,
      requiresResearch: questions.filter(q => q.requiresResearch).length,
      requiresResume: questions.filter(q => q.requiresResume).length
    };

    questions.forEach(q => {
      stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    });

    return stats;
  }
}
