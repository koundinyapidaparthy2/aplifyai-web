'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiStar, FiFilter, FiRefreshCw } from 'react-icons/fi';
import JobCard from '@/components/JobCard';

// Mock data (high matches)
const MOCK_MATCHES = [
    {
        id: '1',
        title: 'Senior Frontend Engineer',
        company: 'Google',
        location: 'Mountain View, CA',
        type: 'Full-time',
        postedAt: '2 days ago',
        matchScore: 98,
        logo: 'https://logo.clearbit.com/google.com'
    },
    {
        id: '2',
        title: 'Product Designer',
        company: 'Airbnb',
        location: 'San Francisco, CA',
        type: 'Full-time',
        postedAt: '4 hours ago',
        matchScore: 95,
        logo: 'https://logo.clearbit.com/airbnb.com'
    },
    {
        id: '5',
        title: 'UX Engineer',
        company: 'Netflix',
        location: 'Los Gatos, CA',
        type: 'Full-time',
        postedAt: '5 hours ago',
        matchScore: 94,
        logo: 'https://logo.clearbit.com/netflix.com'
    }
];

export default function MatchesPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold text-gray-900">Top Matches</h1>
                            <span className="px-2 py-0.5 rounded-full bg-[#3DCEA5]/10 text-[#3DCEA5] text-xs font-bold border border-[#3DCEA5]/20">
                                AI Recommended
                            </span>
                        </div>
                        <p className="text-gray-500">Jobs perfectly tailored to your resume and preferences.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_MATCHES.map((job) => (
                        <div key={job.id} className="h-64">
                            <JobCard job={job} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
