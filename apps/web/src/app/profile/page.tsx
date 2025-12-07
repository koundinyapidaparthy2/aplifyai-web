'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiGithub, FiLinkedin, FiLink, FiMapPin, FiBriefcase, FiDownload, FiFileText, FiCheckCircle, FiInfo, FiHelpCircle, FiGlobe, FiLoader } from 'react-icons/fi';
import { FaBolt, FaBuilding, FaProjectDiagram } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { Button } from '@aplifyai/ui';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/users/profile');
                if (res.ok) {
                    const result = await res.json();
                    if (result.success) {
                        setProfile(result.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-[#3DCEA5]" />
            </div>
        );
    }

    // Fallback or fetched data
    const skills = profile?.skills ?
        (Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',').map((s: string) => s.trim()))
        : [];

    const questions = profile?.dynamicQuestions || [];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header / Banner */}
            <div className="relative rounded-3xl overflow-hidden h-48 md:h-64 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3DCEA5] via-[#2dd4bf] to-[#3b82f6] opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">Your Career Profile</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-20 relative z-10 px-4">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Profile Card */}
                    <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-transparent"></div>
                        <div className="relative inline-block mb-4">
                            <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center text-4xl font-bold text-[#3DCEA5] border-4 border-white shadow-xl mx-auto transform group-hover:scale-105 transition-transform duration-300">
                                {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : (session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U')}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-[#3DCEA5] shadow-lg transition-all hover:scale-110">
                                <FiEdit2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                            {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : session?.user?.name || 'User'}
                        </h2>
                        <p className="text-gray-500 font-medium mb-6">
                            {profile?.jobTitle || session?.user?.email}
                        </p>

                        {profile?.location && (
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-400 mb-4">
                                <FiMapPin /> {profile.location} {profile.country && `• ${profile.country}`}
                            </div>
                        )}

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3DCEA5]/10 rounded-full border border-[#3DCEA5]/20 mb-2">
                            <div className="w-2 h-2 rounded-full bg-[#3DCEA5] animate-pulse"></div>
                            <span className="text-sm font-bold text-[#3DCEA5] tracking-wide uppercase">Actively looking</span>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="glass-card rounded-3xl p-4 space-y-2">
                        <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#3DCEA5] to-[#34b38f] text-white rounded-2xl shadow-lg shadow-[#3DCEA5]/20 transform transition-transform hover:-translate-y-0.5">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <FiEdit2 className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Profile Settings</p>
                                    <p className="text-xs opacity-90 font-medium">Manage your info</p>
                                </div>
                            </div>
                            <FiCheckCircle className="w-5 h-5 text-white/80" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Market Context (New AI Feature) */}
                    {profile?.country && (
                        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-white to-blue-50/50">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <FiGlobe className="w-5 h-5" />
                                </div>
                                Market Strategy: {profile.country}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Status</p>
                                    <p className="text-lg font-bold text-indigo-600">{profile.isInternational ? 'International Candidate' : 'Domestic Candidate'}</p>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Focus Field</p>
                                    <p className="text-lg font-bold text-gray-800">{profile.fieldOfStudy || 'General Tech'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Generated Questions (Strategy) */}
                    {questions.length > 0 && (
                        <div className="glass-card rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <FaBolt className="w-5 h-5" />
                                    </div>
                                    Interview Strategy
                                </h3>
                            </div>
                            <div className="space-y-6">
                                {questions.map((q: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#3DCEA5]/30 transition-colors">
                                        <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                                            <span className="text-[#3DCEA5]">Q{idx + 1}.</span> {q.question}
                                        </h4>
                                        <p className="text-gray-600 text-sm italic border-l-2 border-gray-200 pl-4 py-1">
                                            "{q.answer || 'Not answered yet'}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience Section */}
                    <div className="glass-card rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <FiBriefcase className="w-5 h-5" />
                                </div>
                                Work Experience
                            </h3>
                            <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold text-gray-600 hover:text-[#3DCEA5] hover:border-[#3DCEA5]">
                                <FiPlus /> Add Role
                            </Button>
                        </div>

                        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500">Auto-extracted experience helps tailor your resumes.</p>
                            <p className="text-sm font-medium text-gray-900 mt-2">{profile?.experienceLevel} Level</p>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="glass-card rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                    <FaBolt className="w-5 h-5" />
                                </div>
                                Skills
                            </h3>
                            <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold text-gray-600 hover:text-[#3DCEA5] hover:border-[#3DCEA5]">
                                <FiEdit2 /> Edit
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {skills.length > 0 ? skills.map((skill: string, idx: number) => (
                                <span key={idx} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-bold hover:border-[#3DCEA5] hover:text-[#3DCEA5] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default select-none">
                                    {skill}
                                </span>
                            )) : (
                                <p className="text-gray-400 italic">No skills added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
