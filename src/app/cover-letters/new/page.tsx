'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/lib/api-config';

function NewCoverLetterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [coverLetterText, setCoverLetterText] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '',
        jobDescription: '',
        jobId: jobId || '',
        preferences: {
            tone: 'professional',
            length: 'medium',
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(getApiUrl('cover-letters/generate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate cover letter');
            }

            setSuccess(true);
            setPdfUrl(data.pdfUrl);
            setCoverLetterText(data.text || '');

            // Redirect to jobs page after 3 seconds
            setTimeout(() => {
                router.push('/jobs');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cover Letter Generated!</h2>
                        <p className="text-gray-600 mb-6">Your personalized cover letter has been created successfully.</p>
                    </div>

                    {coverLetterText && (
                        <div className="mb-6 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <h3 className="font-semibold text-gray-900 mb-2">Preview:</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{coverLetterText}</p>
                        </div>
                    )}

                    <div className="flex justify-center space-x-4">
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700"
                        >
                            Download PDF
                        </a>
                    </div>

                    <p className="text-sm text-gray-500 text-center mt-4">Redirecting to jobs page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Generate Cover Letter</h1>
                    <p className="text-gray-600 mt-2">
                        Create a personalized cover letter tailored to the job description.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Google, Microsoft, Amazon"
                        />
                    </div>

                    {/* Job Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>

                    {/* Job Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Description *
                        </label>
                        <textarea
                            required
                            rows={8}
                            value={formData.jobDescription}
                            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Paste the job description here..."
                        />
                    </div>

                    {/* Tone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tone
                        </label>
                        <select
                            value={formData.preferences.tone}
                            onChange={(e) => setFormData({
                                ...formData,
                                preferences: { ...formData.preferences, tone: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="professional">Professional</option>
                            <option value="enthusiastic">Enthusiastic</option>
                            <option value="formal">Formal</option>
                            <option value="conversational">Conversational</option>
                        </select>
                    </div>

                    {/* Length */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Length
                        </label>
                        <select
                            value={formData.preferences.length}
                            onChange={(e) => setFormData({
                                ...formData,
                                preferences: { ...formData.preferences, length: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="short">Short (1 paragraph)</option>
                            <option value="medium">Medium (2-3 paragraphs)</option>
                            <option value="long">Long (4+ paragraphs)</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                'Generate Cover Letter'
                            )}
                        </button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex">
                        <svg className="h-5 w-5 text-purple-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-purple-800">AI-Powered Cover Letter</h3>
                            <div className="mt-2 text-sm text-purple-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Tailored to the specific job description</li>
                                    <li>Highlights your relevant experience</li>
                                    <li>Professional formatting and tone</li>
                                    <li>Ready to download as PDF</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NewCoverLetterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <NewCoverLetterContent />
        </Suspense>
    );
}
