import React from 'react';
import { FiMapPin, FiClock, FiBookmark, FiSend } from 'react-icons/fi';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    postedAt: string;
    description?: string;
    salary?: string;
    logo?: string;
    matchScore?: number;
}

interface JobCardProps {
    job: Job;
    onSave?: (id: string) => void;
    onApply?: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onSave, onApply }) => {
    // Determine match score color
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-[#3DCEA5] bg-[#3DCEA5]/10 border-[#3DCEA5]/20';
        if (score >= 70) return 'text-blue-500 bg-blue-50 border-blue-100';
        return 'text-amber-500 bg-amber-50 border-amber-100';
    };

    const scoreColor = job.matchScore ? getScoreColor(job.matchScore) : '';

    return (
        <div className="glass-card group relative flex flex-col p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-white rounded-2xl flex items-center justify-center text-xl font-bold text-gray-400 border border-gray-100 shadow-inner overflow-hidden">
                    {job.logo ? (
                        <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" />
                    ) : (
                        <span className="text-2xl pt-1 text-gray-300">{job.company.charAt(0)}</span>
                    )}
                </div>
                {job.matchScore !== undefined && (
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${scoreColor} shadow-sm`}>
                        {job.matchScore}% Match
                    </div>
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1.5 group-hover:text-[#3DCEA5] transition-colors line-clamp-1">
                    {job.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-5">{job.company}</p>

                <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                            <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-500">
                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                            <FiClock className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <span className="truncate">{job.postedAt} • {job.type}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50 mt-auto">
                <button
                    className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    onClick={() => onSave?.(job.id)}
                >
                    <FiBookmark className="w-4 h-4" />
                    Save
                </button>
                <button
                    className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-[#3DCEA5] hover:bg-[#34b38f] shadow-md shadow-[#3DCEA5]/20 hover:shadow-lg hover:shadow-[#3DCEA5]/30 transition-all flex items-center justify-center gap-2"
                    onClick={() => onApply?.(job.id)}
                >
                    <FiSend className="w-4 h-4" />
                    Apply
                </button>
            </div>
        </div>
    );
};

export default JobCard;
