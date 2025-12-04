'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Types for the Electron API
interface ElectronAPI {
  aiAssistant: {
    toggle: () => Promise<boolean>;
    setProfile: (profile: UserProfile) => Promise<{ success: boolean }>;
    setJob: (jobData: JobData) => Promise<{ success: boolean }>;
    getState: () => Promise<AssistantState>;
    setApiKey: (apiKey: string) => Promise<{ success: boolean }>;
    injectScript: (webContentsId: number) => Promise<{ success: boolean; error?: string }>;
    detectQuestions: (webContentsId: number) => Promise<{ success: boolean; questions?: ScreeningQuestion[]; error?: string }>;
    fillField: (webContentsId: number, selector: string, value: string) => Promise<{ success: boolean }>;
    getPageInfo: (webContentsId: number) => Promise<{ success: boolean; url?: string; title?: string; isJobSite?: boolean; error?: string }>;
    onProfileUpdated: (callback: (profile: UserProfile) => void) => () => void;
    onJobUpdated: (callback: (jobData: JobData) => void) => () => void;
    onStateChanged: (callback: (state: AssistantState) => void) => () => void;
  };
  jobBrowser: {
    navigate: (webContentsId: number, url: string) => Promise<{ success: boolean; error?: string }>;
  };
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  skills: string[];
  experienceSummary?: string;
}

interface JobData {
  id?: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
}

interface ScreeningQuestion {
  id: string;
  type: string;
  questionText: string;
  isRequired: boolean;
  currentValue?: string;
}

interface AssistantState {
  isActive: boolean;
  userProfile?: UserProfile;
  currentJobData?: JobData;
}

interface GeneratedAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  confidence?: number;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

// Job site URLs for quick navigation
const JOB_SITES = [
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/', icon: '💼' },
  { name: 'Indeed', url: 'https://www.indeed.com/', icon: '🔍' },
  { name: 'Glassdoor', url: 'https://www.glassdoor.com/Job/index.htm', icon: '🚪' },
  { name: 'ZipRecruiter', url: 'https://www.ziprecruiter.com/', icon: '⚡' },
];

export function AIJobAssistant() {
  const [isElectron, setIsElectron] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'questions' | 'generate'>('browse');
  const [currentUrl, setCurrentUrl] = useState('');
  const [pageInfo, setPageInfo] = useState<{ title?: string; isJobSite?: boolean } | null>(null);
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<string, GeneratedAnswer>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>('');
  
  const webviewRef = useRef<HTMLWebViewElement | null>(null);
  const webContentsId = useRef<number | null>(null);

  // Check if running in Electron
  useEffect(() => {
    const checkElectron = () => {
      setIsElectron(!!window.electron?.aiAssistant);
    };
    checkElectron();
  }, []);

  // Handle webview ready
  const handleWebviewReady = useCallback(async () => {
    if (!webviewRef.current || !window.electron) return;
    
    const webview = webviewRef.current as HTMLWebViewElement & { getWebContentsId?: () => number };
    if (webview.getWebContentsId) {
      webContentsId.current = webview.getWebContentsId();
      
      // Inject content script
      await window.electron.aiAssistant.injectScript(webContentsId.current);
      
      // Get page info
      const info = await window.electron.aiAssistant.getPageInfo(webContentsId.current);
      if (info.success) {
        setPageInfo({ title: info.title, isJobSite: info.isJobSite });
        setCurrentUrl(info.url || '');
      }
    }
  }, []);

  // Navigate to URL
  const navigateToUrl = useCallback(async (url: string) => {
    if (!window.electron || !webContentsId.current) return;
    
    setStatus('Navigating...');
    const result = await window.electron.jobBrowser.navigate(webContentsId.current, url);
    if (result.success) {
      setCurrentUrl(url);
      setStatus('');
    } else {
      setStatus('Navigation failed: ' + result.error);
    }
  }, []);

  // Detect questions on current page
  const detectQuestions = useCallback(async () => {
    if (!window.electron || !webContentsId.current) return;
    
    setStatus('Detecting questions...');
    const result = await window.electron.aiAssistant.detectQuestions(webContentsId.current);
    
    if (result.success && result.questions) {
      setQuestions(result.questions);
      setStatus(`Found ${result.questions.length} questions`);
      setActiveTab('questions');
    } else {
      setStatus('No questions found');
    }
  }, []);

  // Generate answers (mock implementation - would use @aplifyai/ai-assistant)
  const generateAnswers = useCallback(async () => {
    if (questions.length === 0) return;
    
    setIsGenerating(true);
    setStatus('Generating answers...');
    
    // Simulate AI generation (in real implementation, would use GeminiService)
    const newAnswers = new Map<string, GeneratedAnswer>();
    
    for (const question of questions) {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      newAnswers.set(question.id, {
        questionId: question.id,
        questionText: question.questionText,
        answer: `[AI-generated answer for: "${question.questionText.substring(0, 50)}..."]`,
        confidence: 0.85
      });
      
      setStatus(`Generated ${newAnswers.size}/${questions.length} answers`);
    }
    
    setAnswers(newAnswers);
    setIsGenerating(false);
    setStatus('All answers generated!');
    setActiveTab('generate');
  }, [questions]);

  // Fill a single answer
  const fillAnswer = useCallback(async (questionId: string) => {
    if (!window.electron || !webContentsId.current) return;
    
    const answer = answers.get(questionId);
    if (!answer) return;
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    // Get selector (simplified - real implementation would have proper selector)
    const selector = `#${questionId}`;
    
    const result = await window.electron.aiAssistant.fillField(
      webContentsId.current,
      selector,
      answer.answer
    );
    
    if (result.success) {
      setStatus(`Filled answer for: ${answer.questionText.substring(0, 30)}...`);
    }
  }, [answers, questions]);

  // Fill all answers
  const fillAllAnswers = useCallback(async () => {
    setStatus('Filling all answers...');
    
    for (const [questionId] of answers) {
      await fillAnswer(questionId);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setStatus('All answers filled!');
  }, [answers, fillAnswer]);

  if (!isElectron) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🤖</span>
          <h2 className="text-xl font-bold">AI Job Assistant</h2>
        </div>
        <p className="text-purple-100 mb-4">
          The AI Job Assistant requires the desktop app to browse job sites and auto-fill applications.
        </p>
        <a 
          href="/download" 
          className="inline-flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
        >
          <span>⬇️</span>
          Download Desktop App
        </a>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${isExpanded ? 'h-[600px]' : 'h-auto'}`}>
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-lg font-bold">AI Job Assistant</h2>
              <p className="text-xs text-purple-200">{status || 'Ready to help'}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['browse', 'questions', 'generate'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab === 'browse' && '🌐 Browse'}
                {tab === 'questions' && `❓ Questions ${questions.length > 0 ? `(${questions.length})` : ''}`}
                {tab === 'generate' && `✨ Answers ${answers.size > 0 ? `(${answers.size})` : ''}`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 h-[440px] overflow-auto">
            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <div className="space-y-4">
                {/* URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    placeholder="Enter job site URL..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
                    onKeyPress={(e) => e.key === 'Enter' && navigateToUrl(currentUrl)}
                  />
                  <button
                    onClick={() => navigateToUrl(currentUrl)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Go
                  </button>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-2">
                  {JOB_SITES.map((site) => (
                    <button
                      key={site.name}
                      onClick={() => navigateToUrl(site.url)}
                      className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <span className="text-xl">{site.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{site.name}</span>
                    </button>
                  ))}
                </div>

                {/* Webview placeholder */}
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {pageInfo ? (
                    <div className="text-center">
                      <p className="font-medium text-gray-700 dark:text-gray-300">{pageInfo.title}</p>
                      {pageInfo.isJobSite && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-2 inline-block">
                          ✓ Job Site Detected
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Navigate to a job site to get started</p>
                  )}
                </div>

                {/* Action Button */}
                {pageInfo?.isJobSite && (
                  <button
                    onClick={detectQuestions}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    🔍 Detect Application Questions
                  </button>
                )}
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No questions detected yet</p>
                    <button
                      onClick={detectQuestions}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Detect Questions
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        {questions.length} Questions Found
                      </h3>
                      <button
                        onClick={generateAnswers}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {isGenerating ? 'Generating...' : '✨ Generate All Answers'}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {questions.map((question) => (
                        <div
                          key={question.id}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {question.questionText}
                            </p>
                            {question.isRequired && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded shrink-0">
                                Required
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Type: {question.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Generate Tab */}
            {activeTab === 'generate' && (
              <div className="space-y-4">
                {answers.size === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No answers generated yet</p>
                    <button
                      onClick={generateAnswers}
                      disabled={questions.length === 0 || isGenerating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Answers'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        {answers.size} Answers Ready
                      </h3>
                      <button
                        onClick={fillAllAnswers}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        ✍️ Fill All Answers
                      </button>
                    </div>

                    <div className="space-y-3">
                      {Array.from(answers.values()).map((answer) => (
                        <div
                          key={answer.questionId}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <p className="text-xs text-gray-500 mb-1">
                            {answer.questionText.substring(0, 60)}...
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {answer.answer}
                          </p>
                          <div className="flex items-center justify-between">
                            {answer.confidence && (
                              <span className="text-xs text-gray-500">
                                Confidence: {Math.round(answer.confidence * 100)}%
                              </span>
                            )}
                            <button
                              onClick={() => fillAnswer(answer.questionId)}
                              className="text-xs text-purple-600 hover:text-purple-700"
                            >
                              Fill this answer →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AIJobAssistant;
