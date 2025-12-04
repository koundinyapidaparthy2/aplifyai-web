'use client';

import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';
import { useState } from 'react';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement newsletter subscription
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
    };

    const footerSections = {
        company: {
            title: 'Company',
            links: [
                { href: '/about', label: 'About Us' },
                { href: '/careers', label: 'Careers' },
                { href: '/blog', label: 'Blog' },
                { href: '/press', label: 'Press Kit' },
            ],
        },
        product: {
            title: 'Product',
            links: [
                { href: '/#features', label: 'Features' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/integrations', label: 'Integrations' },
                { href: '/api', label: 'API Docs' },
            ],
        },
        resources: {
            title: 'Resources',
            links: [
                { href: '/help', label: 'Help Center' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
            ],
        },
    };

    const socialLinks = [
        { href: 'https://twitter.com/aplifyai', icon: FaTwitter, label: 'Twitter' },
        { href: 'https://linkedin.com/company/aplifyai', icon: FaLinkedin, label: 'LinkedIn' },
        { href: 'https://github.com/aplifyai', icon: FaGithub, label: 'GitHub' },
        { href: 'https://discord.gg/aplifyai', icon: FaDiscord, label: 'Discord' },
    ];

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                AplifyAI
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 mb-6 max-w-sm">
                            Create AI-powered resumes and cover letters that get you hired.
                            Pay only for what you need. No subscriptions, no BS.
                        </p>

                        {/* Newsletter */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3">
                                Subscribe to our newsletter
                            </h3>
                            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                                >
                                    {subscribed ? '✓' : 'Subscribe'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">
                            {footerSections.company.title}
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.company.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">
                            {footerSections.product.title}
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.product.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">
                            {footerSections.resources.title}
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.resources.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/download"
                                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                                >
                                    Download Desktop App
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} AplifyAI. All rights reserved.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center space-x-6">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
