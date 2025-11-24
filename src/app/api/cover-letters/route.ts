import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();

        // Get all cover letters for the user
        const coverLettersSnapshot = await adminDb
            .collection(COLLECTIONS.COVER_LETTERS)
            .where('userId', '==', user.userId)
            .get();

        const coverLetters = coverLettersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        }));

        return NextResponse.json({
            success: true,
            count: coverLetters.length,
            coverLetters,
        });
    } catch (error: any) {
        console.error('Get cover letters error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to get cover letters' },
            { status: 500 }
        );
    }
}
