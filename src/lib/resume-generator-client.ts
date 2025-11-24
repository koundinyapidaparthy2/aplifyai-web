// Resume Generator Service Client
// Integrates with the existing resume-generator service

const RESUME_GENERATOR_URL = process.env.RESUME_GENERATOR_URL || 'http://localhost:3000';
const RESUME_GENERATOR_API_KEY = process.env.RESUME_GENERATOR_API_KEY || '';

export interface UserData {
    personalInfo: {
        name: string;
        email: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        portfolio?: string;
        location?: string;
    };
    summary?: string;
    experience: Array<{
        company: string;
        title: string;
        period: string;
        location?: string;
        technologies?: string;
        achievements: string[];
    }>;
    education: Array<{
        institution: string;
        degree: string;
        period: string;
        location?: string;
        gpa?: string;
        coursework?: string;
    }>;
    skills: Array<{
        category: string;
        items: string;
    }>;
    projects?: Array<{
        name: string;
        links?: string;
        technologies?: string;
        details: string[];
    }>;
    certifications?: Array<{
        name: string;
        url?: string;
        issuer?: string;
        date?: string;
    }>;
}

export interface GenerateResumeRequest {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    userData: UserData;
    templateId?: string;
    templateConfig?: {
        colorScheme?: string;
        fontSize?: string;
        [key: string]: any;
    };
}

export interface GenerateResumeResponse {
    success: boolean;
    pdfUrl?: string;
    coverLetterUrl?: string;
    templateId?: string;
    timestamp?: string;
    error?: string;
}

export interface GenerateCoverLetterRequest {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    userData: UserData;
    jsonResponse?: boolean;
    id?: string;
    preferences?: {
        tone?: string;
        length?: string;
    };
}

export interface Template {
    id: string;
    name: string;
    description: string;
    preview?: string;
    customizable?: boolean;
    options?: {
        colorScheme?: string[];
        fontSize?: string[];
    };
}

export class ResumeGeneratorClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(baseUrl?: string, apiKey?: string) {
        this.baseUrl = baseUrl || RESUME_GENERATOR_URL;
        this.apiKey = apiKey || RESUME_GENERATOR_API_KEY;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'x-api-key': this.apiKey }),
            ...options.headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async generateResume(data: GenerateResumeRequest): Promise<GenerateResumeResponse> {
        return this.request<GenerateResumeResponse>('/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async generateCoverLetter(data: GenerateCoverLetterRequest): Promise<any> {
        return this.request('/cover-letter', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getTemplates(): Promise<{ success: boolean; templates: Template[] }> {
        return this.request('/api/templates');
    }

    async getTemplate(id: string): Promise<{ success: boolean; template: Template }> {
        return this.request(`/api/templates/${id}`);
    }

    async healthCheck(): Promise<{ timestamp: string }> {
        return this.request('/timestamp');
    }
}

// Transform Firestore profile to resume-generator UserData format
export function transformProfileToUserData(profile: any, user: any): UserData {
    return {
        personalInfo: {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
            email: user.email,
            phone: profile.phone || undefined,
            linkedin: profile.linkedin || undefined,
            github: profile.github || undefined,
            portfolio: profile.portfolio || undefined,
            location: profile.location || undefined,
        },
        summary: profile.summary || undefined,
        experience: Array.isArray(profile.experience) ? profile.experience : [],
        education: Array.isArray(profile.education) ? profile.education : [],
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        projects: Array.isArray(profile.projects) ? profile.projects : undefined,
        certifications: Array.isArray(profile.certifications) ? profile.certifications : undefined,
    };
}

// Singleton instance
export const resumeGeneratorClient = new ResumeGeneratorClient();
