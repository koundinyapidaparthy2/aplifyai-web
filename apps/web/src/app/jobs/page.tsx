'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiBriefcase, FiMapPin, FiClock, FiStar, FiFilter } from 'react-icons/fi';
import JobCard from '@/components/JobCard';

// Mock data
const MOCK_JOBS = [
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
        id: '3',
        title: 'Software Engineer, AI',
        company: 'OpenAI',
        location: 'Remote',
        type: 'Full-time',
        postedAt: '1 day ago',
        matchScore: 92,
        logo: 'https://logo.clearbit.com/openai.com'
    },
    {
        id: '4',
        title: 'Full Stack Developer',
        company: 'Stripe',
        location: 'Seattle, WA',
        type: 'Full-time',
        postedAt: '3 days ago',
        matchScore: 88,
        logo: 'https://logo.clearbit.com/stripe.com'
    }
];

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header & Search */}
                <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Explore Jobs</h1>
                        <p className="text-gray-500 mt-1">Found <span className="font-semibold text-[#3DCEA5]">{MOCK_JOBS.length}</span> jobs matching your profile</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#3DCEA5] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search roles, companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DCEA5]/50 focus:border-[#3DCEA5] transition-all shadow-sm hover:bg-white hover:border-[#3DCEA5]/30 focus:bg-white"
                            />
                        </div>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl hover:border-[#3DCEA5]/50 hover:text-[#3DCEA5] transition-colors shadow-sm">
                            <FiFilter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Job Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_JOBS.map((job) => (
                        <div key={job.id} className="h-64">
                            <JobCard job={job} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
