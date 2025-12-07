'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaPenFancy, FaChartLine, FaRobot, FaBriefcase, FaSearch, FaChrome, FaBolt, FaClock, FaCheckCircle, FaLaptopCode, FaMagic } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FeaturesPage() {
    const timeData = [
        { name: 'Manual Application', hours: 40, fill: '#94a3b8' },
        { name: 'With AplifyAI Agent', hours: 8, fill: '#3DCEA5' },
    ];

    const [activeFlow, setActiveFlow] = useState(0);

    const flows = [
        {
            id: 'extension',
            title: 'Browser Extension Flow',
            icon: FaChrome,
            description: 'Apply on LinkedIn, Workday, Greenhouse & more.',
            steps: [
                { icon: FaSearch, text: 'Visit Job Board', sub: 'LinkedIn, Workday, etc.' },
                { icon: FaChrome, text: 'Add to Extension', sub: 'One-click capture' },
                { icon: FaMagic, text: 'Agentic Match', sub: 'Custom Resume & Cover Letter created' },
                { icon: FaLaptopCode, text: 'Autofill & Apply', sub: 'Extension fills forms automatically' }
            ]
        },
        {
            id: 'platform',
            title: 'Platform Agentic Apply',
            icon: FaBolt,
            description: 'Apply to 50+ matches with one click.',
            steps: [
                { icon: FaSearch, text: 'Search Role', sub: 'Find top 50 matches' },
                { icon: FaRobot, text: 'Click Agentic Apply', sub: 'Trigger bulk action' },
                { icon: FaCheckCircle, text: 'Auto-Apply All', sub: 'Custom docs & answers for each' },
                { icon: FaChartLine, text: 'Track Success', sub: 'Live status dashboard' }
            ]
        },
        {
            id: 'sentinel',
            title: '24/7 Sentinel Mode',
            icon: FaClock,
            description: 'Apply while you sleep.',
            steps: [
                { icon: FaClock, text: '24/7 Monitoring', sub: 'Agent stays awake' },
                { icon: FaBolt, text: 'New Job Detected', sub: 'Instant capture' },
                { icon: FaRobot, text: 'Auto-Apply', sub: 'Uses your best profile match' },
                { icon: FaPenFancy, text: 'Notification', sub: 'Wake up to interviews' }
            ]
        }
    ];

    const features = [
        {
            title: 'Agentic Resume Builder',
            description: 'Stop staring at a blank page. Our AI Agent analyzes your unique profile and the specific job description, then writes a tailored resume word-by-word to beat ATS filters.',
            icon: FaFileAlt,
            color: 'bg-blue-100 text-blue-600',
            stats: 'Save ~2 hours per resume'
        },
        {
            title: 'Cover Letter Agent',
            description: 'Our agent mimics your personal writing style to craft compelling cover letters. It pulls key achievements from your history that match the job requirements perfectly.',
            icon: FaPenFancy,
            color: 'bg-green-100 text-green-600',
            stats: '100% personalized in seconds'
        },
        {
            title: 'Smart Application Tracker',
            description: 'Never lose track of an opportunity. The Agentic Tracker organizes every application, reminds you to follow up, and even predicts your interview chances.',
            icon: FaChartLine,
            color: 'bg-purple-100 text-purple-600',
            stats: '3x more interviews landed'
        },
        {
            title: 'Interview Prep Agent',
            description: 'Practice with an AI that knows the job you applied for. It asks likely interview questions and gives you feedback on your answers instantly.',
            icon: FaBriefcase,
            color: 'bg-red-100 text-red-600',
            stats: 'Boost confidence by 80%'
        },
        {
            title: 'Career Path Agent',
            description: 'Confused about your next step? Our Career Coach Agent analyzes market trends and your skills to suggest the perfect roles for your future.',
            icon: FaSearch,
            color: 'bg-yellow-100 text-yellow-600',
            stats: 'Find clear direction'
        },
        {
            title: '24/7 Job Sentinel',
            description: 'While you sleep, our Sentinel Agent watches job boards for new listings. It notifies you the instant a perfect match appears so you apply first.',
            icon: FaRobot,
            color: 'bg-[#3DCEA5]/10 text-[#3DCEA5]',
            stats: 'Apply in top 1% of candidates'
        }
    ];

    return (
        <div className="bg-gray-50/50 min-h-screen py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-base font-semibold text-[#3DCEA5] tracking-wide uppercase">Core Features</h2>
                    <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
                        The Power of <br /> <span className="text-[#3DCEA5]">AplifyAI Agents</span>
                    </p>
                    <p className="mt-4 text-xl text-gray-500">
                        See how our different Agent Flows give you a massive unfair advantage.
                    </p>
                </div>

                {/* Efficiency Graph */}
                <div className="bg-white p-8 rounded-3xl shadow-xl mb-24 border border-gray-100">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reclaim 32 Hours/Week</h3>
                            <p className="text-gray-600 mb-6 text-lg">
                                The average student spends 40 hours applying to just 20 jobs tailored manually.
                                With <strong>AplifyAI Agents</strong>, you can apply to the same 20 jobs with higher quality in a fraction of the time.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center text-gray-700">
                                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 font-bold">✕</span>
                                    Formatting headaches
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 font-bold">✕</span>
                                    Repetitive data entry
                                </li>
                                <li className="flex items-center text-gray-900 font-semibold">
                                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 font-bold">✓</span>
                                    Focus on interviews & skills
                                </li>
                            </ul>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={timeData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="hours" radius={[0, 10, 10, 0]} barSize={40} label={{ position: 'right', fill: '#666', fontSize: 14, formatter: (val: any) => `${val} Hours` }} />
                                </BarChart>
                            </ResponsiveContainer>
                            <p className="text-center text-xs text-gray-400 mt-2">Time spent per 20 applications</p>
                        </div>
                    </div>
                </div>

                {/* Interactive Workflow Tabs */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-900">How It Works</h3>
                        <p className="text-gray-500 mt-2">Select a flow to see the agent in action.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {flows.map((flow, index) => (
                            <button
                                key={flow.id}
                                onClick={() => setActiveFlow(index)}
                                className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all duration-200 ${activeFlow === index
                                    ? 'bg-[#3DCEA5] text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                <flow.icon className={activeFlow === index ? 'text-white' : 'text-[#3DCEA5]'} />
                                {flow.title}
                            </button>
                        ))}
                    </div>

                    {/* Visualizer */}
                    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-lg border border-gray-200 overflow-hidden relative min-h-[400px]">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeFlow}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative z-10"
                            >
                                <div className="text-center mb-10">
                                    <h4 className="text-2xl font-bold text-gray-900">{flows[activeFlow].title}</h4>
                                    <p className="text-gray-500">{flows[activeFlow].description}</p>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-8 md:gap-4 px-4">
                                    {/* Connecting Line (Desktop) */}
                                    <div className="hidden md:block absolute top-[40px] left-10 right-10 h-1 bg-gray-100 -z-10">
                                        <div className="h-full bg-[#3dcea520] w-full animate-pulse"></div>
                                    </div>

                                    {flows[activeFlow].steps.map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center text-center w-full md:w-1/4 relative group">
                                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border-2 transition-colors duration-300 ${idx === 0 ? 'bg-blue-50 border-blue-200 text-blue-500' :
                                                idx === 1 ? 'bg-purple-50 border-purple-200 text-purple-500' :
                                                    idx === 2 ? 'bg-[#3dcea510] border-[#3DCEA5]/30 text-[#3DCEA5]' :
                                                        'bg-green-50 border-green-200 text-green-500'
                                                }`}>
                                                <step.icon />
                                            </div>

                                            {/* Step Number Badge */}
                                            <div className="absolute top-0 right-1/2 translate-x-10 -translate-y-2 w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
                                                {idx + 1}
                                            </div>

                                            <h5 className="font-bold text-gray-900 mb-1">{step.text}</h5>
                                            <p className="text-xs text-gray-500 px-2">{step.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Detailed Features Grid */}
                <div>
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold text-gray-900">Feature Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                            >
                                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                                <div className="pt-6 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Impact</p>
                                    <p className="text-[#3DCEA5] font-bold mt-1 bg-[#3dcea510] inline-block px-2 py-1 rounded text-sm">
                                        {feature.stats}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-24 text-center">
                    <Link href="/signup" className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-200 bg-[#3DCEA5] rounded-full hover:bg-[#34b38f] hover:shadow-2xl hover:scale-105 shadow-xl shadow-[#3DCEA5]/30">
                        Get Started For Free
                    </Link>
                    <p className="mt-4 text-sm text-gray-500 font-medium">No credit card required for free tier.</p>
                </div>

            </div>
        </div>
    );
}
