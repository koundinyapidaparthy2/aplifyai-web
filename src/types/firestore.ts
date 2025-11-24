// Firestore Collection Names
export const COLLECTIONS = {
    USERS: 'users',
    PROFILES: 'profiles',
    RESUMES: 'resumes',
    COVER_LETTERS: 'coverLetters',
    JOBS: 'jobs',
    CONTACT_SUBMISSIONS: 'contactSubmissions',
} as const;

// User Document Type
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

export type User = UserDocument;

// Profile Document Type
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

// Resume Document Type
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

export type Resume = ResumeDocument;

// Cover Letter Document Type
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

// Job Document Type
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
    status: 'interested' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'draft' | 'interview' | 'offer';
    appliedDate?: Date;

    // Associated documents
    resumeId?: string;
    coverLetterId?: string;

    // Notes
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

export type Job = JobDocument;

// Contact Submission Document Type
export interface ContactSubmissionDocument {
    id: string;
    name: string;
    email: string;
    subject?: string;
    message: string;
    status: 'new' | 'read' | 'responded';
    createdAt: Date;
}
