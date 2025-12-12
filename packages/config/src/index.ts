/**
 * @aplifyai/config
 * Centralized configuration for all Aplify AI platforms
 */

// ============================================================================
// Environment Detection
// ============================================================================

export type Platform = 'web' | 'electron' | 'capacitor' | 'extension';

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'web'; // Server-side rendering
  }

  // Check for Electron
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return 'electron';
  }

  // Check for Capacitor
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
    return 'capacitor';
  }

  // Check for Chrome Extension
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    return 'extension';
  }

  return 'web';
}

// ============================================================================
// AI Configuration (Gemini)
// ============================================================================

export interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIConfigOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_AI_CONFIG: Omit<AIConfig, 'apiKey'> = {
  model: 'gemini-2.5-flash',
  maxTokens: 8192,
  temperature: 0.7,
};

/**
 * Get AI configuration for Gemini API
 * Automatically resolves API key based on platform
 */
export async function getAIConfig(options?: AIConfigOptions): Promise<AIConfig> {
  const platform = detectPlatform();
  let apiKey = '';

  switch (platform) {
    case 'extension':
      // Chrome extension stores key in chrome.storage
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const result = await chrome.storage.local.get('geminiApiKey');
        apiKey = result.geminiApiKey || '';
      }
      break;

    case 'electron':
      // Electron can use environment variables or secure storage
      apiKey = process.env.GEMINI_API_KEY || '';
      // Also try electron secure storage via IPC
      if (!apiKey && typeof window !== 'undefined' && (window as any).electronAPI?.getSecureValue) {
        try {
          apiKey = await (window as any).electronAPI.getSecureValue('geminiApiKey') || '';
        } catch {
          // Fallback to env
        }
      }
      break;

    case 'capacitor':
      // Capacitor can use secure storage or preferences
      if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.Preferences) {
        try {
          const result = await (window as any).Capacitor.Plugins.Preferences.get({ key: 'geminiApiKey' });
          apiKey = result.value || '';
        } catch {
          // Fallback to env
        }
      }
      if (!apiKey) {
        apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
      }
      break;

    case 'web':
    default:
      // Web uses environment variables
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
      break;
  }

  return {
    apiKey,
    model: options?.model || DEFAULT_AI_CONFIG.model,
    maxTokens: options?.maxTokens || DEFAULT_AI_CONFIG.maxTokens,
    temperature: options?.temperature || DEFAULT_AI_CONFIG.temperature,
  };
}

/**
 * Set AI API key for the current platform
 */
export async function setAIApiKey(apiKey: string): Promise<void> {
  const platform = detectPlatform();

  switch (platform) {
    case 'extension':
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.set({ geminiApiKey: apiKey });
      }
      break;

    case 'electron':
      if (typeof window !== 'undefined' && (window as any).electronAPI?.setSecureValue) {
        await (window as any).electronAPI.setSecureValue('geminiApiKey', apiKey);
      }
      break;

    case 'capacitor':
      if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.Preferences) {
        await (window as any).Capacitor.Plugins.Preferences.set({ key: 'geminiApiKey', value: apiKey });
      }
      break;

    default:
      console.warn('Cannot set API key on web platform. Use environment variables instead.');
      break;
  }
}

// ============================================================================
// Firebase Configuration
// ============================================================================

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

// ============================================================================
// API Configuration
// ============================================================================

export interface APIConfig {
  baseUrl: string;
  resumeGeneratorUrl: string;
  latexServiceUrl: string;
}

export function getAPIConfig(): APIConfig {
  const platform = detectPlatform();

  // For native platforms, we need absolute URLs
  const isNative = platform === 'electron' || platform === 'capacitor';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ||
    (isNative ? 'https://api.aplify.ai' : '');

  return {
    baseUrl,
    resumeGeneratorUrl: process.env.RESUME_GENERATOR_URL || 'http://localhost:3000',
    latexServiceUrl: process.env.LATEX_PDF_SERVICE_URL || 'http://localhost:8080',
  };
}

// ============================================================================
// Auth Configuration
// ============================================================================

export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: string;
  cookieName: string;
  secureCookie: boolean;
}

export function getAuthConfig(): AuthConfig {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    jwtSecret: process.env.JWT_SECRET || 'development-secret-change-in-production',
    tokenExpiry: '7d',
    cookieName: 'auth_token',
    secureCookie: isProduction,
  };
}

// ============================================================================
// OAuth Configuration
// ============================================================================

export interface OAuthConfig {
  google: {
    clientId: string;
    clientSecret: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
  };
  apple: {
    clientId: string;
    clientSecret: string;
  };
}

export function getOAuthConfig(): OAuthConfig {
  return {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    },
  };
}

// ============================================================================
// Storage Configuration
// ============================================================================

export interface StorageConfig {
  gcpProjectId: string;
  gcpBucketName: string;
  gcpCredentialsPath?: string;
}

export function getStorageConfig(): StorageConfig {
  return {
    gcpProjectId: process.env.GCP_PROJECT_ID || '',
    gcpBucketName: process.env.GCP_BUCKET_NAME || '',
    gcpCredentialsPath: process.env.GCP_CREDENTIALS_PATH,
  };
}

// ============================================================================
// App Configuration
// ============================================================================

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  appUrl: string;
  supportEmail: string;
}

export function getAppConfig(): AppConfig {
  const env = process.env.NODE_ENV || 'development';

  return {
    name: 'Aplify AI',
    version: '1.0.0',
    environment: env as 'development' | 'staging' | 'production',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: 'support@aplify.ai',
  };
}

// ============================================================================
// Feature Flags
// ============================================================================

export interface FeatureFlags {
  aiOnboarding: boolean;
  aiResumeGeneration: boolean;
  aiCoverLetter: boolean;
  aiJobMatching: boolean;
  aiInterviewPrep: boolean;
  aiAutoFill: boolean;
  premiumFeatures: boolean;
}

export function getFeatureFlags(): FeatureFlags {
  return {
    aiOnboarding: true,
    aiResumeGeneration: true,
    aiCoverLetter: true,
    aiJobMatching: true,
    aiInterviewPrep: true,
    aiAutoFill: true,
    premiumFeatures: process.env.ENABLE_PREMIUM === 'true',
  };
}

// ============================================================================
// Pricing Configuration
// ============================================================================

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  aiCredits: number;
  resumeTemplates: number;
  coverLetterLimit: number;
  jobApplications: number;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'monthly',
    features: [
      'Basic resume builder',
      '1 resume template',
      '3 AI-generated cover letters/month',
      '10 job applications/month',
      'Basic job matching',
    ],
    aiCredits: 100,
    resumeTemplates: 1,
    coverLetterLimit: 3,
    jobApplications: 10,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    billingPeriod: 'monthly',
    features: [
      'Advanced resume builder',
      'All resume templates',
      'Unlimited AI cover letters',
      'Unlimited job applications',
      'AI-powered resume tailoring',
      'Advanced job matching',
      'Interview preparation',
      'Priority support',
    ],
    aiCredits: 5000,
    resumeTemplates: -1, // unlimited
    coverLetterLimit: -1,
    jobApplications: -1,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    billingPeriod: 'monthly',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom branding',
      'API access',
      'Dedicated support',
      'Analytics dashboard',
      'Bulk operations',
    ],
    aiCredits: -1, // unlimited
    resumeTemplates: -1,
    coverLetterLimit: -1,
    jobApplications: -1,
  },
];

export function getPricingTier(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === tierId);
}

// ============================================================================
// Service Costs (Internal - for cost tracking)
// ============================================================================

export interface ServiceCosts {
  geminiApiPerToken: number;
  firebaseReadsPerUnit: number;
  firebaseWritesPerUnit: number;
  gcpStoragePerGB: number;
  cloudRunPerRequest: number;
  latexServicePerPdf: number;
}

export const SERVICE_COSTS: ServiceCosts = {
  geminiApiPerToken: 0.000001, // $0.001 per 1000 tokens (Gemini Flash)
  firebaseReadsPerUnit: 0.0000006, // $0.06 per 100k reads
  firebaseWritesPerUnit: 0.000018, // $0.18 per 100k writes
  gcpStoragePerGB: 0.02, // $0.02 per GB/month
  cloudRunPerRequest: 0.0000004, // $0.40 per million requests
  latexServicePerPdf: 0.001, // Estimated cost per PDF generation
};

// ============================================================================
// Collections (Firestore)
// ============================================================================

export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  RESUMES: 'resumes',
  COVER_LETTERS: 'coverLetters',
  JOB_APPLICATIONS: 'jobApplications',
  SAVED_JOBS: 'savedJobs',
  AI_CONVERSATIONS: 'aiConversations',
  SUBSCRIPTIONS: 'subscriptions',
  USAGE_METRICS: 'usageMetrics',
} as const;

// ============================================================================
// Export All
// ============================================================================

export default {
  detectPlatform,
  getAIConfig,
  setAIApiKey,
  getFirebaseConfig,
  getAPIConfig,
  getAuthConfig,
  getOAuthConfig,
  getStorageConfig,
  getAppConfig,
  getFeatureFlags,
  getPricingTier,
  PRICING_TIERS,
  SERVICE_COSTS,
  COLLECTIONS,
};
