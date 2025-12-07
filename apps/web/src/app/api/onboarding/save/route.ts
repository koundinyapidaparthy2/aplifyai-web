import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/auth';
import { COLLECTIONS } from '@/types/firestore';

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth();
        const payload = await req.json();

        if (!user.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const batch = adminDb.batch();

        // 1. Update User Document (Auth flag)
        const userRef = adminDb.collection(COLLECTIONS.USERS).doc(user.userId);
        batch.update(userRef, {
            onboardingComplete: true,
            updatedAt: new Date()
        });

        // 2. Update/Create Profile Document (Detailed Info)
        const profileRef = adminDb.collection(COLLECTIONS.PROFILES).doc(user.userId);
        batch.set(profileRef, {
            ...payload,
            userId: user.userId,
            updatedAt: new Date()
        }, { merge: true });

        await batch.commit();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save profile error:', error);
        return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }
}
