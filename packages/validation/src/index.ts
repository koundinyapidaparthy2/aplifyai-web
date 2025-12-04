import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
});

// Job schemas
export const jobSchema = z.object({
    title: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    url: z.string().url('Invalid URL'),
    location: z.string().optional(),
    salary: z.object({
        min: z.number().positive(),
        max: z.number().positive(),
        currency: z.string().default('USD'),
    }).optional(),
    remote: z.boolean().optional(),
    skills: z.array(z.string()).optional(),
});

// Application schema
export const applicationSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    status: z.enum(['saved', 'applied', 'interview', 'offer', 'rejected', 'withdrawn']),
    notes: z.string().optional(),
    resumeId: z.string().optional(),
});

// Profile schema
export const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number').optional(),
    location: z.string().optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// Resume generation schema
export const resumeGenerationSchema = z.object({
    jobTitle: z.string().min(1, 'Job title is required'),
    companyName: z.string().min(1, 'Company name is required'),
    jobDescription: z.string().min(10, 'Job description is required'),
    templateId: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ResumeGenerationInput = z.infer<typeof resumeGenerationSchema>;
