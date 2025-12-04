import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();

        // Get user profile
        const profileDoc = await adminDb.collection(COLLECTIONS.PROFILES).doc(user.userId).get();

        if (!profileDoc.exists) {
            return NextResponse.json({
                success: true,
                profile: {
                    userId: user.userId,
                    summary: null,
                    location: null,
                    experience: [],
                    education: [],
                    skills: [],
                    projects: [],
                    certifications: [],
                },
            });
        }

        return NextResponse.json({
            success: true,
            profile: {
                id: profileDoc.id,
                ...profileDoc.data(),
            },
        });
    } catch (error: any) {
        console.error('Get profile error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to get profile' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();

        // Update profile
        const profileRef = adminDb.collection(COLLECTIONS.PROFILES).doc(user.userId);
        await profileRef.set(
            {
                ...body,
                userId: user.userId,
                updatedAt: new Date(),
            },
            { merge: true }
        );

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (error: any) {
        console.error('Update profile error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
