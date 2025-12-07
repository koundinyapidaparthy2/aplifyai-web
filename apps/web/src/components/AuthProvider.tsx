'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

function OnboardingGuard({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'loading') return;

        // Paths that don't need onboarding check
        const publicPaths = ['/login', '/signup', '/', '/download'];
        const isPublicPath = publicPaths.includes(pathname);
        const isOnboarding = pathname === '/onboarding';

        if (status === 'authenticated' && session?.user) {

            if (!session.user.onboardingComplete && !isOnboarding) {
                router.push('/onboarding');
            } else if (session.user.onboardingComplete && isOnboarding) {
                router.push('/dashboard');
            }
        }
    }, [status, session, pathname, router]);

    return <>{children}</>;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <OnboardingGuard>{children}</OnboardingGuard>
        </SessionProvider>
    );
}
