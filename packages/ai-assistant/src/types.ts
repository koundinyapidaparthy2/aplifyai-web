// AI Assistant Types
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  educationLevel?: string;
  university?: string;
  major?: string;
  skills: string[];
  experienceSummary?: string;
  desiredSalary?: number;
  noticePeriod?: string;
  availableFrom?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
}

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  graduationDate?: string;
  gpa?: number;
}

export interface JobData {
  id?: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  requirements?: string;
  salary?: string;
  url?: string;
  postedDate?: string;
  applicationDeadline?: string;
}

export interface ScreeningQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  placeholder?: string;
  isRequired: boolean;
  maxLength?: number;
  currentValue?: string;
  requiresResearch?: boolean;
  requiresResume?: boolean;
  format?: 'STAR' | 'bullet' | 'paragraph';
  fieldSelector?: string;
  metadata?: Record<string, unknown>;
}

export type QuestionType =
  | 'companyInterest'
  | 'strengths'
  | 'weaknesses'
  | 'projectExperience'
  | 'careerMotivation'
  | 'salary'
  | 'availability'
  | 'workStyle'
  | 'technicalSkills'
  | 'generic';

export interface GeneratedAnswer {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  answer: string;
  fromCache: boolean;
  cacheId?: string;
  similarity?: number;
  generatedAt: string;
  tokenCount?: number;
  confidence?: number;
  userEdited?: boolean;
  editedAt?: string;
  metadata?: {
    model: string;
    temperature: number;
    maxLength?: number;
  };
}

export interface GenerationOptions {
  useCached?: boolean;
  skipFilled?: boolean;
  temperature?: number;
  maxTokens?: number;
  onProgress?: (progress: GenerationProgress) => void;
}

export interface GenerationProgress {
  current: number;
  total: number;
  question: string;
}

export interface GenerationResult {
  answers: GeneratedAnswer[];
  errors: GenerationError[];
  fromCache: GeneratedAnswer[];
  generated: GeneratedAnswer[];
}

export interface GenerationError {
  questionId: string;
  questionText: string;
  error: string;
}

export interface FillOptions {
  skipFilled?: boolean;
  simulateTyping?: boolean;
  delay?: number;
}

export interface FillResult {
  filled: { questionId: string; questionText: string; answerLength: number }[];
  skipped: { questionId: string; reason: string }[];
  errors: { questionId: string; error: string }[];
}

export interface CachedAnswer {
  id: string;
  questionText: string;
  questionType: QuestionType;
  answer: string;
  similarity: number;
  rating?: number;
  usageCount: number;
  createdAt: string;
  lastUsed: string;
}

// Cover Letter Types
export interface CoverLetterInput {
  userProfile: UserProfile;
  jobData: JobData;
  style?: CoverLetterStyle;
  customInstructions?: string;
}

export type CoverLetterStyle = 'formal' | 'conversational' | 'creative' | 'concise';

export interface GeneratedCoverLetter {
  id: string;
  content: string;
  jobId?: string;
  style: CoverLetterStyle;
  generatedAt: string;
  wordCount: number;
  metadata?: {
    model: string;
    temperature: number;
  };
}

// Resume Tailoring Types
export interface TailoredResumeInput {
  userProfile: UserProfile;
  jobData: JobData;
  originalResume?: string;
  sections?: ResumeSectionToTailor[];
}

export type ResumeSectionToTailor = 'summary' | 'skills' | 'experience' | 'education';

export interface TailoredResume {
  id: string;
  sections: {
    summary?: string;
    skills?: string[];
    experience?: TailoredExperience[];
  };
  keywords: string[];
  atsScore?: number;
  generatedAt: string;
}

export interface TailoredExperience {
  original: WorkExperience;
  tailoredDescription: string;
  highlightedAchievements: string[];
}

// Job Search Types
export interface JobSearchCriteria {
  query: string;
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  jobType?: 'fulltime' | 'parttime' | 'contract' | 'internship';
  datePosted?: 'today' | 'week' | 'month' | 'any';
  company?: string;
}

export interface JobSearchResult {
  jobs: JobData[];
  totalCount: number;
  page: number;
  pageSize: number;
  source: string;
}

// AI Service Configuration
export interface AIServiceConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  retryDelay?: number;
  temperature?: number;
  maxTokens?: number;
}

// Assistant State
export interface AssistantState {
  isActive: boolean;
  currentPage?: string;
  detectedQuestions: ScreeningQuestion[];
  generatedAnswers: Map<string, GeneratedAnswer>;
  isGenerating: boolean;
  lastError?: string;
}

// IPC Events (for Electron)
export interface IPCEvents {
  // From renderer to main
  'ai-assistant:initialize': { url: string };
  'ai-assistant:detect-questions': { formSelector?: string };
  'ai-assistant:generate-answers': { userProfile: UserProfile; jobData: JobData; options?: GenerationOptions };
  'ai-assistant:fill-form': { options?: FillOptions };
  'ai-assistant:generate-cover-letter': CoverLetterInput;
  'ai-assistant:tailor-resume': TailoredResumeInput;
  'ai-assistant:search-jobs': JobSearchCriteria;
  
  // From main to renderer
  'ai-assistant:state-changed': AssistantState;
  'ai-assistant:questions-detected': { questions: ScreeningQuestion[] };
  'ai-assistant:answers-generated': GenerationResult;
  'ai-assistant:form-filled': FillResult;
  'ai-assistant:cover-letter-generated': GeneratedCoverLetter;
  'ai-assistant:resume-tailored': TailoredResume;
  'ai-assistant:jobs-found': JobSearchResult;
  'ai-assistant:error': { code: string; message: string };
}
