'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Job } from '@/types/firestore';
import { useSession } from 'next-auth/react';

export default function JobTrackerPage() {
    const { data: session } = useSession();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newJob, setNewJob] = useState<Partial<Job>>({
        status: 'applied',
    });

    // Fetch jobs on mount
    useEffect(() => {
        // In a real implementation, we'd fetch from an API route that calls applications.getAll
        // For now, we'll simulate with local state or mock data if needed
        // Since we can't call adminDb directly from client, we need an API route.
        // Let's assume we'll create /api/jobs route next.
        fetchJobs();
    }, [session]);

    const fetchJobs = async () => {
        if (!session?.user) return;
        try {
            const res = await fetch('/api/jobs');
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newJob.companyName || !newJob.jobTitle) return;

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newJob),
            });

            if (res.ok) {
                setIsAdding(false);
                setNewJob({ status: 'applied' });
                fetchJobs();
            }
        } catch (error) {
            console.error('Failed to add job:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return;
        try {
            await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
            fetchJobs();
        } catch (error) {
            console.error('Failed to delete job:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied': return 'bg-blue-100 text-blue-800';
            case 'interviewing': return 'bg-yellow-100 text-yellow-800';
            case 'offered': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Job Application Tracker</h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    {isAdding ? 'Cancel' : 'Add Application'}
                </button>
            </div>

            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-lg shadow-md mb-8"
                >
                    <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={newJob.companyName || ''}
                                onChange={e => setNewJob({ ...newJob, companyName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Job Title</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={newJob.jobTitle || ''}
                                onChange={e => setNewJob({ ...newJob, jobTitle: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={newJob.status}
                                onChange={e => setNewJob({ ...newJob, status: e.target.value as any })}
                            >
                                <option value="applied">Applied</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="offered">Offered</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={newJob.notes || ''}
                                onChange={e => setNewJob({ ...newJob, notes: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Save Application
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No applications tracked yet. Start by adding one!</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {jobs.map((job) => (
                            <li key={job.id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{job.jobTitle}</p>
                                            <p className="text-sm text-gray-500 truncate">{job.companyName}</p>
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                Applied on {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                            {job.notes && (
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    Note: {job.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
