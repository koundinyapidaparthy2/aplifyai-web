'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    FiGrid,
    FiBriefcase,
    FiTarget,
    FiFileText,
    FiUser,
    FiLogOut,
    FiSettings,
    FiActivity,
    FiDownload
} from 'react-icons/fi';
import Image from 'next/image';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const menuItems = [
        { path: '/dashboard', name: 'Dashboard', icon: FiGrid },
        { path: '/matches', name: 'Matches', icon: FiTarget, badge: '5' },
        { path: '/jobs', name: 'Jobs', icon: FiBriefcase },
        { path: '/tracker', name: 'Job Tracker', icon: FiFileText },
        { path: '/documents', name: 'Documents', icon: FiFileText },
        { path: '/download', name: 'Download', icon: FiDownload },
        { path: '/profile', name: 'Profile', icon: FiUser },
    ];

    return (
        <motion.div
            className="fixed left-4 top-4 bottom-4 w-64 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg z-40 flex flex-col py-6"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            {/* Logo Section */}
            <div className="px-6 mb-8 border-b border-gray-200 pb-6">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
                        <Image
                            src="/favicon.svg"
                            alt="AplifyAI Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                        Aplify<span className="text-primary-500">AI</span>
                    </span>
                </Link>
            </div>

            {/* Menu Header */}
            <div className="px-6 mb-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                        >
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}>
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`} />
                                <span className="font-medium">{item.name}</span>
                                {item.badge && (
                                    <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Daily Streak Section */}
            <div className="px-4 mt-auto mb-4">
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border border-primary-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <FiActivity className="text-primary-500" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500">Daily Streak</div>
                            <div className="text-sm font-bold text-gray-900">0 Days</div>
                        </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full w-[0%]"></div>
                    </div>
                </div>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300 shadow-sm">
                        <span className="text-primary-600 font-bold">
                            {session?.user?.name?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {session?.user?.email || ''}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Link href="/settings" className="flex items-center justify-center gap-2 p-2 text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-colors">
                        <FiSettings className="w-3.5 h-3.5" />
                        Settings
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center justify-center gap-2 p-2 text-xs font-medium text-red-400 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <FiLogOut className="w-3.5 h-3.5" />
                        Logout
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
