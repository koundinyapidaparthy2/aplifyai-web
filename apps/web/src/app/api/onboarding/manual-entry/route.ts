import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();

        // Update profile with manual entry data
        const profileRef = adminDb.collection(COLLECTIONS.PROFILES).doc(user.userId);
        await profileRef.set(
            {
                ...body,
                updatedAt: new Date(),
            },
            { merge: true }
        );

        // Update onboarding step
        await adminDb.collection(COLLECTIONS.USERS).doc(user.userId).update({
            onboardingStep: 3, // Move to review step
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (error: any) {
        console.error('Manual entry error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to save profile' },
            { status: 500 }
        );
    }
}
