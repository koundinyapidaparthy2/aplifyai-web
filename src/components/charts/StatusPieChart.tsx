'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusData {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

interface StatusPieChartProps {
    data: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
    draft: '#9CA3AF',
    applied: '#3B82F6',
    interview: '#F59E0B',
    offer: '#10B981',
    rejected: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
};

export default function StatusPieChart({ data }: StatusPieChartProps) {
    // Transform data for Recharts
    const chartData: StatusData[] = Object.entries(data)
        .filter(([_, value]) => value > 0) // Only show statuses with values
        .map(([key, value]) => ({
            name: STATUS_LABELS[key] || key,
            value,
            color: STATUS_COLORS[key] || '#6B7280',
        }));

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-2">No application data yet</p>
                </div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
