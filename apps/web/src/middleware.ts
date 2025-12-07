import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // Apply security headers first
    const securityResponse = securityHeaders(req as NextRequest);
    if (securityResponse.status === 429) {
        return securityResponse;
    }

    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const isOnResumes = req.nextUrl.pathname.startsWith("/resumes");
    const isOnCoverLetters = req.nextUrl.pathname.startsWith("/cover-letters");
    const isOnJobs = req.nextUrl.pathname.startsWith("/jobs");
    const isOnOnboarding = req.nextUrl.pathname.startsWith("/onboarding");
    const isOnAuth = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup");

    // Protected routes that require authentication
    const protectedRoutes = isOnDashboard || isOnResumes || isOnCoverLetters || isOnJobs || isOnOnboarding;

    if (protectedRoutes) {
        if (!isLoggedIn) {
            const response = NextResponse.redirect(new URL("/login", req.nextUrl));
            // Copy security headers to redirect response
            securityResponse.headers.forEach((value, key) => {
                response.headers.set(key, value);
            });
            return response;
        }
        return securityResponse;
    }

    // Auth routes - only redirect if truly logged in (not just session check failure)
    // Auth routes - only redirect if truly logged in (not just session check failure)
    if (isOnAuth && isLoggedIn) {
        // Don't redirect if there's a callback URL (e.g. for Electron auth)
        const callback = req.nextUrl.searchParams.get("callback");
        if (callback) {
            return securityResponse;
        }

        const response = NextResponse.redirect(new URL("/dashboard", req.nextUrl));
        securityResponse.headers.forEach((value, key) => {
            response.headers.set(key, value);
        });
        return response;
    }

    return securityResponse;
});

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
