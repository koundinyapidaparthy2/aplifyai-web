import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb } from '@/lib/firebase-admin';
import { createToken, setAuthCookie } from '@/lib/auth';
import { COLLECTIONS, UserDocument } from '@/types/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const usersRef = adminDb.collection(COLLECTIONS.USERS);
        const existingUser = await usersRef.where('email', '==', email.toLowerCase()).get();

        if (!existingUser.empty) {
            return NextResponse.json(
                { success: false, error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create user document (only include defined values)
        const userDoc: Partial<Omit<UserDocument, 'id'>> = {
            email: email.toLowerCase(),
            password: hashedPassword,
            onboardingComplete: false,
            onboardingStep: 0,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Only add optional fields if they have values
        if (firstName) userDoc.firstName = firstName;
        if (lastName) userDoc.lastName = lastName;

        // Add user to Firestore
        const userRef = await usersRef.add(userDoc);
        const userId = userRef.id;

        // Create empty profile
        await adminDb.collection(COLLECTIONS.PROFILES).doc(userId).set({
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Create JWT token
        const token = await createToken({
            userId,
            email: email.toLowerCase(),
        });

        // Set cookie
        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: userId,
                email: email.toLowerCase(),
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                onboardingComplete: false,
            },
            token,
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
