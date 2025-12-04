/**
 * GeminiService - AI-powered answer generation using Google Gemini API
 * 
 * Generates contextual answers to screening questions using:
 * - User's resume data
 * - Job description
 * - Company information
 * - Question type-specific prompt templates
 */

import type {
  UserProfile,
  JobData,
  ScreeningQuestion,
  GeneratedAnswer,
  QuestionType,
  AIServiceConfig,
  CoverLetterInput,
  GeneratedCoverLetter,
  CoverLetterStyle,
  TailoredResumeInput,
  TailoredResume
} from './types';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Initialize GeminiService with config from @aplifyai/config
 * This is the recommended way to create a GeminiService instance
 * 
 * @example
 * ```ts
 * import { createGeminiService } from '@aplifyai/ai-assistant';
 * 
 * const service = await createGeminiService();
 * const answer = await service.generateAnswer(question, profile, jobData);
 * ```
 */
export async function createGeminiService(configOverrides?: Partial<AIServiceConfig>): Promise<GeminiService> {
  // Dynamically import config to avoid circular dependencies
  const { getAIConfig } = await import('@aplifyai/config');
  const aiConfig = await getAIConfig();
  
  return new GeminiService({
    apiKey: configOverrides?.apiKey || aiConfig.apiKey,
    model: configOverrides?.model || aiConfig.model,
    temperature: configOverrides?.temperature ?? aiConfig.temperature,
    maxTokens: configOverrides?.maxTokens ?? aiConfig.maxTokens,
    maxRetries: configOverrides?.maxRetries ?? 3,
    retryDelay: configOverrides?.retryDelay ?? 1000,
  });
}

export class GeminiService {
  private apiKey: string;
  private model: string;
  private apiEndpoint: string;
  private maxRetries: number;
  private retryDelay: number;
  private config: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
  };

  constructor(config: AIServiceConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-1.5-flash';
    this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelay = config.retryDelay ?? 1000;
    this.config = {
      temperature: config.temperature ?? 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: config.maxTokens ?? 500
    };
  }

  /**
   * Check if the service has a valid API key
   */
  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Update the API key (useful for user-provided keys)
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Generate answer for a screening question
   */
  async generateAnswer(
    question: ScreeningQuestion,
    userProfile: UserProfile,
    jobData: JobData,
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<GeneratedAnswer> {
    const prompt = this.buildPrompt(question, userProfile, jobData);
    const response = await this.callAPI(prompt, options);
    const answer = this.formatAnswer(response, question);

    return {
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.type,
      answer,
      fromCache: false,
      generatedAt: new Date().toISOString(),
      tokenCount: this.estimateTokens(prompt + answer),
      confidence: this.calculateConfidence(response, question),
      metadata: {
        model: 'gemini-pro',
        temperature: options.temperature ?? this.config.temperature,
        maxLength: question.maxLength
      }
    };
  }

  /**
   * Generate a cover letter
   */
  async generateCoverLetter(input: CoverLetterInput): Promise<GeneratedCoverLetter> {
    const prompt = this.buildCoverLetterPrompt(input);
    const content = await this.callAPI(prompt, { maxTokens: 1000 });

    return {
      id: `cover_${Date.now()}`,
      content,
      style: input.style || 'formal',
      generatedAt: new Date().toISOString(),
      wordCount: content.split(/\s+/).length,
      metadata: {
        model: 'gemini-pro',
        temperature: this.config.temperature
      }
    };
  }

  /**
   * Tailor a resume for a specific job
   */
  async tailorResume(input: TailoredResumeInput): Promise<TailoredResume> {
    const prompt = this.buildResumeTailorPrompt(input);
    const response = await this.callAPI(prompt, { maxTokens: 1500 });
    
    // Parse the response to extract structured data
    const sections = this.parseResumeSections(response, input);

    return {
      id: `resume_${Date.now()}`,
      sections,
      keywords: this.extractKeywords(response),
      atsScore: this.calculateATSScore(sections, input.jobData),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Build prompt based on question type
   */
  private buildPrompt(question: ScreeningQuestion, userProfile: UserProfile, jobData: JobData): string {
    const baseContext = this.buildBaseContext(userProfile, jobData);
    
    const templateFn = this.getTemplateFunction(question.type);
    return templateFn(question, userProfile, jobData, baseContext);
  }

  /**
   * Get template function for question type
   */
  private getTemplateFunction(type: QuestionType): (
    question: ScreeningQuestion,
    userProfile: UserProfile,
    jobData: JobData,
    baseContext: string
  ) => string {
    const templates: Record<QuestionType, typeof this.genericTemplate> = {
      companyInterest: this.companyInterestTemplate.bind(this),
      strengths: this.strengthsTemplate.bind(this),
      weaknesses: this.weaknessesTemplate.bind(this),
      projectExperience: this.projectExperienceTemplate.bind(this),
      careerMotivation: this.careerMotivationTemplate.bind(this),
      salary: this.salaryTemplate.bind(this),
      availability: this.availabilityTemplate.bind(this),
      workStyle: this.workStyleTemplate.bind(this),
      technicalSkills: this.technicalSkillsTemplate.bind(this),
      generic: this.genericTemplate.bind(this)
    };

    return templates[type] || templates.generic;
  }

  /**
   * Build base context for all prompts
   */
  private buildBaseContext(userProfile: UserProfile, jobData: JobData): string {
    let context = 'CANDIDATE PROFILE:\n';
    context += `Name: ${userProfile.firstName} ${userProfile.lastName}\n`;
    
    if (userProfile.currentTitle) {
      context += `Current Role: ${userProfile.currentTitle}`;
      if (userProfile.currentCompany) context += ` at ${userProfile.currentCompany}`;
      context += '\n';
    }
    
    if (userProfile.yearsOfExperience) {
      context += `Experience: ${userProfile.yearsOfExperience} years\n`;
    }
    
    if (userProfile.educationLevel && userProfile.university) {
      context += `Education: ${userProfile.educationLevel} from ${userProfile.university}`;
      if (userProfile.major) context += ` (${userProfile.major})`;
      context += '\n';
    }
    context += '\n';

    if (userProfile.skills && userProfile.skills.length > 0) {
      context += `SKILLS:\n${userProfile.skills.join(', ')}\n\n`;
    }

    if (userProfile.experienceSummary) {
      context += `EXPERIENCE SUMMARY:\n${userProfile.experienceSummary}\n\n`;
    }

    context += 'TARGET POSITION:\n';
    context += `Company: ${jobData.company || 'Not specified'}\n`;
    context += `Role: ${jobData.title || 'Not specified'}\n`;
    
    if (jobData.description) {
      context += `Job Description: ${jobData.description.substring(0, 500)}...\n`;
    }
    if (jobData.requirements) {
      context += `Requirements: ${jobData.requirements.substring(0, 300)}...\n`;
    }
    context += '\n';

    return context;
  }

  // Question type templates
  private companyInterestTemplate(
    question: ScreeningQuestion,
    _userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following screening question for a job application.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Express genuine interest in the company and role
2. Connect your skills/experience to the job requirements
3. Show you've researched the company
4. Be specific and authentic
5. Keep it concise (150-250 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters` : ''}

Generate a professional, compelling answer:`;
  }

  private strengthsTemplate(
    question: ScreeningQuestion,
    _userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following screening question about your strengths.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Choose 2-3 specific strengths relevant to the role
2. Provide concrete examples from your experience
3. Show how these strengths will benefit the company
4. Be confident but not arrogant
5. Keep it focused (100-200 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters` : ''}

Generate a strong, evidence-based answer:`;
  }

  private weaknessesTemplate(
    question: ScreeningQuestion,
    _userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following screening question about weaknesses/areas for improvement.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Choose a genuine but minor weakness
2. Focus on the improvement plan and progress made
3. Show self-awareness and growth mindset
4. End on a positive note
5. Keep it brief (80-150 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters` : ''}

Generate a thoughtful, growth-oriented answer:`;
  }

  private projectExperienceTemplate(
    question: ScreeningQuestion,
    _userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer using the STAR method (Situation, Task, Action, Result).

QUESTION: "${question.questionText}"

GUIDELINES:
1. Use STAR format
2. Choose a relevant project from experience
3. Include specific metrics/outcomes
4. Highlight relevant skills
5. Keep it structured (200-300 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters` : ''}

Generate a compelling STAR format answer:`;
  }

  private careerMotivationTemplate(
    question: ScreeningQuestion,
    _userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following question about your career motivation.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Be honest but frame positively
2. Focus on growth opportunities
3. Connect aspirations to the target role
4. Avoid negative comments about employers
5. Show enthusiasm (100-200 words)
${question.maxLength ? `6. Maximum length: ${question.maxLength} characters` : ''}

Generate a positive, goal-oriented answer:`;
  }

  private salaryTemplate(
    question: ScreeningQuestion,
    userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following question about salary expectations.

QUESTION: "${question.questionText}"

${userProfile.desiredSalary ? `CANDIDATE'S EXPECTATION: $${userProfile.desiredSalary}\n` : ''}

GUIDELINES:
1. Provide a realistic range
2. Show flexibility
3. Be professional
4. Keep it brief (50-100 words)
${question.maxLength ? `5. Maximum length: ${question.maxLength} characters` : ''}

Generate a diplomatic answer:`;
  }

  private availabilityTemplate(
    question: ScreeningQuestion,
    userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following question about availability/start date.

QUESTION: "${question.questionText}"

${userProfile.noticePeriod ? `NOTICE PERIOD: ${userProfile.noticePeriod}\n` : ''}
${userProfile.availableFrom ? `AVAILABILITY: ${userProfile.availableFrom}\n` : ''}

GUIDELINES:
1. Provide a realistic timeframe
2. Mention notice period if relevant
3. Show enthusiasm
4. Keep it brief (30-80 words)
${question.maxLength ? `5. Maximum length: ${question.maxLength} characters` : ''}

Generate a clear answer:`;
  }

  private workStyleTemplate(
    question: ScreeningQuestion,
    _userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following question about work style.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Describe your authentic work style
2. Show adaptability
3. Provide specific examples
4. Keep it balanced (100-150 words)
${question.maxLength ? `5. Maximum length: ${question.maxLength} characters` : ''}

Generate a thoughtful answer:`;
  }

  private technicalSkillsTemplate(
    question: ScreeningQuestion,
    _userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following question about technical skills.

QUESTION: "${question.questionText}"

GUIDELINES:
1. List relevant technical skills
2. Mention years of experience
3. Highlight skills matching requirements
4. Be specific and accurate (100-200 words)
${question.maxLength ? `5. Maximum length: ${question.maxLength} characters` : ''}

Generate a comprehensive answer:`;
  }

  private genericTemplate(
    question: ScreeningQuestion,
    _userProfile: UserProfile,
    _jobData: JobData,
    baseContext: string
  ): string {
    return `${baseContext}
TASK: Answer the following screening question professionally.

QUESTION: "${question.questionText}"

GUIDELINES:
1. Provide a relevant, professional answer
2. Draw from experience and skills
3. Connect to the target role
4. Be concise and clear (100-200 words)
${question.maxLength ? `5. Maximum length: ${question.maxLength} characters` : ''}

Generate a professional answer:`;
  }

  /**
   * Build cover letter generation prompt
   */
  private buildCoverLetterPrompt(input: CoverLetterInput): string {
    const styleGuide: Record<CoverLetterStyle, string> = {
      formal: 'Use a formal, traditional business letter tone.',
      conversational: 'Use a warm, conversational yet professional tone.',
      creative: 'Use a creative, engaging tone that shows personality.',
      concise: 'Be extremely concise - keep it to 3 short paragraphs.'
    };

    const baseContext = this.buildBaseContext(input.userProfile, input.jobData);

    return `${baseContext}
TASK: Write a cover letter for this job application.

STYLE: ${styleGuide[input.style || 'formal']}

${input.customInstructions ? `ADDITIONAL INSTRUCTIONS: ${input.customInstructions}\n` : ''}

GUIDELINES:
1. Start with an engaging opening
2. Highlight 2-3 relevant achievements
3. Show enthusiasm for the company
4. Include a clear call to action
5. Keep it to one page (300-400 words)

Write the cover letter:`;
  }

  /**
   * Build resume tailoring prompt
   */
  private buildResumeTailorPrompt(input: TailoredResumeInput): string {
    const baseContext = this.buildBaseContext(input.userProfile, input.jobData);
    const sections = input.sections || ['summary', 'skills', 'experience'];

    return `${baseContext}
TASK: Tailor the following resume sections for this specific job.

SECTIONS TO TAILOR: ${sections.join(', ')}

${input.originalResume ? `ORIGINAL RESUME:\n${input.originalResume}\n\n` : ''}

GUIDELINES:
1. Incorporate keywords from the job description
2. Highlight relevant experience and achievements
3. Quantify results where possible
4. Optimize for ATS (Applicant Tracking Systems)
5. Keep the same factual information, just reframe it

For each section, provide:
- SUMMARY: A tailored professional summary (2-3 sentences)
- SKILLS: A list of skills prioritized by relevance
- EXPERIENCE: Tailored bullet points for each position

Generate the tailored sections:`;
  }

  /**
   * Call the Gemini API with retry logic
   */
  private async callAPI(prompt: string, options: { temperature?: number; maxTokens?: number } = {}): Promise<string> {
    const url = `${this.apiEndpoint}?key=${this.apiKey}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? this.config.temperature,
        topK: this.config.topK,
        topP: this.config.topP,
        maxOutputTokens: options.maxTokens ?? this.config.maxOutputTokens
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data: GeminiResponse = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }

        throw new Error('No content generated');
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries - 1) {
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError || new Error('Failed to call API');
  }

  /**
   * Format answer with length constraints
   */
  private formatAnswer(rawAnswer: string, question: ScreeningQuestion): string {
    let answer = rawAnswer.trim();

    if (question.maxLength && answer.length > question.maxLength) {
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

    answer = answer.replace(/\n{3,}/g, '\n\n');
    return answer;
  }

  /**
   * Parse resume sections from AI response
   */
  private parseResumeSections(
    response: string,
    input: TailoredResumeInput
  ): TailoredResume['sections'] {
    const sections: TailoredResume['sections'] = {};

    // Simple parsing - in production, use more robust parsing
    const summaryMatch = response.match(/SUMMARY[:\s]*([^]*?)(?=SKILLS|EXPERIENCE|$)/i);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    const skillsMatch = response.match(/SKILLS[:\s]*([^]*?)(?=EXPERIENCE|$)/i);
    if (skillsMatch) {
      sections.skills = skillsMatch[1]
        .split(/[,\n•\-]/)
        .map(s => s.trim())
        .filter(Boolean);
    }

    if (input.userProfile.workExperience) {
      sections.experience = input.userProfile.workExperience.map(exp => ({
        original: exp,
        tailoredDescription: exp.description || '',
        highlightedAchievements: exp.achievements || []
      }));
    }

    return sections;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 20);
  }

  /**
   * Calculate ATS compatibility score
   */
  private calculateATSScore(sections: TailoredResume['sections'], jobData: JobData): number {
    let score = 70; // Base score

    const jobText = `${jobData.title} ${jobData.description} ${jobData.requirements}`.toLowerCase();
    const resumeText = `${sections.summary} ${sections.skills?.join(' ')}`.toLowerCase();

    // Check keyword overlap
    const jobWords = new Set(jobText.split(/\W+/).filter(w => w.length > 3));
    const resumeWords = resumeText.split(/\W+/).filter(w => w.length > 3);
    
    const matchedWords = resumeWords.filter(w => jobWords.has(w));
    score += Math.min(matchedWords.length * 2, 20);

    // Check structure
    if (sections.summary) score += 5;
    if (sections.skills && sections.skills.length > 5) score += 5;

    return Math.min(score, 100);
  }

  private calculateConfidence(response: string, question: ScreeningQuestion): number {
    let confidence = 0.7;
    if (response.length > 200) confidence += 0.1;
    if (response.includes('example') || response.includes('specifically')) confidence += 0.05;
    if (response.match(/\d+/)) confidence += 0.05;
    if (question.requiresResume) confidence += 0.05;
    return Math.min(confidence, 1.0);
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
