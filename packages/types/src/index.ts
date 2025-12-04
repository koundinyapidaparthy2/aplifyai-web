// ============================================
// User Types
// ============================================

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    onboardingComplete?: boolean;
    createdAt?: Date;
    lastLoginAt?: Date;
}

// User Document Type (Firestore)
export interface UserDocument {
    id: string;
    email: string;
    password?: string; // hashed, optional for OAuth users
    firstName?: string;
    lastName?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    profilePicture?: string;
    image?: string; // Profile picture from OAuth providers

    // OAuth
    provider?: 'email' | 'google' | 'github' | 'apple';
    providerId?: string;

    // Onboarding
    onboardingComplete: boolean;
    onboardingStep: number;

    // Email verification
    emailVerified: boolean;
    verificationToken?: string;

    // Password reset
    resetToken?: string;
    resetTokenExpiry?: Date;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

// ============================================
// Profile Types
// ============================================

export interface ProfileDocument {
    id: string;
    userId: string;

    // Personal info
    summary?: string;
    location?: string;

    // Professional details (stored as JSON)
    experience?: ExperienceItem[];
    education?: EducationItem[];
    skills?: SkillCategory[];
    projects?: ProjectItem[];
    certifications?: CertificationItem[];

    // Preferences
    preferences?: UserPreferences;

    createdAt: Date;
    updatedAt: Date;
}

export type Profile = ProfileDocument;

// Experience Item
export interface ExperienceItem {
    company: string;
    title: string;
    period: string;
    location?: string;
    technologies?: string;
    achievements: string[];
}

// Education Item
export interface EducationItem {
    institution: string;
    degree: string;
    period: string;
    location?: string;
    gpa?: string;
    coursework?: string;
}

// Skill Category
export interface SkillCategory {
    category: string;
    items: string;
}

// Project Item
export interface ProjectItem {
    name: string;
    links?: string;
    technologies: string;
    details: string[];
}

// Certification Item
export interface CertificationItem {
    name: string;
    url?: string;
    issuer?: string;
    date?: string;
}

// User Preferences
export interface UserPreferences {
    // Resume preferences
    tasksPerExperience?: {
        min: number;
        max: number;
    };

    // Cover letter preferences
    coverLetter?: {
        tone?: 'professional' | 'enthusiastic' | 'formal' | 'conversational';
        length?: 'short' | 'medium' | 'long';
        focusAreas?: string;
        includePersonalTouch?: boolean;
        emphasizeAchievements?: boolean;
    };
}

// ============================================
// Job Types
// ============================================

export interface Job {
    id: string;
    title: string;
    company: string;
    description: string;
    url: string;
    location?: string;
    salary?: {
        min: number;
        max: number;
        currency: string;
    };
    jobType?: string;
    remote?: boolean;
    skills?: string[];
    postedDate?: string;
    source?: string;
    detectedAt?: string;
}

// Job Document Type (Firestore)
export interface JobDocument {
    id: string;
    userId: string;

    // Job details
    companyName: string;
    jobTitle: string;
    jobDescription?: string;
    jobUrl?: string;
    location?: string;
    salary?: string;

    // Application status
    status: JobApplicationStatus;
    appliedDate?: Date;

    // Associated documents
    resumeId?: string;
    coverLetterId?: string;

    // Notes
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

export type JobApplicationStatus = 'interested' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'draft' | 'interview' | 'offer';

export enum JobStatus {
    Saved = 'saved',
    Applied = 'applied',
    Interview = 'interview',
    Offer = 'offer',
    Rejected = 'rejected',
    Withdrawn = 'withdrawn',
}

export interface JobApplication {
    id: string;
    userId: string;
    jobId: string;
    status: JobStatus;
    appliedAt?: Date;
    notes?: string;
    resumeId?: string;
}

// ============================================
// Resume Types
// ============================================

export interface Resume {
    id: string;
    userId: string;
    jobId?: string;
    pdfUrl: string;
    coverLetterUrl?: string;
    templateId?: string;
    createdAt: Date;
}

// Resume Document Type (Firestore)
export interface ResumeDocument {
    id: string;
    userId: string;

    // Resume details
    title: string;
    templateId: string;
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;

    // Generated content
    content: any; // JSON object
    pdfUrl?: string;
    texUrl?: string;

    // Metadata
    status: 'draft' | 'generated' | 'downloaded';
    generatedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Cover Letter Types
// ============================================

export interface CoverLetterDocument {
    id: string;
    userId: string;

    // Cover letter details
    title: string;
    companyName: string;
    jobTitle: string;
    jobDescription: string;

    // Generated content
    content: string;
    pdfUrl?: string;

    // Preferences used
    preferences?: {
        tone?: string;
        length?: string;
        focusAreas?: string;
        includePersonalTouch?: boolean;
        emphasizeAchievements?: boolean;
        customInstructions?: string;
    };

    // Metadata
    status: 'draft' | 'generated' | 'downloaded';
    generatedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export type CoverLetter = CoverLetterDocument;

// ============================================
// Contact Types
// ============================================

export interface ContactSubmissionDocument {
    id: string;
    name: string;
    email: string;
    subject?: string;
    message: string;
    status: 'new' | 'read' | 'responded';
    createdAt: Date;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}
