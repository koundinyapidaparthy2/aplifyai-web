import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user data from Firestore
        const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(user.userId).get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        return NextResponse.json({
            success: true,
            user: {
                id: userDoc.id,
                email: userData?.email,
                firstName: userData?.firstName || null,
                lastName: userData?.lastName || null,
                phone: userData?.phone || null,
                linkedin: userData?.linkedin || null,
                github: userData?.github || null,
                portfolio: userData?.portfolio || null,
                profilePicture: userData?.profilePicture || null,
                onboardingComplete: userData?.onboardingComplete || false,
                onboardingStep: userData?.onboardingStep || 0,
                emailVerified: userData?.emailVerified || false,
                createdAt: userData?.createdAt,
                lastLoginAt: userData?.lastLoginAt,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
