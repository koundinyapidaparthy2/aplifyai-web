'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/types/firestore';
import { useSession } from 'next-auth/react';
import KanbanBoard from '@/components/tracker/KanbanBoard';
import AddJobModal from '@/components/tracker/AddJobModal';
import { Plus } from 'lucide-react';

export default function JobTrackerPage() {
    const { data: session } = useSession();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialStatus, setInitialStatus] = useState('applied');

    useEffect(() => {
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

    const handleAddJob = async (newJobData: any) => {
        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newJobData),
            });

            if (res.ok) {
                fetchJobs();
            }
        } catch (error) {
            console.error('Failed to add job:', error);
        }
    };

    const handleUpdateStatus = async (jobId: string, newStatus: string) => {
        // Optimistic update locally
        setJobs(prevJobs =>
            prevJobs.map(job =>
                job.id === jobId ? { ...job, status: newStatus as any } : job
            )
        );

        try {
            await fetch('/api/jobs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: jobId, status: newStatus }),
            });
        } catch (error) {
            console.error('Failed to update status:', error);
            // Revert on error would go here
            fetchJobs();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return;

        // Optimistic update
        setJobs(prevJobs => prevJobs.filter(job => job.id !== id));

        try {
            await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete job:', error);
            fetchJobs();
        }
    };

    const openAddModal = (status: string = 'applied') => {
        setInitialStatus(status);
        setIsModalOpen(true);
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-white">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your job applications</p>
                </div>
                <button
                    onClick={() => openAddModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    Add Application
                </button>
            </div>

            <div className="flex-1 overflow-hidden p-8 bg-gray-50/30">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                ) : (
                    <KanbanBoard
                        jobs={jobs}
                        onUpdateStatus={handleUpdateStatus}
                        onDeleteJob={handleDelete}
                        onAddJob={openAddModal}
                    />
                )}
            </div>

            <AddJobModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddJob}
                initialStatus={initialStatus}
            />
        </div>
    );
}
