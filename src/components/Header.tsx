'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import { FiUser, FiSettings, FiLogOut, FiGrid } from 'react-icons/fi';
import { signOut } from 'next-auth/react';

interface HeaderProps {
    user?: {
        name?: string;
        email?: string;
        image?: string;
    } | null;
}

export default function Header({ user }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const pathname = usePathname();

    // Handle scroll for sticky header and section highlighting
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            
            // Update active section based on scroll position (only on home page)
            if (pathname === '/') {
                const sections = ['home', 'about', 'services', 'pricing'];
                const scrollPosition = window.scrollY + 100;
                
                for (const section of sections) {
                    const element = document.getElementById(section);
                    if (element) {
                        const { offsetTop, offsetHeight } = element;
                        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                            setActiveSection(section);
                            break;
                        }
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
    }, [pathname]);

    // Different navigation links based on authentication status
    const navLinks = user ? [
        // Logged in users - show Dashboard and Pricing
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/tracker', label: 'Job Tracker' },
        { href: '/pricing', label: 'Pricing' },
    ] : [
        // Non-logged in users - show sections on home page
        { href: '#home', label: 'Home', section: 'home' },
        { href: '#about', label: 'About Us', section: 'about' },
        { href: '#services', label: 'Services', section: 'services' },
        { href: '#pricing', label: 'Pricing', section: 'pricing' },
    ];

    const isActive = (link: { href: string; section?: string }) => {
        // For home page sections, use scroll-spy
        if (pathname === '/' && link.section) {
            return activeSection === link.section;
        }
        // For other pages, check pathname
        if (link.href === '/') return pathname === '/';
        return pathname.startsWith(link.href);
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const element = document.getElementById(href.substring(1));
            if (element) {
                const offsetTop = element.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-lg shadow-lg'
                : 'bg-white'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                            AplifyAI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={`text-sm font-medium transition-colors relative group cursor-pointer ${isActive(link)
                                    ? 'text-primary-600'
                                    : 'text-gray-700 hover:text-primary-600'
                                    }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary-600 transform origin-left transition-transform ${isActive(link) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        }`}
                                />
                            </a>
                        ))}
                    </nav>

                    {/* User Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            // Logged in - Profile Dropdown
                            <div className="relative">
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {user.name || user.email}
                                    </span>
                                    <HiChevronDown
                                        className={`w-4 h-4 text-gray-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {profileDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                                        >
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <FiGrid className="w-4 h-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <FiUser className="w-4 h-4" />
                                                <span>Profile</span>
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <FiSettings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </Link>
                                            <hr className="my-2 border-gray-200" />
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                                            >
                                                <FiLogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            // Not logged in - Sign In / Get Started
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <HiX className="w-6 h-6 text-gray-700" />
                        ) : (
                            <HiMenu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-200"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isActive(link)
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.label}
                                </a>
                            ))}

                            <hr className="border-gray-200" />

                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="block px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg text-center hover:bg-primary-600 hover:shadow-lg transition-all"
                                    >
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
