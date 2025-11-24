import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
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
            return NextResponse.redirect(new URL("/login", req.nextUrl));
        }
        return NextResponse.next();
    }

    // Auth routes - only redirect if truly logged in (not just session check failure)
    if (isOnAuth && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
