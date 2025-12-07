'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useSession } from 'next-auth/react';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    // Define auth pages where header/footer should be hidden (login/signup)
    // NOTE: If user is logged in, we hide global header/footer anyway.
    const authPages = ['/login', '/signup', '/onboarding'];
    const isAuthPage = authPages.some(page => pathname.startsWith(page));

    // Logic:
    // 1. If Logged In -> Show Sidebar, Hide Global Header/Footer.
    // 2. If Logged Out -> Show Global Header/Footer (unless it's a login/signup page).

    const isLoggedIn = status === 'authenticated';
    const showSidebar = isLoggedIn && !pathname.startsWith('/onboarding');
    const showHeaderFooter = !isLoggedIn && !isAuthPage;

    // Get user data from session
    const user = session?.user ? {
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        image: session.user.image || undefined,
    } : null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar for Authenticated Users */}
            {showSidebar && <Sidebar />}

            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${showSidebar ? 'pl-72' : ''}`}>

                {/* Global Header for Public Users */}
                {showHeaderFooter && <Header user={user} />}

                {/* Main Content */}
                <main className={`flex-1 ${showHeaderFooter ? 'pt-16' : 'p-4'}`}>
                    {children}
                </main>

                {/* Global Footer for Public Users */}
                {showHeaderFooter && <Footer />}
            </div>
        </div>
    );
}
