/**
 * GeminiService - AI-powered answer generation using Google Gemini API
 * 
 * Generates contextual answers to screening questions using:
 * - User's resume data
 * - Job description
 * - Company information
 * - Question type-specific prompt templates
 */

class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    // Model configuration
    this.config = {
      temperature: 0.7, // Balance creativity and consistency
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 500, // Reasonable length for screening answers
      candidateCount: 1
    };
  }

  /**
   * Generate answer for a screening question
   * @param {Object} question - Question object from QuestionDetector
   * @param {Object} userProfile - User profile data with resume
   * @param {Object} jobData - Job description and company data
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated answer object
   */
  async generateAnswer(question, userProfile, jobData, options = {}) {
    try {
      // Build prompt based on question type
      const prompt = this.buildPrompt(question, userProfile, jobData, options);
      
      // Call Gemini API
      const response = await this.callGeminiAPI(prompt, options);
      
      // Parse and format response
      const answer = this.formatAnswer(response, question, options);
      
      return {
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.type,
        answer: answer,
        generatedAt: new Date().toISOString(),
        tokenCount: this.estimateTokens(prompt + answer),
        confidence: this.calculateConfidence(response, question),
        metadata: {
          model: 'gemini-pro',
          temperature: this.config.temperature,
          maxLength: question.maxLength
        }
      };
    } catch (error) {
      console.error('Error generating answer:', error);
      throw new Error(`Failed to generate answer: ${error.message}`);
    }
  }

  /**
   * Build prompt based on question type
   * @param {Object} question - Question object
   * @param {Object} userProfile - User profile
   * @param {Object} jobData - Job data
   * @param {Object} options - Options
   * @returns {string} Formatted prompt
   */
  buildPrompt(question, userProfile, jobData, options) {
    const baseContext = this.buildBaseContext(userProfile, jobData);
    
    // Select template based on question type
    const templates = {
      companyInterest: this.companyInterestTemplate,
      strengths: this.strengthsTemplate,
      weaknesses: this.weaknessesTemplate,
      projectExperience: this.projectExperienceTemplate,
      careerMotivation: this.careerMotivationTemplate,
      salary: this.salaryTemplate,
      availability: this.availabilityTemplate,
      workStyle: this.workStyleTemplate,
      technicalSkills: this.technicalSkillsTemplate
    };

    const template = templates[question.type] || this.genericTemplate;
    return template.call(this, question, userProfile, jobData, baseContext, options);
  }

  /**
   * Build base context for all prompts
   * @param {Object} userProfile - User profile
   * @param {Object} jobData - Job data
   * @returns {string} Base context
   */
  buildBaseContext(userProfile, jobData) {
    let context = '';

    // User info
    context += `CANDIDATE PROFILE:\n`;
    context += `Name: ${userProfile.firstName} ${userProfile.lastName}\n`;
    if (userProfile.currentTitle) {
      context += `Current Role: ${userProfile.currentTitle} at ${userProfile.currentCompany}\n`;
    }
    if (userProfile.yearsOfExperience) {
      context += `Experience: ${userProfile.yearsOfExperience} years\n`;
    }
    if (userProfile.educationLevel && userProfile.university) {
      context += `Education: ${userProfile.educationLevel} from ${userProfile.university}`;
      if (userProfile.major) context += ` (${userProfile.major})`;
      context += `\n`;
    }
    context += `\n`;

    // Skills
    if (userProfile.skills && userProfile.skills.length > 0) {
      context += `SKILLS:\n${userProfile.skills.join(', ')}\n\n`;
    }

    // Experience summary
    if (userProfile.experienceSummary) {
      context += `EXPERIENCE SUMMARY:\n${userProfile.experienceSummary}\n\n`;
    }

    // Job info
    if (jobData) {
      context += `TARGET POSITION:\n`;
      context += `Company: ${jobData.company || 'Not specified'}\n`;
      context += `Role: ${jobData.title || 'Not specified'}\n`;
      if (jobData.description) {
        context += `Job Description: ${jobData.description.substring(0, 500)}...\n`;
      }
      if (jobData.requirements) {
        context += `Requirements: ${jobData.requirements.substring(0, 300)}...\n`;
      }
      context += `\n`;
    }

    return context;
  }

  /**
   * Company interest question template
   */
  companyInterestTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following screening question for a job application.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Express genuine interest in the company and role
2. Connect your skills/experience to the job requirements
3. Show you've researched the company (mention specific products, values, or achievements)
4. Be specific and authentic, avoid generic responses
5. Keep it concise (150-250 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

STRUCTURE:
- Opening: State your interest and why
- Body: Connect your background to the role
- Closing: Express enthusiasm about contributing

Generate a professional, compelling answer:`;
  }

  /**
   * Strengths question template
   */
  strengthsTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following screening question about your strengths.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Choose 2-3 specific strengths relevant to the role
2. Provide concrete examples from your experience
3. Show how these strengths will benefit the company
4. Be confident but not arrogant
5. Keep it focused and professional (100-200 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

STRUCTURE:
- State your key strengths
- Provide specific examples/metrics
- Connect to the target role

Generate a strong, evidence-based answer:`;
  }

  /**
   * Weaknesses question template
   */
  weaknessesTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following screening question about weaknesses/areas for improvement.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Choose a genuine but minor weakness (not critical to the role)
2. Focus on the improvement plan and progress made
3. Show self-awareness and growth mindset
4. End on a positive note about learning
5. Keep it brief and honest (80-150 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

STRUCTURE:
- Acknowledge the area for improvement
- Explain what you're doing to improve
- Show progress or lessons learned

Generate a thoughtful, growth-oriented answer:`;
  }

  /**
   * Project experience question template (STAR format)
   */
  projectExperienceTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following behavioral/experience question using the STAR method.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Use STAR format (Situation, Task, Action, Result)
2. Choose a relevant project from your experience
3. Include specific metrics/outcomes
4. Highlight skills relevant to the target role
5. Keep it structured and concise (200-300 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

STAR STRUCTURE:
- Situation: Set the context (1-2 sentences)
- Task: Describe your responsibility (1-2 sentences)
- Action: Explain what you did (3-4 sentences)
- Result: Share the outcome with metrics (2-3 sentences)

Generate a compelling STAR format answer:`;
  }

  /**
   * Career motivation question template
   */
  careerMotivationTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following question about your career motivation.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Be honest but frame positively (if about leaving current role)
2. Focus on growth opportunities and career goals
3. Connect your aspirations to the target role
4. Avoid negative comments about current/past employers
5. Show enthusiasm and forward-thinking (100-200 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

STRUCTURE:
- Context: Brief background (if relevant)
- Motivation: What you're seeking
- Alignment: How this role fits your goals

Generate a positive, goal-oriented answer:`;
  }

  /**
   * Salary expectations template
   */
  salaryTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following question about salary expectations.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Provide a realistic range based on experience and location
2. Show flexibility and openness to discussion
3. Consider total compensation (benefits, equity, growth)
4. Be professional and avoid underselling yourself
5. Keep it brief (50-100 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

${userProfile.desiredSalary ? `CANDIDATE'S STATED SALARY EXPECTATION: $${userProfile.desiredSalary}\n` : ''}

STRUCTURE:
- State your range (if comfortable sharing)
- Express flexibility
- Mention other factors you value

Generate a diplomatic, professional answer:`;
  }

  /**
   * Availability question template
   */
  availabilityTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following question about availability/start date.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Provide a realistic timeframe
2. Mention notice period if currently employed
3. Show enthusiasm while being practical
4. Keep it brief and clear (30-80 words)
${question.maxLength ? `5. Maximum length: ${question.maxLength} characters\n` : ''}

${userProfile.noticePeriod ? `CANDIDATE'S NOTICE PERIOD: ${userProfile.noticePeriod}\n` : ''}
${userProfile.availableFrom ? `CANDIDATE'S AVAILABILITY: ${userProfile.availableFrom}\n` : ''}

Generate a clear, professional answer:`;
  }

  /**
   * Work style question template
   */
  workStyleTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following question about work style/preferences.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Describe your authentic work style
2. Show adaptability to different environments
3. Align with the company culture (if known)
4. Provide specific examples
5. Keep it balanced (100-150 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

STRUCTURE:
- State your preferred style
- Show flexibility and adaptability
- Provide examples

Generate a thoughtful, adaptable answer:`;
  }

  /**
   * Technical skills question template
   */
  technicalSkillsTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following question about technical skills.

QUESTION: "${question.questionText}"

GUIDELINES:
1. List relevant technical skills from your profile
2. Mention years of experience with each
3. Highlight skills matching the job requirements
4. Include tools, languages, frameworks
5. Be specific and accurate (100-200 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

STRUCTURE:
- Primary skills (most relevant)
- Supporting skills
- Learning/developing skills

Generate a comprehensive, accurate answer:`;
  }

  /**
   * Generic question template (fallback)
   */
  genericTemplate(question, userProfile, jobData, baseContext, options) {
    return `${baseContext}
TASK: Answer the following screening question professionally.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Provide a relevant, professional answer
2. Draw from your experience and skills
3. Connect to the target role when possible
4. Be concise and clear
5. Use appropriate length (100-200 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters\n` : ''}

Generate a professional answer:`;
  }

  /**
   * Call Gemini API with retry logic
   * @param {string} prompt - The prompt
   * @param {Object} options - Options
   * @returns {Promise<string>} Generated text
   */
  async callGeminiAPI(prompt, options = {}) {
    const url = `${this.apiEndpoint}?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: options.temperature || this.config.temperature,
        topK: this.config.topK,
        topP: this.config.topP,
        maxOutputTokens: options.maxTokens || this.config.maxOutputTokens,
        candidateCount: this.config.candidateCount
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        // Extract generated text
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            return candidate.content.parts[0].text;
          }
        }

        throw new Error('No content generated');
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        // Wait before retry
        if (attempt < this.maxRetries - 1) {
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  /**
   * Format answer with constraints
   * @param {string} rawAnswer - Raw generated answer
   * @param {Object} question - Question object
   * @param {Object} options - Options
   * @returns {string} Formatted answer
   */
  formatAnswer(rawAnswer, question, options) {
    let answer = rawAnswer.trim();

    // Respect max length if specified
    if (question.maxLength && answer.length > question.maxLength) {
      // Try to cut at sentence boundary
      const sentences = answer.split(/[.!?]\s+/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence).length <= question.maxLength - 10) {
          truncated += sentence + '. ';
        } else {
          break;
        }
      }
      answer = truncated.trim() || answer.substring(0, question.maxLength - 3) + '...';
    }

    // Clean up formatting
    answer = answer.replace(/\n{3,}/g, '\n\n'); // Remove excessive line breaks
    answer = answer.replace(/^\s+|\s+$/gm, ''); // Trim lines

    return answer;
  }

  /**
   * Calculate confidence score
   * @param {string} response - API response
   * @param {Object} question - Question object
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(response, question) {
    // Simple heuristic: longer responses with specific details = higher confidence
    let confidence = 0.7; // Base confidence

    if (response.length > 200) confidence += 0.1;
    if (response.includes('example') || response.includes('specifically')) confidence += 0.05;
    if (response.includes('%') || response.match(/\d+/)) confidence += 0.05; // Contains metrics
    if (question.requiresResume) confidence += 0.05; // Resume data provided
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Estimate token count (rough approximation)
   * @param {string} text - Text to estimate
   * @returns {number} Estimated tokens
   */
  estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Sleep utility for retries
   * @param {number} ms - Milliseconds
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate answers for multiple questions in batch
   * @param {Array} questions - Array of question objects
   * @param {Object} userProfile - User profile
   * @param {Object} jobData - Job data
   * @param {Object} options - Options
   * @returns {Promise<Array>} Array of answer objects
   */
  async generateBatchAnswers(questions, userProfile, jobData, options = {}) {
    const answers = [];
    const errors = [];

    for (const question of questions) {
      try {
        const answer = await this.generateAnswer(question, userProfile, jobData, options);
        answers.push(answer);
        
        // Rate limiting: wait between requests
        await this.sleep(1000); // 1 second delay
      } catch (error) {
        errors.push({
          questionId: question.id,
          questionText: question.questionText,
          error: error.message
        });
      }
    }

    return {
      answers,
      errors,
      successCount: answers.length,
      errorCount: errors.length
    };
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiService;
}
