'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api-config';

interface Activity {
    id: string;
    type: 'resume_generated' | 'cover_letter_generated' | 'job_created' | 'job_status_updated';
    title: string;
    description?: string;
    timestamp: string;
    relativeTime: string;
}

export default function ActivityTimeline() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch(getApiUrl('analytics/activity?limit=5'));
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch activities');
                }

                setActivities(data.activities);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'resume_generated':
                return (
                    <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </span>
                );
            case 'cover_letter_generated':
                return (
                    <span className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </span>
                );
            case 'job_created':
                return (
                    <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </span>
                );
            case 'job_status_updated':
                return (
                    <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </span>
                );
            default:
                return (
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>;
    }

    if (activities.length === 0) {
        return <div className="text-gray-500 text-sm text-center py-4">No recent activity</div>;
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {activities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                        <div className="relative pb-8">
                            {activityIdx !== activities.length - 1 ? (
                                <span
                                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>{getActivityIcon(activity.type)}</div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {activity.title}
                                        </p>
                                        {activity.description && (
                                            <p className="text-sm text-gray-500">{activity.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={activity.timestamp}>{activity.relativeTime}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
