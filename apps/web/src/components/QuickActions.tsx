'use client';

import { useRouter } from 'next/navigation';

export default function QuickActions() {
    const router = useRouter();

    const actions = [
        {
            name: 'New Resume',
            description: 'Tailor a resume for a job',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            href: '/resumes/new',
            color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
        },
        {
            name: 'New Cover Letter',
            description: 'Generate a cover letter',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            href: '/cover-letters/new',
            color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
        },
        {
            name: 'Track Jobs',
            description: 'View your applications',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            href: '/jobs',
            color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        },
        {
            name: 'Update Profile',
            description: 'Keep your info current',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            href: '/onboarding',
            color: 'bg-green-50 text-green-700 hover:bg-green-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {actions.map((action) => (
                <button
                    key={action.name}
                    onClick={() => router.push(action.href)}
                    className={`relative rounded-lg border border-gray-200 p-6 flex items-center space-x-3 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${action.color}`}
                >
                    <div className="flex-shrink-0">
                        {action.icon}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">
                            {action.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {action.description}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
}
