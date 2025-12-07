'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        const source = searchParams.get('source');

        if (status === 'authenticated' && session) {
            // Check if we need to redirect back to Electron app
            if (source === 'electron') {
                // Generate a temporary auth token (or use session ID if appropriate for your security model)
                // For simplicity here, we assume the session token or ID is sufficient or a separate API issuance is needed.
                // In a real app, you might fetch a short-lived one-time code here.

                // Using a mock or real ID from session
                // @ts-ignore
                const token = session.user?.id || 'mock-token';

                console.log('Redirecting to Electron app...', token);
                window.location.href = `aplifyai://auth?token=${token}`;

                // Optional: Show a "You can close this tab" message after a delay
            } else {
                router.push('/dashboard');
            }
        } else if (status === 'unauthenticated') {
            router.push('/login?source=' + (source || ''));
        }
    }, [status, session, router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full">
                <div className="w-12 h-12 border-4 border-[#3DCEA5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Authenticating...</h2>
                <p className="text-gray-500 text-sm">Please wait while we log you in.</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
