'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api-config';
import FileUpload from '@/components/FileUpload';

type OnboardingStep = 'welcome' | 'method' | 'upload' | 'manual' | 'review' | 'complete';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    onboardingComplete: boolean;
    onboardingStep: number;
}

interface ProfileData {
    summary?: string;
    location?: string;
    experience?: any[];
    education?: any[];
    skills?: any[];
    projects?: any[];
    certifications?: any[];
}

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<ProfileData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch(getApiUrl('auth/me'));
            const data = await response.json();

            if (!response.ok) {
                router.push('/login');
                return;
            }

            setUser(data.user);

            if (data.user.onboardingComplete) {
                router.push('/dashboard');
                return;
            }

            const stepMap: OnboardingStep[] = ['welcome', 'method', 'upload', 'review', 'complete'];
            setCurrentStep(stepMap[data.user.onboardingStep] || 'welcome');
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const goToStep = (step: OnboardingStep) => {
        setCurrentStep(step);
        setError('');
    };

    const handleFileSelect = (file: File) => {
        console.log('File selected:', file.name);
    };

    const handleUploadComplete = (data: ProfileData) => {
        console.log('Upload complete:', data);
        setProfileData(data);
        goToStep('review');
    };

    const handleUploadError = (errorMsg: string) => {
        setError(errorMsg);
    };

    const handleManualDataSubmit = (data: ProfileData) => {
        setProfileData(data);
        goToStep('review');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Progress Bar */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-medium text-gray-700">Getting Started</h2>
                        <span className="text-sm text-gray-500">
                            {currentStep === 'welcome' && 'Step 1 of 4'}
                            {currentStep === 'method' && 'Step 2 of 4'}
                            {(currentStep === 'upload' || currentStep === 'manual') && 'Step 3 of 4'}
                            {currentStep === 'review' && 'Step 4 of 4'}
                            {currentStep === 'complete' && 'Complete!'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width:
                                    currentStep === 'welcome'
                                        ? '25%'
                                        : currentStep === 'method'
                                            ? '50%'
                                            : currentStep === 'upload' || currentStep === 'manual'
                                                ? '75%'
                                                : '100%',
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {currentStep === 'welcome' && <WelcomeStep user={user} onNext={() => goToStep('method')} />}
                {currentStep === 'method' && (
                    <MethodSelectionStep
                        onSelectUpload={() => goToStep('upload')}
                        onSelectManual={() => goToStep('manual')}
                    />
                )}
                {currentStep === 'upload' && (
                    <ResumeUploadStep
                        onFileSelect={handleFileSelect}
                        onUploadComplete={handleUploadComplete}
                        onError={handleUploadError}
                        onBack={() => goToStep('method')}
                    />
                )}
                {currentStep === 'manual' && (
                    <ManualEntryStep
                        onSubmit={handleManualDataSubmit}
                        onBack={() => goToStep('method')}
                    />
                )}
                {currentStep === 'review' && (
                    <ReviewStep
                        data={profileData}
                        onComplete={() => goToStep('complete')}
                        onBack={() => goToStep('method')}
                    />
                )}
                {currentStep === 'complete' && <CompleteStep />}
            </div>
        </div>
    );
}

// Step 1: Welcome
function WelcomeStep({ user, onNext }: { user: User | null; onNext: () => void }) {
    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome to AplifyAI, {user?.firstName}!
                </h1>
                <p className="text-lg text-gray-600">
                    Let's set up your profile so we can create amazing resumes and cover letters for you.
                </p>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="ml-3 text-gray-700">AI-powered resume optimization</p>
                </div>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="ml-3 text-gray-700">Personalized cover letters</p>
                </div>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="ml-3 text-gray-700">ATS-friendly templates</p>
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
                Get Started
            </button>
        </div>
    );
}

// Step 2: Method Selection
function MethodSelectionStep({
    onSelectUpload,
    onSelectManual,
}: {
    onSelectUpload: () => void;
    onSelectManual: () => void;
}) {
    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">How would you like to start?</h2>
            <p className="text-gray-600 mb-8 text-center">Choose the method that works best for you</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={onSelectUpload}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Upload your existing resume and let our AI extract your information automatically.
                    </p>
                    <div className="flex items-center text-sm text-indigo-600 font-medium">
                        <span>Quick & Easy</span>
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>

                <button
                    onClick={onSelectManual}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Manually</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Fill out your information step by step with our guided form.
                    </p>
                    <div className="flex items-center text-sm text-purple-600 font-medium">
                        <span>More Control</span>
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
}

// Step 3a: Resume Upload
function ResumeUploadStep({
    onFileSelect,
    onUploadComplete,
    onError,
    onBack,
}: {
    onFileSelect: (file: File) => void;
    onUploadComplete: (data: any) => void;
    onError: (error: string) => void;
    onBack: () => void;
}) {
    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
            <p className="text-gray-600 mb-6">
                Our AI will automatically extract your experience, education, skills, and more.
            </p>

            <FileUpload
                onFileSelect={onFileSelect}
                onUploadComplete={onUploadComplete}
                onError={onError}
            />

            <div className="mt-6">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
                    ← Back
                </button>
            </div>
        </div>
    );
}

// Step 3b: Manual Entry
function ManualEntryStep({
    onSubmit,
    onBack,
}: {
    onSubmit: (data: ProfileData) => void;
    onBack: () => void;
}) {
    const [formData, setFormData] = useState<ProfileData>({
        summary: '',
        location: '',
        experience: [],
        education: [],
        skills: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save to backend
        try {
            const response = await fetch(getApiUrl('onboarding/manual-entry'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save');

            onSubmit(formData);
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell Us About Yourself</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Summary
                    </label>
                    <textarea
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Brief overview of your professional background..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="City, State"
                    />
                </div>

                <div className="flex justify-between pt-4">
                    <button type="button" onClick={onBack} className="text-gray-600 hover:text-gray-900">
                        ← Back
                    </button>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700"
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
}

// Step 4: Review
function ReviewStep({
    data,
    onComplete,
    onBack,
}: {
    data: ProfileData;
    onComplete: () => void;
    onBack: () => void;
}) {
    const handleComplete = async () => {
        try {
            const response = await fetch(getApiUrl('onboarding/complete'), {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to complete');

            onComplete();
        } catch (error) {
            console.error('Complete error:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Profile</h2>

            <div className="space-y-6">
                {data.summary && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                        <p className="text-gray-700">{data.summary}</p>
                    </div>
                )}

                {data.experience && data.experience.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                        <div className="space-y-4">
                            {data.experience.map((exp: any, idx: number) => (
                                <div key={idx} className="border-l-2 border-indigo-500 pl-4">
                                    <p className="font-medium">{exp.title} at {exp.company}</p>
                                    <p className="text-sm text-gray-600">{exp.period}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.skills && data.skills.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                        <div className="space-y-2">
                            {data.skills.map((skill: any, idx: number) => (
                                <div key={idx}>
                                    <span className="font-medium">{skill.category}:</span>{' '}
                                    <span className="text-gray-700">{skill.items}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6 mt-6 border-t">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
                    ← Back
                </button>
                <button
                    onClick={handleComplete}
                    className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700"
                >
                    Complete Setup
                </button>
            </div>
        </div>
    );
}

// Step 5: Complete
function CompleteStep() {
    const router = useRouter();

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
            <p className="text-gray-600 mb-8">Your profile is complete. Let's create your first resume!</p>
            <button
                onClick={() => router.push('/dashboard')}
                className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-indigo-700"
            >
                Go to Dashboard
            </button>
        </div>
    );
}
