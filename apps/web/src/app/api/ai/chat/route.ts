import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface ChatRequest {
  message: string;
  context: 'onboarding' | 'resume' | 'cover-letter' | 'job-search';
  userProfile?: any;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface Suggestion {
  type: string;
  text: string;
  data?: any;
}

/**
 * System prompts for different contexts
 */
const SYSTEM_PROMPTS: Record<string, string> = {
  onboarding: `You are a helpful career assistant helping users set up their professional profile. Your role is to:
1. Help users write compelling professional summaries
2. Suggest relevant skills based on their experience
3. Improve work experience descriptions with strong action verbs
4. Identify gaps in their profile and suggest improvements
5. Provide industry-specific advice

Be encouraging, professional, and concise. When suggesting improvements, provide specific examples.
Format your suggestions as actionable items the user can immediately implement.`,

  resume: `You are an expert resume writer and career coach. Your role is to:
1. Help tailor resumes for specific job descriptions
2. Suggest powerful action verbs and quantifiable achievements
3. Optimize content for ATS (Applicant Tracking Systems)
4. Ensure proper formatting and structure
5. Highlight relevant skills and experiences

Focus on concrete, measurable achievements. Use STAR format (Situation, Task, Action, Result) when helping with experience descriptions.
Always provide before/after examples when suggesting improvements.`,

  'cover-letter': `You are a professional cover letter expert. Your role is to:
1. Help craft personalized cover letters for specific jobs
2. Create compelling opening hooks
3. Connect experience to job requirements
4. Write professional closing statements
5. Ensure appropriate tone and length

Cover letters should be concise (250-400 words), personalized, and showcase genuine interest.
Focus on what the candidate can offer the company, not just what they want from the job.`,

  'job-search': `You are a job search strategist and career advisor. Your role is to:
1. Help identify suitable job opportunities
2. Provide interview preparation tips
3. Research and explain company culture
4. Offer salary negotiation advice
5. Suggest networking strategies

Be supportive and practical. Provide actionable advice that users can implement immediately.
Consider the user's experience level and industry when giving recommendations.`,
};

/**
 * Generate suggestions based on context and response
 */
function generateSuggestions(context: string, response: string, userProfile?: any): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Context-specific suggestion generation
  switch (context) {
    case 'onboarding':
      if (response.toLowerCase().includes('summary') || response.toLowerCase().includes('profile')) {
        suggestions.push({
          type: 'Apply Summary',
          text: 'Click to use this suggested summary in your profile',
          data: { field: 'summary' },
        });
      }
      if (response.toLowerCase().includes('skill')) {
        suggestions.push({
          type: 'Add Skills',
          text: 'Click to add these suggested skills to your profile',
          data: { field: 'skills' },
        });
      }
      break;

    case 'resume':
      if (response.toLowerCase().includes('bullet') || response.toLowerCase().includes('achievement')) {
        suggestions.push({
          type: 'Apply to Resume',
          text: 'Click to add these bullet points to your resume',
          data: { field: 'experience' },
        });
      }
      break;

    case 'cover-letter':
      if (response.includes('Dear') || response.includes('Sincerely')) {
        suggestions.push({
          type: 'Use This Letter',
          text: 'Click to use this cover letter as a starting point',
          data: { field: 'coverLetter' },
        });
      }
      break;
  }

  return suggestions;
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(
  message: string,
  context: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  // Build conversation context
  const systemPrompt = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.onboarding;

  let conversationText = '';
  if (conversationHistory && conversationHistory.length > 0) {
    conversationText = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    conversationText += '\n';
  }

  const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationText}

User: ${message}

Please provide a helpful, specific response. If you're suggesting improvements, provide concrete examples.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('No response generated');
  }

  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { message, context, userProfile, conversationHistory } = body;

    if (!message || !context) {
      return NextResponse.json(
        { error: 'Message and context are required' },
        { status: 400 }
      );
    }

    // Call Gemini API
    const response = await callGeminiAPI(message, context, conversationHistory);

    // Generate context-aware suggestions
    const suggestions = generateSuggestions(context, response, userProfile);

    return NextResponse.json({
      response,
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
