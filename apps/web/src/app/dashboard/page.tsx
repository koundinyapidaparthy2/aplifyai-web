'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api-config';
import StatusPieChart from '@/components/charts/StatusPieChart';
import TrendLineChart from '@/components/charts/TrendLineChart';
import ActivityTimeline from '@/components/ActivityTimeline';
import QuickActions from '@/components/QuickActions';

interface DashboardStats {
    totalApplications: number;
    totalResumes: number;
    totalCoverLetters: number;
    statusBreakdown: Record<string, number>;
    weeklyTrend: { week: string; count: number }[];
    successRate: number;
    avgResponseTime: string;
}

interface Insight {
    type: 'info' | 'warning' | 'success' | 'tip';
    title: string;
    message: string;
    action?: {
        text: string;
        url: string;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats
                const statsRes = await fetch(getApiUrl('analytics/stats'));
                const statsData = await statsRes.json();

                if (statsRes.ok) {
                    setStats(statsData.stats);
                }

                // Fetch insights
                const insightsRes = await fetch(getApiUrl('analytics/insights'));
                const insightsData = await insightsRes.json();

                if (insightsRes.ok) {
                    setInsights(insightsData.insights);
                }

            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="glass-card rounded-2xl p-5 border border-white/60">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-primary-100 rounded-xl p-3">
                                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                                    <dd className="text-3xl font-bold text-gray-900">{stats?.totalApplications || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5 border border-white/60">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-amber-100 rounded-xl p-3">
                                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                                    <dd className="text-3xl font-bold text-gray-900">{stats?.statusBreakdown?.interview || 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5 border border-white/60">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-emerald-100 rounded-xl p-3">
                                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                                    <dd className="text-3xl font-bold text-gray-900">{stats?.successRate || 0}%</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5 border border-white/60">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-xl p-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Response</dt>
                                    <dd className="text-3xl font-bold text-gray-900">{stats?.avgResponseTime || 'N/A'}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Charts */}
                        <div className="glass-card rounded-2xl p-6 border border-white/60">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Application Status</h2>
                            <StatusPieChart data={stats?.statusBreakdown || {}} />
                        </div>

                        <div className="glass-card rounded-2xl p-6 border border-white/60">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Weekly Activity</h2>
                            <TrendLineChart data={stats?.weeklyTrend || []} />
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card rounded-2xl p-6 border border-white/60">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
                            <ActivityTimeline />
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <div className="glass-card rounded-2xl p-6 border border-white/60">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                            <QuickActions />
                        </div>

                        {/* Insights */}
                        <div className="glass-card rounded-2xl p-6 border border-white/60">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Insights & Tips</h2>
                            {insights.length > 0 ? (
                                <div className="space-y-4">
                                    {insights.map((insight, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border ${insight.type === 'warning' ? 'bg-amber-50 border-amber-100' :
                                                insight.type === 'success' ? 'bg-emerald-50 border-emerald-100' :
                                                    insight.type === 'tip' ? 'bg-blue-50 border-blue-100' :
                                                        'bg-gray-50 border-gray-100'
                                                }`}
                                        >
                                            <div className="flex">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {insight.type === 'warning' && (
                                                        <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {insight.type === 'success' && (
                                                        <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {insight.type === 'tip' && (
                                                        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {insight.type === 'info' && (
                                                        <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className={`text-sm font-bold ${insight.type === 'warning' ? 'text-amber-800' :
                                                        insight.type === 'success' ? 'text-emerald-800' :
                                                            insight.type === 'tip' ? 'text-blue-800' :
                                                                'text-gray-900'
                                                        }`}>
                                                        {insight.title}
                                                    </h3>
                                                    <div className={`mt-1 text-sm ${insight.type === 'warning' ? 'text-amber-700' :
                                                        insight.type === 'success' ? 'text-emerald-700' :
                                                            insight.type === 'tip' ? 'text-blue-700' :
                                                                'text-gray-600'
                                                        }`}>
                                                        <p>{insight.message}</p>
                                                    </div>
                                                    {insight.action && (
                                                        <div className="mt-3">
                                                            <button
                                                                onClick={() => router.push(insight.action!.url)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${insight.type === 'warning' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                                                    insight.type === 'success' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                                                                        insight.type === 'tip' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                                                            'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                {insight.action.text}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm italic py-4 text-center">No insights available yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
