'use client';

import React, { useState, useCallback } from 'react';

interface CoverLetterGeneratorProps {
  userProfile?: {
    firstName: string;
    lastName: string;
    currentTitle?: string;
    yearsOfExperience?: number;
    skills: string[];
    experienceSummary?: string;
  };
  jobData?: {
    title: string;
    company: string;
    description?: string;
  };
  onGenerated?: (coverLetter: string) => void;
}

type CoverLetterStyle = 'formal' | 'conversational' | 'creative' | 'concise';

const STYLE_OPTIONS: { value: CoverLetterStyle; label: string; description: string }[] = [
  { value: 'formal', label: 'Formal', description: 'Traditional business tone' },
  { value: 'conversational', label: 'Conversational', description: 'Warm yet professional' },
  { value: 'creative', label: 'Creative', description: 'Engaging and unique' },
  { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
];

export function CoverLetterGenerator({ userProfile, jobData, onGenerated }: CoverLetterGeneratorProps) {
  const [style, setStyle] = useState<CoverLetterStyle>('formal');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const generateCoverLetter = useCallback(async () => {
    if (!userProfile || !jobData) {
      alert('Please set your profile and job information first');
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation (would use @aplifyai/ai-assistant in real implementation)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}. With ${userProfile.yearsOfExperience || 'several'} years of experience as a ${userProfile.currentTitle || 'professional'}, I am confident in my ability to make a meaningful contribution to your team.

${userProfile.experienceSummary || 'Throughout my career, I have developed expertise in various areas that align well with this role.'}

My key qualifications include:
${userProfile.skills.slice(0, 3).map(skill => `• ${skill}`).join('\n')}

${jobData.description ? `I am particularly excited about this opportunity because the role involves ${jobData.description.substring(0, 100)}...` : 'I am excited about the opportunity to bring my skills to your organization.'}

I would welcome the opportunity to discuss how my background and skills would be an asset to ${jobData.company}. Thank you for considering my application.

Sincerely,
${userProfile.firstName} ${userProfile.lastName}`;

    setGeneratedLetter(mockLetter);
    setIsGenerating(false);
    onGenerated?.(mockLetter);
  }, [userProfile, jobData, onGenerated]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generatedLetter);
  }, [generatedLetter]);

  const downloadLetter = useCallback(() => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${jobData?.company?.toLowerCase().replace(/\s+/g, '-') || 'job'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedLetter, jobData]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <div>
            <h2 className="text-lg font-bold">Cover Letter Generator</h2>
            <p className="text-xs text-emerald-100">AI-powered personalized cover letters</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Job Info Display */}
        {jobData && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Generating for:</p>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              {jobData.title} at {jobData.company}
            </p>
          </div>
        )}

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Writing Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStyle(option.value)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  style === option.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <p className={`text-sm font-medium ${style === option.value ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {option.label}
                </p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Instructions (Optional)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="E.g., Emphasize my leadership experience, mention my recent project..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 h-20 resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateCoverLetter}
          disabled={isGenerating || !jobData}
          className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            '✨ Generate Cover Letter'
          )}
        </button>

        {/* Generated Letter */}
        {generatedLetter && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Generated Cover Letter</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {editMode ? '👁️ Preview' : '✏️ Edit'}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  📋 Copy
                </button>
                <button
                  onClick={downloadLetter}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>

            {editMode ? (
              <textarea
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="w-full h-80 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 font-mono resize-none"
              />
            ) : (
              <div className="h-80 overflow-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                  {generatedLetter}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CoverLetterGenerator;
