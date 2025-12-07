import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/auth';
import { COLLECTIONS } from '@/types/firestore';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();

        if (!user.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profileRef = adminDb.collection(COLLECTIONS.PROFILES).doc(user.userId);
        const profileDoc = await profileRef.get();

        if (!profileDoc.exists) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: profileDoc.data()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
