'use client';

import { useState, useEffect, useCallback } from 'react';

interface AIAssistantChatProps {
  context: 'onboarding' | 'resume' | 'cover-letter' | 'job-search';
  userProfile?: any;
  onSuggestionApply?: (suggestion: any) => void;
  initialMessage?: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Array<{
    type: string;
    text: string;
    data?: any;
  }>;
  timestamp: Date;
}

/**
 * AI Assistant Chat Component
 * 
 * A conversational AI assistant that can help users with:
 * - Onboarding (profile setup, resume tips)
 * - Resume creation and optimization
 * - Cover letter writing
 * - Job search and matching
 */
export function AIAssistantChat({
  context,
  userProfile,
  onSuggestionApply,
  initialMessage,
  className = '',
}: AIAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize with welcome message based on context
  useEffect(() => {
    const welcomeMessages: Record<string, string> = {
      onboarding: `Hi! I'm your AI career assistant. I'll help you set up your profile and get the most out of AplifyAI. 

${initialMessage || "I can help you:"}
• Write a compelling professional summary
• Optimize your skills section
• Improve your work experience descriptions
• Suggest relevant keywords for your industry

What would you like help with?`,
      resume: `Hello! I'm here to help you create an amazing resume. I can:
• Tailor your resume for specific jobs
• Suggest powerful action verbs
• Help quantify your achievements
• Optimize for ATS systems

Paste a job description or tell me what role you're targeting!`,
      'cover-letter': `Hi there! Let me help you write a compelling cover letter. I can:
• Create personalized cover letters
• Match your experience to job requirements
• Suggest engaging opening lines
• Ensure professional formatting

Share the job you're applying for and I'll get started!`,
      'job-search': `Welcome! I'm your job search assistant. I can help you:
• Find jobs matching your skills
• Prepare for interviews
• Research companies
• Negotiate offers

What's your target role or industry?`,
    };

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessages[context] || welcomeMessages.onboarding,
        timestamp: new Date(),
      },
    ]);
  }, [context, initialMessage]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context,
          userProfile,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        suggestions: data.suggestions,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "I'm sorry, I couldn't process that request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, context, userProfile, messages]);

  const handleSuggestionClick = (suggestion: any) => {
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Career Assistant</h3>
            <p className="text-white/70 text-xs">Powered by Gemini</p>
          </div>
        </div>
        <button className="text-white/70 hover:text-white transition-colors">
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Chat Area */}
      {isExpanded && (
        <>
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 bg-white/80 hover:bg-white rounded border border-gray-200 text-xs text-gray-700 transition-colors"
                        >
                          <span className="font-medium text-indigo-600">{suggestion.type}:</span>{' '}
                          {suggestion.text.substring(0, 100)}
                          {suggestion.text.length > 100 && '...'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Collapsed Preview */}
      {!isExpanded && (
        <div className="p-3 text-center text-sm text-gray-500">
          Click to chat with your AI assistant
        </div>
      )}
    </div>
  );
}

export default AIAssistantChat;
