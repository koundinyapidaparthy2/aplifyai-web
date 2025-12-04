'use client';

import React, { useState, useCallback } from 'react';

interface ResumeTailorProps {
  userProfile?: {
    firstName: string;
    lastName: string;
    currentTitle?: string;
    yearsOfExperience?: number;
    skills: string[];
    experienceSummary?: string;
    workExperience?: Array<{
      title: string;
      company: string;
      description?: string;
    }>;
  };
  jobData?: {
    title: string;
    company: string;
    description?: string;
    requirements?: string;
  };
  onTailored?: (result: TailoredResult) => void;
}

interface TailoredResult {
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    tailoredDescription: string;
  }>;
  keywords: string[];
  atsScore: number;
}

export function ResumeTailor({ userProfile, jobData, onTailored }: ResumeTailorProps) {
  const [result, setResult] = useState<TailoredResult | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [sectionsToTailor, setSectionsToTailor] = useState({
    summary: true,
    skills: true,
    experience: true,
  });

  const tailorResume = useCallback(async () => {
    if (!userProfile || !jobData) {
      alert('Please set your profile and job information first');
      return;
    }

    setIsTailoring(true);

    // Simulate AI tailoring (would use @aplifyai/ai-assistant in real implementation)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Extract keywords from job description
    const descriptionWords = (jobData.description || '').toLowerCase().split(/\W+/);
    const requirementWords = (jobData.requirements || '').toLowerCase().split(/\W+/);
    const allWords = [...descriptionWords, ...requirementWords];
    
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']);
    const keywords = [...new Set(allWords.filter(w => w.length > 4 && !commonWords.has(w)))].slice(0, 15);

    const mockResult: TailoredResult = {
      summary: `Results-driven ${userProfile.currentTitle || 'professional'} with ${userProfile.yearsOfExperience || 5}+ years of experience delivering impactful solutions. Proven track record in ${userProfile.skills.slice(0, 2).join(' and ')} with a focus on driving business outcomes. Seeking to leverage expertise as ${jobData.title} at ${jobData.company}.`,
      skills: [
        ...userProfile.skills.filter(skill => 
          keywords.some(kw => skill.toLowerCase().includes(kw) || kw.includes(skill.toLowerCase()))
        ),
        ...userProfile.skills.filter(skill => 
          !keywords.some(kw => skill.toLowerCase().includes(kw) || kw.includes(skill.toLowerCase()))
        )
      ].slice(0, 10),
      experience: userProfile.workExperience?.map(exp => ({
        title: exp.title,
        company: exp.company,
        tailoredDescription: `• Led key initiatives in ${userProfile.skills[0] || 'project management'} resulting in measurable improvements
• Collaborated with cross-functional teams to deliver ${keywords[0] || 'business'} solutions
• Applied expertise in ${userProfile.skills.slice(0, 2).join(', ')} to drive outcomes aligned with organizational goals`
      })) || [],
      keywords,
      atsScore: Math.min(95, 70 + Math.floor(keywords.length * 1.5))
    };

    setResult(mockResult);
    setIsTailoring(false);
    onTailored?.(mockResult);
  }, [userProfile, jobData, onTailored]);

  const copySection = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📄</span>
          <div>
            <h2 className="text-lg font-bold">Resume Tailor</h2>
            <p className="text-xs text-blue-100">Optimize your resume for ATS and recruiters</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Job Info Display */}
        {jobData && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tailoring for:</p>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              {jobData.title} at {jobData.company}
            </p>
          </div>
        )}

        {/* Sections to Tailor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sections to Tailor
          </label>
          <div className="flex gap-3">
            {Object.entries(sectionsToTailor).map(([section, enabled]) => (
              <label key={section} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setSectionsToTailor(prev => ({
                    ...prev,
                    [section]: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {section}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tailor Button */}
        <button
          onClick={tailorResume}
          disabled={isTailoring || !jobData}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTailoring ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing & Tailoring...
            </span>
          ) : (
            '🎯 Tailor Resume for This Job'
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* ATS Score */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ATS Compatibility Score</span>
                <span className={`text-2xl font-bold ${result.atsScore >= 80 ? 'text-green-600' : result.atsScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {result.atsScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${result.atsScore >= 80 ? 'bg-green-500' : result.atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${result.atsScore}%` }}
                />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Keywords Detected</h3>
                <button
                  onClick={() => copySection(result.keywords.join(', '))}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  📋 Copy
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            {sectionsToTailor.summary && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tailored Summary</h3>
                  <button
                    onClick={() => copySection(result.summary)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.summary}</p>
                </div>
              </div>
            )}

            {/* Skills */}
            {sectionsToTailor.skills && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioritized Skills</h3>
                  <button
                    onClick={() => copySection(result.skills.join(', '))}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className={`px-2 py-1 text-xs rounded-full ${
                        i < 5 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {sectionsToTailor.experience && result.experience.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tailored Experience Bullets</h3>
                <div className="space-y-3">
                  {result.experience.map((exp, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
                          {exp.title} at {exp.company}
                        </p>
                        <button
                          onClick={() => copySection(exp.tailoredDescription)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 font-sans">
                        {exp.tailoredDescription}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeTailor;
