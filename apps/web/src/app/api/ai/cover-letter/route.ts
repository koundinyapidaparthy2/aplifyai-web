import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface CoverLetterRequest {
  jobTitle: string;
  company: string;
  jobDescription: string;
  userProfile: {
    fullName: string;
    email: string;
    phone?: string;
    summary?: string;
    experience?: Array<{
      title: string;
      company: string;
      description: string;
    }>;
    skills?: string[];
  };
  style?: 'formal' | 'conversational' | 'creative' | 'concise';
  customInstructions?: string;
}

async function generateCoverLetter(params: CoverLetterRequest): Promise<{
  content: string;
  wordCount: number;
}> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const styleGuides: Record<string, string> = {
    formal: 'Use a formal, traditional business letter tone. Be professional and respectful.',
    conversational: 'Use a warm, conversational yet professional tone. Show personality while remaining appropriate.',
    creative: 'Use a creative, engaging tone that showcases personality and enthusiasm.',
    concise: 'Be extremely concise - keep it to 3 short paragraphs. Every word should count.',
  };

  const experienceText = params.userProfile.experience
    ?.map(exp => `- ${exp.title} at ${exp.company}: ${exp.description}`)
    .join('\n') || 'No experience provided';

  const skillsText = params.userProfile.skills?.join(', ') || 'No skills listed';

  const prompt = `You are an expert cover letter writer. Write a compelling cover letter for the following job application.

CANDIDATE INFORMATION:
Name: ${params.userProfile.fullName}
Email: ${params.userProfile.email}
${params.userProfile.phone ? `Phone: ${params.userProfile.phone}` : ''}

Professional Summary:
${params.userProfile.summary || 'Not provided'}

Relevant Experience:
${experienceText}

Key Skills:
${skillsText}

JOB DETAILS:
Position: ${params.jobTitle}
Company: ${params.company}
Job Description:
${params.jobDescription}

STYLE: ${styleGuides[params.style || 'formal']}

${params.customInstructions ? `ADDITIONAL INSTRUCTIONS: ${params.customInstructions}` : ''}

REQUIREMENTS:
1. Start with an engaging opening that mentions the specific role and company
2. Highlight 2-3 most relevant experiences/achievements that match the job requirements
3. Show genuine interest in the company (if information available in job description)
4. End with a clear call to action
5. Keep the letter between 250-400 words
6. Use professional formatting with proper spacing

Write the cover letter now:`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1500,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return {
    content: content.trim(),
    wordCount: content.trim().split(/\s+/).length,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CoverLetterRequest = await request.json();

    if (!body.jobTitle || !body.company || !body.jobDescription || !body.userProfile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await generateCoverLetter(body);

    return NextResponse.json({
      coverLetter: result.content,
      wordCount: result.wordCount,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}
