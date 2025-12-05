import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@aplifyai/ui';
import { Play, Calendar, Clock, MoreVertical } from 'lucide-react';

export const Dashboard = () => {
    const navigate = useNavigate();

    const handleStartSession = () => {
        navigate('/session');
    };

    // Mock data for recent sessions
    const recentSessions = [
        { id: 1, title: 'Untitled session', date: 'Fri, Nov 14', duration: '0:02', time: '12:58pm' },
        { id: 2, title: 'Untitled session', date: 'Tue, Nov 4', duration: '7:18', time: '8:57pm' },
        { id: 3, title: 'Zscaler Reply Draft and Java Deep Dive', date: 'Fri, Oct 31', duration: '6:00:34', time: '10:54am' },
        { id: 4, title: 'Untitled session', date: 'Sun, Oct 26', duration: '0:06', time: '3:37am' },
    ];

    return (
        <div className="p-10 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-6">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Copilot</h1>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                        <Calendar size={14} className="text-indigo-500" />
                        <span>Mode: Interview Check</span>
                    </div>
                </div>

                <Button
                    onClick={handleStartSession}
                    variant="primary"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-3 font-semibold text-base"
                >
                    <Play size={20} fill="currentColor" />
                    Start Copilot
                </Button>
            </header>

            <div className="space-y-10">
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Sessions</p>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</button>
                    </div>

                    <div className="space-y-3">
                        {recentSessions.map((session) => (
                            <div key={session.id} className="group flex items-center justify-between p-5 bg-white rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 hover:shadow-sm cursor-pointer">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-gray-400">{session.date}</span>
                                    <span className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{session.title}</span>
                                </div>
                                <div className="flex items-center gap-8 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-300" />
                                        <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">{session.duration}</span>
                                    </div>
                                    <span className="font-medium text-gray-400">{session.time}</span>
                                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
