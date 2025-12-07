import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const TOKEN_NAME = 'auth-token';
const TOKEN_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

/**
 * Create a JWT token
 */
export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    const token = await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(TOKEN_EXPIRY)
        .sign(JWT_SECRET);

    return token;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Set auth token in cookies
 */
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

/**
 * Get auth token from cookies
 */
export async function getAuthCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME);
    return token?.value || null;
}

/**
 * Remove auth token from cookies
 */
export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_NAME);
}

import { auth } from "./auth-config";

/**
 * Get current user from token or NextAuth session
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
    // 1. Try NextAuth Session
    try {
        const session = await auth();
        if (session?.user?.email) {
            return {
                userId: session.user.id || 'mock-user-id',
                email: session.user.email,
            };
        }
    } catch (e) {
        // Ignore error and try custom token
    }

    // 2. Try Custom Auth Token
    const token = await getAuthCookie();
    if (!token) return null;

    return verifyToken(token);
}

/**
 * Require authentication (for API routes)
 */
export async function requireAuth(): Promise<JWTPayload> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}
