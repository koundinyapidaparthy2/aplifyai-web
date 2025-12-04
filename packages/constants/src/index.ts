// Firestore Collection Names
export const COLLECTIONS = {
    USERS: 'users',
    PROFILES: 'profiles',
    RESUMES: 'resumes',
    COVER_LETTERS: 'coverLetters',
    JOBS: 'jobs',
    CONTACT_SUBMISSIONS: 'contactSubmissions',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        SIGNUP: '/api/auth/signup',
        LOGOUT: '/api/auth/logout',
        VERIFY: '/api/auth/verify',
    },
    USERS: {
        PROFILE: '/api/users/profile',
        UPDATE: '/api/users/update',
    },
    JOBS: {
        LIST: '/api/jobs',
        CREATE: '/api/jobs/create',
        UPDATE: (id: string) => `/api/jobs/${id}`,
        DELETE: (id: string) => `/api/jobs/${id}`,
        SEARCH: '/api/jobs/search',
    },
    RESUMES: {
        GENERATE: '/api/resumes/generate',
        LIST: '/api/resumes',
        GET: (id: string) => `/api/resumes/${id}`,
        DELETE: (id: string) => `/api/resumes/${id}`,
    },
    COVER_LETTERS: {
        GENERATE: '/api/cover-letters/generate',
        LIST: '/api/cover-letters',
    },
    APPLICATIONS: {
        LIST: '/api/applications',
        CREATE: '/api/applications/create',
        UPDATE: (id: string) => `/api/applications/${id}`,
        DELETE: (id: string) => `/api/applications/${id}`,
    },
} as const;

// Configuration
export const CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.txt'],
    DEBOUNCE_DELAY: 300,
    API_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

// Job Boards
export const JOB_BOARDS = {
    LINKEDIN: 'linkedin.com',
    INDEED: 'indeed.com',
    GREENHOUSE: 'greenhouse.io',
    WORKDAY: 'workday.com',
    LEVER: 'lever.co',
    ASHBY: 'ashbyhq.com',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth-token',
    USER_DATA: 'userData',
    THEME: 'theme',
    LANGUAGE: 'language',
    ONBOARDING_COMPLETE: 'onboardingComplete',
    RECENT_SEARCHES: 'recentSearches',
    SAVED_JOBS: 'savedJobs',
} as const;

// Status Colors
export const STATUS_COLORS = {
    saved: 'gray',
    applied: 'primary',
    interview: 'warning',
    offer: 'success',
    rejected: 'danger',
    withdrawn: 'secondary',
} as const;

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    JOBS: '/jobs',
    APPLICATIONS: '/applications',
    RESUMES: '/resumes',
} as const;

// Feature Flags
export const FEATURES = {
    AI_ANSWERS: true,
    AUTO_FILL: true,
    COVER_LETTER_GEN: true,
    JOB_TRACKER: true,
    ANALYTICS: false,
} as const;
