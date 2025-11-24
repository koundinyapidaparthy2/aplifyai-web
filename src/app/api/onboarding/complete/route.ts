import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();

        // Mark onboarding as complete
        await adminDb.collection(COLLECTIONS.USERS).doc(user.userId).update({
            onboardingComplete: true,
            onboardingStep: 4,
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Onboarding completed successfully',
        });
    } catch (error: any) {
        console.error('Complete onboarding error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to complete onboarding' },
            { status: 500 }
        );
    }
}
