// Types (local definitions to avoid cross-package dependency issues)
export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    onboardingComplete?: boolean;
    createdAt?: Date;
    lastLoginAt?: Date;
}

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

export interface Resume {
    id: string;
    userId: string;
    jobId?: string;
    pdfUrl: string;
    coverLetterUrl?: string;
    templateId?: string;
    createdAt: Date;
}

export interface JobApplication {
    id: string;
    userId: string;
    jobId: string;
    status: string;
    appliedAt?: Date;
    notes?: string;
    resumeId?: string;
}

// Mock users
export const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    onboardingComplete: true,
    createdAt: new Date('2024-01-01'),
};

export const mockUsers: User[] = [
    mockUser,
    {
        id: 'user-456',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        onboardingComplete: false,
    },
];

// Mock jobs
export const mockJob: Job = {
    id: 'job-123',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    description: 'We are looking for a senior software engineer...',
    url: 'https://example.com/jobs/123',
    location: 'San Francisco, CA',
    salary: {
        min: 150000,
        max: 200000,
        currency: 'USD',
    },
    remote: true,
    skills: ['React', 'TypeScript', 'Node.js'],
    source: 'linkedin',
};

export const mockJobs: Job[] = [
    mockJob,
    {
        id: 'job-456',
        title: 'Frontend Developer',
        company: 'Startup Inc',
        description: 'Join our growing team...',
        url: 'https://example.com/jobs/456',
        location: 'Remote',
        remote: true,
        skills: ['React', 'CSS'],
        source: 'indeed',
    },
];

// Mock resumes
export const mockResume: Resume = {
    id: 'resume-123',
    userId: 'user-123',
    jobId: 'job-123',
    pdfUrl: 'https://example.com/resumes/123.pdf',
    coverLetterUrl: 'https://example.com/cover-letters/123.pdf',
    createdAt: new Date('2024-01-15'),
};

// Mock applications
export const mockApplication: JobApplication = {
    id: 'app-123',
    userId: 'user-123',
    jobId: 'job-123',
    status: 'applied',
    appliedAt: new Date('2024-01-20'),
    notes: 'Great opportunity!',
    resumeId: 'resume-123',
};

// Test helpers
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiResponse = <T>(data: T, delay: number = 100) => {
    return new Promise<{ success: boolean; data: T }>((resolve) => {
        setTimeout(() => {
            resolve({ success: true, data });
        }, delay);
    });
};

export const mockApiError = (message: string, delay: number = 100) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(message));
        }, delay);
    });
};
