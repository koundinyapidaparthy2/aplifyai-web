/**
 * @aplifyai/ai-assistant
 * 
 * AI-powered job application assistant for:
 * - Detecting and answering screening questions
 * - Generating cover letters
 * - Tailoring resumes
 * - Auto-filling application forms
 */

// Main components
export { AIAssistantManager } from './AIAssistantManager';
export { QuestionDetector } from './QuestionDetector';
export { GeminiService, createGeminiService } from './GeminiService';
export { AnswerCache } from './AnswerCache';

// Mobile support
export { 
  createAIAssistantMobile, 
  isNative,
  default as AIAssistantMobile 
} from './mobile';

// Types
export type {
  // User and Job types
  UserProfile,
  WorkExperience,
  Education,
  JobData,
  
  // Question types
  ScreeningQuestion,
  QuestionType,
  
  // Answer types
  GeneratedAnswer,
  GenerationOptions,
  GenerationProgress,
  GenerationResult,
  GenerationError,
  CachedAnswer,
  
  // Fill types
  FillOptions,
  FillResult,
  
  // Cover letter types
  CoverLetterInput,
  CoverLetterStyle,
  GeneratedCoverLetter,
  
  // Resume types
  TailoredResumeInput,
  ResumeSectionToTailor,
  TailoredResume,
  TailoredExperience,
  
  // Job search types
  JobSearchCriteria,
  JobSearchResult,
  
  // Configuration types
  AIServiceConfig,
  AssistantState,
  
  // IPC types (for Electron)
  IPCEvents
} from './types';

// Mobile types
export type {
  AIAssistantMobileOptions,
  ScreeningQuestion as MobileScreeningQuestion,
  UserProfile as MobileUserProfile,
  JobData as MobileJobData
} from './mobile';
