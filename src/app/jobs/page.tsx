'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api-config';

interface Job {
    id: string;
    companyName: string;
    jobTitle: string;
    status: string;
    createdAt: string;
    resume?: {
        id: string;
        pdfUrl: string;
    };
    coverLetter?: {
        id: string;
        pdfUrl: string;
    };
}

export default function JobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch(getApiUrl('jobs'));
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch jobs');
            }

            setJobs(data.jobs);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            applied: 'bg-blue-100 text-blue-800',
            interview: 'bg-yellow-100 text-yellow-800',
            offer: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return colors[status] || colors.draft;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
                        <p className="text-gray-600 mt-2">Track your job applications and documents</p>
                    </div>
                    <button
                        onClick={() => router.push('/resumes/new')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Resume
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Jobs List */}
                {jobs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No job applications yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first tailored resume.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => router.push('/resumes/new')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Resume
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <h3 className="text-xl font-semibold text-gray-900">{job.jobTitle}</h3>
                                            <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-1">{job.companyName}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Created {new Date(job.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {job.resume && (
                                            <a
                                                href={job.resume.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Resume
                                            </a>
                                        )}
                                        {job.coverLetter ? (
                                            <a
                                                href={job.coverLetter.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Cover Letter
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/cover-letters/new?jobId=${job.id}`)}
                                                className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Generate Cover Letter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
