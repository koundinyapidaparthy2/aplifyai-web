/**
 * Capacitor Plugin for AI Job Assistant
 * 
 * Provides native functionality for mobile apps:
 * - In-app browser for job sites
 * - Form injection for autofill
 * - Background processing
 * - Notifications
 * 
 * Note: Capacitor dependencies should be installed in the consuming app
 */

// Type declarations for Capacitor (to avoid hard dependency)
interface CapacitorBrowser {
  open: (options: { url: string; presentationStyle?: string; toolbarColor?: string }) => Promise<void>;
  close: () => Promise<void>;
  addListener: (event: string, callback: () => void) => void;
}

interface CapacitorApp {
  addListener: (event: string, callback: (data: Record<string, unknown>) => void) => void;
}

interface CapacitorGlobal {
  isNativePlatform: () => boolean;
  Plugins: {
    Browser?: CapacitorBrowser;
    App?: CapacitorApp;
  };
}

// Get Capacitor from window if available
const getCapacitor = (): CapacitorGlobal | null => {
  if (typeof window !== 'undefined' && (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor) {
    return (window as unknown as { Capacitor: CapacitorGlobal }).Capacitor;
  }
  return null;
};


export interface AIAssistantMobileOptions {
  apiKey: string;
  onQuestionDetected?: (questions: ScreeningQuestion[]) => void;
  onPageChanged?: (url: string, title: string) => void;
}

export interface ScreeningQuestion {
  id: string;
  type: string;
  questionText: string;
  isRequired: boolean;
  fieldSelector: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  experienceSummary?: string;
}

export interface JobData {
  title: string;
  company: string;
  description?: string;
  url?: string;
}

class AIAssistantMobile {
  private apiKey: string;
  private userProfile: UserProfile | null = null;
  private currentJobData: JobData | null = null;
  private onQuestionDetected?: (questions: ScreeningQuestion[]) => void;
  private onPageChanged?: (url: string, title: string) => void;
  
  constructor(options: AIAssistantMobileOptions) {
    this.apiKey = options.apiKey;
    this.onQuestionDetected = options.onQuestionDetected;
    this.onPageChanged = options.onPageChanged;
  }

  /**
   * Check if running on mobile
   */
  static isNative(): boolean {
    const capacitor = getCapacitor();
    return capacitor?.isNativePlatform() ?? false;
  }

  /**
   * Set user profile
   */
  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
  }

  /**
   * Set current job data
   */
  setJobData(jobData: JobData): void {
    this.currentJobData = jobData;
  }

  /**
   * Open job site in in-app browser
   */
  async openJobSite(url: string): Promise<void> {
    const capacitor = getCapacitor();
    const browser = capacitor?.Plugins.Browser;
    
    if (!capacitor?.isNativePlatform() || !browser) {
      window.open(url, '_blank');
      return;
    }

    await browser.open({
      url,
      presentationStyle: 'popover',
      toolbarColor: '#6366f1', // Indigo color to match app theme
    });

    // Listen for URL changes
    browser.addListener('browserPageLoaded', () => {
      this.onPageChanged?.(url, 'Job Application');
    });
  }

  /**
   * Close in-app browser
   */
  async closeJobSite(): Promise<void> {
    const capacitor = getCapacitor();
    const browser = capacitor?.Plugins.Browser;
    
    if (browser) {
      await browser.close();
    }
  }

  /**
   * Generate answer for a question (simplified for mobile)
   */
  async generateAnswer(question: ScreeningQuestion): Promise<string> {
    if (!this.userProfile || !this.currentJobData) {
      throw new Error('Profile and job data required');
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: this.buildPrompt(question)
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate answer';
  }

  /**
   * Build prompt for answer generation
   */
  private buildPrompt(question: ScreeningQuestion): string {
    const profile = this.userProfile!;
    const job = this.currentJobData!;

    return `You are helping a job applicant answer a screening question.

CANDIDATE: ${profile.firstName} ${profile.lastName}
SKILLS: ${profile.skills.join(', ')}
${profile.experienceSummary ? `EXPERIENCE: ${profile.experienceSummary}` : ''}

JOB: ${job.title} at ${job.company}
${job.description ? `DESCRIPTION: ${job.description.substring(0, 300)}...` : ''}

QUESTION: ${question.questionText}

Please provide a professional, concise answer (100-200 words):`;
  }

  /**
   * Copy text to clipboard (mobile-friendly)
   */
  async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  /**
   * Share generated content (native share sheet)
   */
  async share(title: string, text: string): Promise<void> {
    if (navigator.share) {
      await navigator.share({ title, text });
    } else {
      await this.copyToClipboard(text);
      alert('Content copied to clipboard');
    }
  }

  /**
   * Handle app state changes
   */
  setupAppLifecycle(): void {
    const capacitor = getCapacitor();
    const appPlugin = capacitor?.Plugins.App;
    
    if (!appPlugin) return;
    
    appPlugin.addListener('appStateChange', (data: Record<string, unknown>) => {
      if (data.isActive) {
        // App resumed - could refresh data here
        console.log('App resumed');
      }
    });

    appPlugin.addListener('backButton', () => {
      // Handle back button on Android
      console.log('Back button pressed');
    });
  }
}

// Factory function
export function createAIAssistantMobile(options: AIAssistantMobileOptions): AIAssistantMobile {
  return new AIAssistantMobile(options);
}

// Quick access functions
export const isNative = AIAssistantMobile.isNative;

export default AIAssistantMobile;
