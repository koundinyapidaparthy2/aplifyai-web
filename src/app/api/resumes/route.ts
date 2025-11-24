import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();

        // Get all resumes for the user
        const resumesSnapshot = await adminDb
            .collection(COLLECTIONS.RESUMES)
            .where('userId', '==', user.userId)
            .get();

        const resumes = resumesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        }));

        return NextResponse.json({
            success: true,
            count: resumes.length,
            resumes,
        });
    } catch (error: any) {
        console.error('Get resumes error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to get resumes' },
            { status: 500 }
        );
    }
}
