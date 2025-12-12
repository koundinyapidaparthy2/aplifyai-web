'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiUploadCloud, FiCheckCircle, FiUser, FiZap, FiGlobe, FiCode, FiEdit3 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@aplifyai/ui';

interface DynamicQuestion {
    id: string;
    question: string;
    answer?: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [status, setStatus] = useState<'idle' | 'scanning' | 'analyzing' | 'complete'>('idle');
    const [loading, setLoading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [parsedData, setParsedData] = useState<any>(null);

    // Data State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        country: '',
        isInternational: false,
        fieldOfStudy: '',
        jobTitle: '',
        skills: '',
        summary: '',
        resume: null as File | null
    });
    const [file, setFile] = useState<File | null>(null);

    const [questions, setQuestions] = useState<DynamicQuestion[]>([]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, resume: file }));
            setFile(e.target.files[0]);
            handleUpload(e.target.files[0]);
        }
    };

    // Dynamic Questions State
    const [selectedCountry, setSelectedCountry] = useState<'USA' | 'Canada' | 'UK'>('USA');
    const [complianceAnswers, setComplianceAnswers] = useState<Record<string, any>>({});

    // Import questions
    const commonQuestions = require('../../data/commonQuestions.json');

    const handleUpload = async (uploadedFile: File) => {
        setStatus('scanning');

        // Progress simulation for visual effect
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 5;
            if (p > 90) clearInterval(interval);
            setProgress(prev => Math.min(prev + (Math.random() * 5), 90));
        }, 100);

        const formData = new FormData();
        formData.append('resume', uploadedFile);

        try {
            const res = await fetch('/api/onboarding/parse', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Parsing failed');

            const data = await res.json();
            clearInterval(interval);
            setProgress(100);

            // Artificial delay to show off the "100%" state and transition smoother
            setTimeout(() => {
                const parsed = data?.parsedData || {};
                setParsedData(parsed);
                setQuestions(data?.dynamicQuestions || []);

                // Pre-fill logic based on inferred data
                const inferredAnswers: Record<string, any> = {};

                // Map parsed country to supported country keys
                const parsedCountryRaw = parsed.country || '';
                let targetCountry: 'USA' | 'Canada' | 'UK' = 'USA';
                if (/canada/i.test(parsedCountryRaw)) targetCountry = 'Canada';
                else if (/united kingdom|uk|britain/i.test(parsedCountryRaw)) targetCountry = 'UK';

                setSelectedCountry(targetCountry);

                if (parsed.compliance) {
                    const countryQuestions = commonQuestions[targetCountry];

                    // Helper to normalize strings for comparison
                    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

                    // Iterate sections (workAuthorization, studentSpecific, etc)
                    Object.keys(countryQuestions).forEach(sectionKey => {
                        countryQuestions[sectionKey].forEach((q: any, qIdx: number) => {
                            const questionId = `${targetCountry}-${sectionKey}-${qIdx}`;

                            // Strategy: Check if we have a direct mapping in parsed.compliance based on keywords
                            // This is heuristic-based.
                            let parsedValue: any = null;

                            // 1. Work Authorization & Visa
                            if (sectionKey === 'workAuthorization') {
                                if (q.question.includes('legally authorized')) parsedValue = parsed.compliance.workAuthorization ? 'Yes' : 'No';
                                if (q.question.includes('require sponsorship')) parsedValue = parsed.compliance.requiresSponsorship ? 'Yes' : 'No';
                                if (q.question.includes('current') && q.question.includes('status')) parsedValue = parsed.compliance.workAuthorization;
                            }

                            // 2. Student
                            if (sectionKey === 'studentSpecific') {
                                if (q.question.includes('currently a student')) parsedValue = parsed.compliance.isStudent ? 'Yes' : 'No';
                            }

                            // 3. Demographics (Diversity)
                            if (sectionKey === 'diversity' || sectionKey === 'eeo') {
                                if (q.question.includes('Gender')) parsedValue = parsed.compliance.gender;
                                if (q.question.includes('Veteran')) parsedValue = parsed.compliance.isVeteran ? 'I am a protected veteran' : 'I am not a protected veteran';
                                if (q.question.includes('Disability')) parsedValue = parsed.compliance.disability;
                            }

                            // Apply the value if found
                            if (parsedValue !== null && parsedValue !== undefined) {
                                if (q.type === 'boolean') {
                                    // Ensure Yes/No format
                                    if (parsedValue === true) inferredAnswers[questionId] = 'Yes';
                                    else if (parsedValue === false) inferredAnswers[questionId] = 'No';
                                    else inferredAnswers[questionId] = parsedValue; // Already string 'Yes'/'No'
                                } else if (q.type === 'select' && q.options) {
                                    // Fuzzy match against options
                                    const bestMatch = q.options.find((opt: string) =>
                                        normalize(opt).includes(normalize(parsedValue)) ||
                                        normalize(parsedValue).includes(normalize(opt))
                                    );
                                    if (bestMatch) inferredAnswers[questionId] = bestMatch;
                                } else {
                                    inferredAnswers[questionId] = parsedValue;
                                }
                            }
                        });
                    });
                }
                setComplianceAnswers(inferredAnswers);

                setStatus('analyzing');

                // Allow time for "analyzing" animations to play before showing complete dashboard
                setTimeout(() => setStatus('complete'), 2500);
            }, 800);

        } catch (error) {
            console.error(error);
            setStatus('idle');
            alert('Failed to parse resume. Please try again.');
        }
    };

    const handleFinalize = async () => {
        try {
            const res = await fetch('/api/onboarding/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...parsedData,
                    dynamicQuestions: questions,
                    complianceAnswers: complianceAnswers // Send all answers, backend can filter by country if needed
                }),
            });

            if (res.ok) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to save profile', error);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#3DCEA5]/30">
            {/* Background */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#3DCEA5] opacity-10 blur-[100px]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4 h-full min-h-screen flex flex-col items-center justify-center py-20">

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="text-center max-w-2xl w-full"
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.8 }}
                                className="mb-8 inline-block"
                            >
                                <div className="relative w-24 h-24 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-[#3DCEA5]/10 border border-slate-100">
                                    <FiUser className="w-12 h-12 text-[#3DCEA5]" />
                                </div>
                            </motion.div>

                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                                Let's Build Your Profile
                            </h1>
                            <p className="text-lg text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">
                                Upload your resume and let our AI analyze your background, skills, and target roles to create a personalized job search strategy.
                            </p>

                            <div className="relative group cursor-pointer max-w-lg mx-auto">
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.doc"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 transition-all duration-300 group-hover:border-[#3DCEA5] group-hover:shadow-lg relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[#3DCEA5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <FiUploadCloud className="w-12 h-12 mx-auto text-slate-400 mb-4 group-hover:text-[#3DCEA5] transition-colors duration-300 transform group-hover:-translate-y-1" />
                                    <p className="text-lg font-semibold text-slate-700 group-hover:text-[#3DCEA5] transition-colors">Click to Upload Resume</p>
                                    <p className="text-sm text-slate-400 mt-2">PDF or DOCX (Max 5MB)</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-md text-center"
                        >
                            <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
                                {/* Rings */}
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-slate-100 rounded-full border-t-[#3DCEA5]"></motion.div>

                                {/* Core */}
                                <div className="text-4xl font-bold text-slate-800 tabular-nums">
                                    {Math.round(progress)}%
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Resume...</h2>
                            <p className="text-slate-500">
                                Extracting skills, experience, and certifications
                            </p>
                        </motion.div>
                    )}

                    {status === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            className="text-center"
                        >
                            <div className="flex gap-2 justify-center mb-8">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 10 }}
                                        animate={{ height: [10, 30, 10] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-2 bg-[#3DCEA5] rounded-full"
                                    />
                                ))}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Generating Match Strategy
                            </h2>
                        </motion.div>
                    )}

                    {status === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-6xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Analysis Complete</h2>
                                    <p className="text-slate-500">Here's what we found from your resume.</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="text-slate-600 hover:text-slate-900 border-slate-200" onClick={() => setStatus('idle')}>Start Over</Button>
                                    <Button className="bg-[#3DCEA5] hover:bg-[#34B38F] text-white font-bold shadow-md shadow-[#3DCEA5]/20" onClick={handleFinalize}>
                                        Save & Continue <FiCheckCircle className="ml-2" />
                                    </Button>
                                </div>
                            </div>

                                {questions && questions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                        className="col-span-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-8"
                                    >
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <FiZap className="text-[#3DCEA5]" /> Recommended Interview Answers
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {questions.map((q, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + (idx * 0.1) }}
                                                    className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-[#3DCEA5]/50 transition-colors group"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-bold text-[#3DCEA5] bg-[#3DCEA5]/10 px-2 py-1 rounded">Q{idx + 1}</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-800 mb-4 h-12 line-clamp-2" title={q.question}>
                                                        {q.question}
                                                    </p>

                                                    <div className="relative">
                                                        <textarea
                                                            className="w-full bg-white text-xs text-slate-600 rounded-xl p-3 border border-slate-200 focus:border-[#3DCEA5] focus:ring-1 focus:ring-[#3DCEA5] focus:outline-none transition-all resize-none custom-scrollbar"
                                                            rows={4}
                                                            defaultValue={q.answer}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}


                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div >
    );
}
