import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb } from '@/lib/firebase-admin';
import { createToken, setAuthCookie } from '@/lib/auth';
import { COLLECTIONS } from '@/types/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const usersRef = adminDb.collection(COLLECTIONS.USERS);
        const userSnapshot = await usersRef.where('email', '==', email.toLowerCase()).get();

        if (userSnapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Verify password
        const isValidPassword = await bcrypt.compare(password, userData.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Update last login
        await userDoc.ref.update({
            lastLoginAt: new Date(),
        });

        // Create JWT token
        const token = await createToken({
            userId,
            email: userData.email,
        });

        // Set cookie
        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: userId,
                email: userData.email,
                firstName: userData.firstName || null,
                lastName: userData.lastName || null,
                onboardingComplete: userData.onboardingComplete || false,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
