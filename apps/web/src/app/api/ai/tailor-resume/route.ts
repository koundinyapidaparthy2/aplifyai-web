import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface TailorResumeRequest {
  jobTitle: string;
  company: string;
  jobDescription: string;
  userProfile: {
    fullName: string;
    summary?: string;
    experience?: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      description: string;
      achievements?: string[];
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      graduationDate: string;
    }>;
    skills?: string[];
    certifications?: string[];
  };
  sectionsToTailor?: ('summary' | 'experience' | 'skills')[];
}

interface TailoredResume {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    bulletPoints: string[];
  }>;
  skills: {
    primary: string[];
    secondary: string[];
  };
  keywords: string[];
  atsScore: number;
  improvements: string[];
}

async function tailorResume(params: TailorResumeRequest): Promise<TailoredResume> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const experienceText = params.userProfile.experience
    ?.map(exp => `
Position: ${exp.title} at ${exp.company}
Duration: ${exp.startDate} - ${exp.endDate || 'Present'}
Description: ${exp.description}
${exp.achievements ? `Achievements: ${exp.achievements.join('; ')}` : ''}
`)
    .join('\n') || 'No experience provided';

  const prompt = `You are an expert resume writer and ATS optimization specialist. Tailor the following resume for a specific job.

CANDIDATE PROFILE:
Name: ${params.userProfile.fullName}

Current Summary:
${params.userProfile.summary || 'Not provided'}

Work Experience:
${experienceText}

Education:
${params.userProfile.education?.map(edu => `${edu.degree} from ${edu.institution} (${edu.graduationDate})`).join(', ') || 'Not provided'}

Current Skills:
${params.userProfile.skills?.join(', ') || 'Not listed'}

Certifications:
${params.userProfile.certifications?.join(', ') || 'None listed'}

TARGET JOB:
Position: ${params.jobTitle}
Company: ${params.company}
Job Description:
${params.jobDescription}

TASK:
Create a tailored resume optimized for this specific job. Return your response in the following JSON format exactly:

{
  "summary": "A 2-3 sentence professional summary tailored to this specific role...",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "startDate": "Start Date",
      "endDate": "End Date or Present",
      "bulletPoints": [
        "Achievement/responsibility bullet point using strong action verbs and quantified results",
        "Another bullet point highlighting relevant experience"
      ]
    }
  ],
  "skills": {
    "primary": ["Most relevant skills from job description"],
    "secondary": ["Other valuable skills"]
  },
  "keywords": ["Important ATS keywords found in job description"],
  "atsScore": 85,
  "improvements": [
    "Specific suggestion for further improvement",
    "Another actionable recommendation"
  ]
}

GUIDELINES:
1. Use strong action verbs (Led, Developed, Increased, Optimized, etc.)
2. Quantify achievements with numbers, percentages, or dollar amounts
3. Match keywords from the job description exactly
4. Keep bullet points concise (1-2 lines each)
5. Prioritize experience relevant to the target role
6. Include skills mentioned in the job description
7. Estimate an ATS score (0-100) based on keyword match

Return ONLY the JSON, no other text.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Parse JSON from response (handle potential markdown code blocks)
  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  }
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  
  try {
    const result = JSON.parse(jsonText.trim());
    return result as TailoredResume;
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    // Return a default structure if parsing fails
    return {
      summary: params.userProfile.summary || '',
      experience: params.userProfile.experience?.map(exp => ({
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        bulletPoints: [exp.description],
      })) || [],
      skills: {
        primary: params.userProfile.skills?.slice(0, 5) || [],
        secondary: params.userProfile.skills?.slice(5) || [],
      },
      keywords: [],
      atsScore: 50,
      improvements: ['Unable to generate improvements - please try again'],
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TailorResumeRequest = await request.json();

    if (!body.jobTitle || !body.jobDescription || !body.userProfile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await tailorResume(body);

    return NextResponse.json({
      tailoredResume: result,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Resume tailoring error:', error);
    return NextResponse.json(
      { error: 'Failed to tailor resume' },
      { status: 500 }
    );
  }
}
