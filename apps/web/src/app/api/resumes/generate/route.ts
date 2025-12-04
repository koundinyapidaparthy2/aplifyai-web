import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';
import { resumeGeneratorClient, transformProfileToUserData } from '@/lib/resume-generator-client';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();

        // Validate required fields
        const { companyName, jobTitle, jobDescription } = body;
        if (!companyName || !jobTitle || !jobDescription) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields',
                    message: 'companyName, jobTitle, and jobDescription are required',
                },
                { status: 400 }
            );
        }

        // Get user profile
        const profileDoc = await adminDb.collection(COLLECTIONS.PROFILES).doc(user.userId).get();
        const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(user.userId).get();

        if (!profileDoc.exists) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Profile not found',
                    message: 'Please complete your profile first',
                },
                { status: 404 }
            );
        }

        const profile = profileDoc.data();
        const userData = userDoc.data();

        // Transform profile to resume-generator format
        const userDataFormatted = transformProfileToUserData(profile, userData);

        // Prepare request for resume-generator
        const generateRequest = {
            companyName,
            jobTitle,
            jobDescription,
            missingSkills: [], // Empty array for now, can be enhanced later
            userData: userDataFormatted,
            templateId: body.templateId || 'software-engineer',
            templateConfig: body.templateConfig || {},
        };

        console.log('📄 Generating resume with resume-generator service...');

        // Call resume-generator service
        const result = await resumeGeneratorClient.generateResume(generateRequest);

        if (!result.success || !result.pdfUrl) {
            throw new Error(result.error || 'Resume generation failed');
        }

        console.log('✅ Resume generated successfully:', result.pdfUrl);

        // Create job record
        const jobRef = adminDb.collection(COLLECTIONS.JOBS).doc();
        const jobData = {
            userId: user.userId,
            companyName,
            jobTitle,
            jobDescription,
            jobUrl: body.jobUrl || null,
            status: 'draft',
            notes: body.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await jobRef.set(jobData);

        // Create resume record
        const resumeRef = adminDb.collection(COLLECTIONS.RESUMES).doc();
        const resumeData = {
            userId: user.userId,
            jobId: jobRef.id,
            companyName,
            jobTitle,
            templateId: result.templateId || body.templateId || 'template-001',
            templateConfig: body.templateConfig || {},
            pdfUrl: result.pdfUrl,
            gcsPath: result.pdfUrl.split('/').slice(-2).join('/'), // Extract bucket path
            createdAt: new Date(),
        };

        await resumeRef.set(resumeData);

        // Update job with resume ID
        await jobRef.update({ resumeId: resumeRef.id });

        return NextResponse.json({
            success: true,
            jobId: jobRef.id,
            resumeId: resumeRef.id,
            pdfUrl: result.pdfUrl,
            templateId: result.templateId,
            message: 'Resume generated successfully',
        });
    } catch (error: any) {
        console.error('Resume generation error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to generate resume',
            },
            { status: 500 }
        );
    }
}
