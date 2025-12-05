/**
 * QuestionDetector - Identifies screening questions in application forms
 * 
 * Detects common screening question types and classifies them for AI generation:
 * - Company interest questions
 * - Strength/weakness questions
 * - Project/experience questions
 * - Career motivation questions
 * - Salary expectation questions
 */

class QuestionDetector {
  constructor() {
    // Question patterns organized by type
    this.questionPatterns = {
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
        format: 'STAR' // Situation, Task, Action, Result
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
      }
    };

    // Field selectors for screening questions
    this.fieldSelectors = [
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
      // Common form builder patterns
      'textarea[id*="question"]',
      'textarea[id*="screening"]',
      'textarea[id*="essay"]',
      'div[class*="question"] textarea',
      'div[class*="screening"] textarea',
      'div[class*="essay"] textarea'
    ];
  }

  /**
   * Detect all screening questions in a form
   * @param {HTMLFormElement} formElement - The form to analyze
   * @returns {Array} Array of detected question objects
   */
  detectQuestions(formElement) {
    const questions = [];
    const selector = this.fieldSelectors.join(', ');
    const fields = formElement.querySelectorAll(selector);

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
   * @param {HTMLElement} field - The field element to analyze
   * @param {number} index - Field index
   * @returns {Object|null} Question object or null
   */
  analyzeField(field, index) {
    // Extract text context from field and surrounding elements
    const context = this.extractContext(field);
    
    // Classify the question type
    const classification = this.classifyQuestion(context);
    
    if (!classification) {
      return null;
    }

    // Get field metadata
    const metadata = this.getFieldMetadata(field);

    return {
      id: `question_${index}_${Date.now()}`,
      element: field,
      type: classification.type,
      questionText: context.questionText,
      placeholder: context.placeholder,
      context: context,
      requiresResearch: classification.requiresResearch || false,
      requiresResume: classification.requiresResume || false,
      format: classification.format || null,
      score: classification.score,
      metadata: metadata,
      isRequired: this.isRequired(field),
      maxLength: field.maxLength > 0 ? field.maxLength : null,
      currentValue: field.value
    };
  }

  /**
   * Extract context from field and surrounding elements
   * @param {HTMLElement} field - The field element
   * @returns {Object} Context information
   */
  extractContext(field) {
    const context = {
      questionText: '',
      placeholder: field.placeholder || '',
      label: '',
      helpText: ''
    };

    // Try to find label
    const label = this.findLabel(field);
    if (label) {
      context.label = label.textContent.trim();
      context.questionText = context.label;
    }

    // Look for question text in parent elements
    const parent = field.closest('div[class*="question"], div[class*="field"], div[class*="form-group"]');
    if (parent) {
      // Find heading or question text
      const heading = parent.querySelector('h1, h2, h3, h4, h5, h6, .question-text, .field-label');
      if (heading && heading !== label) {
        const headingText = heading.textContent.trim();
        if (headingText.length > context.questionText.length) {
          context.questionText = headingText;
        }
      }

      // Find help text
      const helpText = parent.querySelector('.help-text, .hint, .description, small');
      if (helpText) {
        context.helpText = helpText.textContent.trim();
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
   * @param {HTMLElement} field - The field element
   * @returns {HTMLLabelElement|null} Label element or null
   */
  findLabel(field) {
    // Try by ID
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label;
    }

    // Try by parent label
    const parentLabel = field.closest('label');
    if (parentLabel) return parentLabel;

    // Try previous sibling label
    const prevLabel = field.previousElementSibling;
    if (prevLabel && prevLabel.tagName === 'LABEL') {
      return prevLabel;
    }

    return null;
  }

  /**
   * Classify the question type based on context
   * @param {Object} context - Context information
   * @returns {Object|null} Classification object or null
   */
  classifyQuestion(context) {
    const text = `${context.questionText} ${context.placeholder} ${context.label}`.toLowerCase();
    
    let bestMatch = null;
    let highestScore = 0;

    // Check each question type
    for (const [type, config] of Object.entries(this.questionPatterns)) {
      for (const keyword of config.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          if (config.score > highestScore) {
            highestScore = config.score;
            bestMatch = {
              type,
              ...config
            };
          }
          break; // Move to next type after first match
        }
      }
    }

    // Only return if score is significant
    return highestScore >= 5 ? bestMatch : null;
  }

  /**
   * Get field metadata
   * @param {HTMLElement} field - The field element
   * @returns {Object} Metadata object
   */
  getFieldMetadata(field) {
    return {
      name: field.name || '',
      id: field.id || '',
      type: field.type || 'textarea',
      className: field.className || '',
      ariaLabel: field.getAttribute('aria-label') || '',
      autocomplete: field.autocomplete || '',
      rows: field.rows || null,
      cols: field.cols || null
    };
  }

  /**
   * Check if field is required
   * @param {HTMLElement} field - The field element
   * @returns {boolean} True if required
   */
  isRequired(field) {
    // Check required attribute
    if (field.required) return true;

    // Check aria-required
    if (field.getAttribute('aria-required') === 'true') return true;

    // Check for asterisk in label
    const label = this.findLabel(field);
    if (label && (label.textContent.includes('*') || label.textContent.includes('required'))) {
      return true;
    }

    // Check parent for required indicator
    const parent = field.closest('div[class*="required"], div[class*="mandatory"]');
    if (parent) return true;

    return false;
  }

  /**
   * Detect questions across all forms on the page
   * @returns {Array} Array of question objects with form references
   */
  detectAllQuestions() {
    const allQuestions = [];
    const forms = document.querySelectorAll('form');

    forms.forEach((form, formIndex) => {
      const questions = this.detectQuestions(form);
      questions.forEach(q => {
        q.formElement = form;
        q.formIndex = formIndex;
        allQuestions.push(q);
      });
    });

    // Also check for fields outside forms (some sites don't use <form>)
    if (allQuestions.length === 0) {
      const selector = this.fieldSelectors.join(', ');
      const standaloneFields = document.querySelectorAll(selector);
      
      standaloneFields.forEach((field, index) => {
        const question = this.analyzeField(field, index);
        if (question) {
          question.formElement = null;
          question.formIndex = -1;
          allQuestions.push(question);
        }
      });
    }

    return allQuestions;
  }

  /**
   * Filter questions by type
   * @param {Array} questions - Array of question objects
   * @param {string} type - Question type to filter by
   * @returns {Array} Filtered questions
   */
  filterByType(questions, type) {
    return questions.filter(q => q.type === type);
  }

  /**
   * Get questions that require research (company-specific)
   * @param {Array} questions - Array of question objects
   * @returns {Array} Questions requiring research
   */
  getResearchQuestions(questions) {
    return questions.filter(q => q.requiresResearch);
  }

  /**
   * Get questions that require resume data
   * @param {Array} questions - Array of question objects
   * @returns {Array} Questions requiring resume
   */
  getResumeQuestions(questions) {
    return questions.filter(q => q.requiresResume);
  }

  /**
   * Get statistics about detected questions
   * @param {Array} questions - Array of question objects
   * @returns {Object} Statistics object
   */
  getStatistics(questions) {
    const stats = {
      total: questions.length,
      required: questions.filter(q => q.isRequired).length,
      byType: {},
      requiresResearch: questions.filter(q => q.requiresResearch).length,
      requiresResume: questions.filter(q => q.requiresResume).length
    };

    // Count by type
    questions.forEach(q => {
      stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    });

    return stats;
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionDetector;
}
