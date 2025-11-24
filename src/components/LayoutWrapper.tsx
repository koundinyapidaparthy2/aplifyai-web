'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { useSession } from 'next-auth/react';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Define auth pages where header/footer should be hidden
    const authPages = ['/login', '/signup', '/onboarding'];

    // Check if current page is an auth page
    const isAuthPage = authPages.some(page => pathname.startsWith(page));

    // Show header/footer by default, hide only on auth pages
    const showHeaderFooter = !isAuthPage;

    // Get user data from session
    const user = session?.user ? {
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        image: session.user.image || undefined,
    } : null;

    return (
        <>
            {showHeaderFooter && <Header user={user} />}
            <main className={showHeaderFooter ? 'pt-16' : ''}>
                {children}
            </main>
            {showHeaderFooter && <Footer />}
        </>
    );
}
