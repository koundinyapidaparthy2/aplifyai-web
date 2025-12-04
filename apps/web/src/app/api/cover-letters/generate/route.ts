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
        const { companyName, jobTitle, jobDescription, jobId } = body;
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
            userData: userDataFormatted,
            jsonResponse: true,
            id: `${companyName}-${jobTitle}-${Date.now()}`,
            preferences: body.preferences || {
                tone: 'professional',
                length: 'medium',
            },
        };

        console.log('📝 Generating cover letter with resume-generator service...');

        // Call resume-generator service
        const result = await resumeGeneratorClient.generateCoverLetter(generateRequest);

        if (!result.success || !result.coverLetterUrl) {
            throw new Error(result.error || 'Cover letter generation failed');
        }

        console.log('✅ Cover letter generated successfully:', result.coverLetterUrl);

        // Create cover letter record
        const coverLetterRef = adminDb.collection(COLLECTIONS.COVER_LETTERS).doc();
        const coverLetterData = {
            userId: user.userId,
            jobId: jobId || null,
            companyName,
            jobTitle,
            text: '', // Cover letter service doesn't return text in current implementation
            pdfUrl: result.coverLetterUrl,
            gcsPath: result.coverLetterUrl.split('/').slice(-2).join('/'),
            preferences: body.preferences || {},
            createdAt: new Date(),
        };

        await coverLetterRef.set(coverLetterData);

        // If jobId provided, update job with cover letter ID
        if (jobId) {
            const jobRef = adminDb.collection(COLLECTIONS.JOBS).doc(jobId);
            const jobDoc = await jobRef.get();

            if (jobDoc.exists && jobDoc.data()?.userId === user.userId) {
                await jobRef.update({
                    coverLetterId: coverLetterRef.id,
                    updatedAt: new Date(),
                });
            }
        }

        return NextResponse.json({
            success: true,
            coverLetterId: coverLetterRef.id,
            pdfUrl: result.coverLetterUrl,
            text: '', // Not returned by current implementation
            message: 'Cover letter generated successfully',
        });
    } catch (error: any) {
        console.error('Cover letter generation error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to generate cover letter',
            },
            { status: 500 }
        );
    }
}
