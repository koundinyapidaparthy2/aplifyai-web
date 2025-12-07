'use client';

import { FiClock, FiFileText, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function TrackerPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-[#3DCEA5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiClock className="w-10 h-10 text-[#3DCEA5]" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Tracker</h1>
                    <p className="text-gray-500 max-w-lg mx-auto mb-8">
                        Track all your job applications in one place. This feature is coming soon with automated status updates.
                    </p>
                    <div className="glass-card max-w-2xl mx-auto p-6 rounded-2xl border-dashed border-2 border-gray-200">
                        <p className="text-gray-400 italic">No applications tracked yet. Start applying to populate this list!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
