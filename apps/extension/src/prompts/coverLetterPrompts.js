/**
 * Cover Letter Intelligence Prompts
 * 
 * Advanced Gemini API prompt templates for intelligent cover letter generation.
 * 
 * Features:
 * - Research-informed personalization
 * - Tone matching
 * - Company-specific references
 * - Value alignment
 * - Dynamic CTA generation
 */

const CoverLetterPrompts = {
  /**
   * Generate personalized cover letter with research context
   */
  generatePersonalizedCoverLetter: (resume, jobDescription, companyResearch, jobAnalysis) => {
    const { companyName, news, values, about, culture, leadership, achievements } = companyResearch;
    const { jobTitle, skills, seniorityLevel, emphasis } = jobAnalysis;

    return `You are an expert cover letter writer. Generate a highly personalized, compelling cover letter using the comprehensive research provided below.

CANDIDATE INFORMATION:
Name: ${resume.personalInfo?.name || '[Name]'}
Email: ${resume.personalInfo?.email || '[Email]'}
Phone: ${resume.personalInfo?.phone || '[Phone]'}

Experience:
${resume.experience?.map(exp => 
  `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})
   Top achievements: ${exp.responsibilities?.slice(0, 3).join('; ')}`
).join('\n') || 'No experience listed'}

Skills: ${resume.skills?.join(', ') || 'No skills listed'}

JOB DETAILS:
Company: ${companyName}
Position: ${jobTitle}
Seniority Level: ${seniorityLevel}
Required Skills: ${skills.required?.slice(0, 5).join(', ') || 'Not specified'}
Job Emphasis: ${emphasis.primary} (${emphasis.distribution[0]?.percentage}%)

COMPANY RESEARCH (Use this to personalize!):

1. Recent News:
${news.mostRecent ? 
  `- ${news.mostRecent.title} (${news.mostRecent.date || 'Recent'})
  - Category: ${news.mostRecent.category}
  - Sentiment: ${news.mostRecent.sentiment}
  - Snippet: ${news.mostRecent.snippet}` 
  : '- No recent news found'}

2. Company Values:
${values.values?.map(v => `- ${v.value}: ${v.context || 'Core company value'}`).join('\n') || '- No values data'}

3. Company Mission:
${about.mission || 'No mission statement found'}

4. Company Culture:
- Primary culture: ${culture.primary}
- Tone: ${culture.tone} (formality level)
- Top traits: ${culture.top3?.map(t => t.name).join(', ')}

5. Leadership:
${leadership.hiringManager ? 
  `- Hiring Manager: ${leadership.hiringManager.name} (${leadership.hiringManager.title})`
  : leadership.ceo ? 
  `- CEO: ${leadership.ceo.name} (for context only)`
  : '- No leadership info found'}

6. Recent Achievements:
${achievements.items?.slice(0, 2).map(a => `- ${a.title} (${a.category})`).join('\n') || '- No achievements found'}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
Generate a personalized cover letter that:

1. GREETING:
   ${leadership.hiringManager ? 
     `- Address to: Dear ${leadership.hiringManager.name},` 
     : '- Use: Dear Hiring Manager,'}

2. OPENING PARAGRAPH (Hook):
   - Reference SPECIFIC company news, achievement, or value
   ${news.mostRecent ? 
     `- Consider referencing: "${news.mostRecent.title}"` : ''}
   ${achievements.items?.[0] ? 
     `- Or mention: "${achievements.items[0].title}"` : ''}
   - Connect to why you're applying
   - Be ${culture.tone} in tone (match company culture)

3. BODY PARAGRAPHS (2-3 paragraphs):
   
   Paragraph 1: Skills & Experience Alignment
   - Highlight experience matching ${skills.required?.slice(0, 3).join(', ')}
   - Quantify achievements (use specific metrics from resume)
   - Connect to job's ${emphasis.primary} emphasis
   
   Paragraph 2: Values & Culture Fit
   - Demonstrate alignment with company values: ${values.values?.slice(0, 3).map(v => v.value).join(', ')}
   - Reference specific examples from your experience
   - Show understanding of ${culture.primary} culture
   
   ${news.items?.length > 0 || achievements.items?.length > 0 ? `
   Paragraph 3: Company-Specific Insight
   - Reference their ${news.mostRecent?.category || achievements.items?.[0]?.category} initiative
   - Explain how you can contribute to their trajectory
   - Show genuine research and interest
   ` : ''}

4. CLOSING PARAGRAPH:
   - Future-focused statement about contributing to ${companyName}
   - Call-to-action matching seniority level:
     ${seniorityLevel === 'entry' || seniorityLevel === 'junior' ? 
       '- Use eager, learning-focused tone' :
     seniorityLevel === 'senior' || seniorityLevel === 'director' ?
       '- Use confident, value-focused tone' :
       '- Use professional, balanced tone'}
   - Express availability for discussion

5. SIGNATURE:
   Sincerely,
   ${resume.personalInfo?.name || '[Your Name]'}

TONE REQUIREMENTS:
- Overall tone: ${culture.tone} (${culture.tone === 'casual' ? 'Use contractions, conversational language' : culture.tone === 'formal' ? 'No contractions, professional language' : 'Balanced professional tone'})
- Energy level: ${culture.primary === 'innovative' || culture.primary === 'fastPaced' ? 'Energetic and enthusiastic' : 'Professional and measured'}
- Personality: ${culture.personality || 'Authentic and genuine'}

QUALITY STANDARDS:
- Length: 300-400 words (approximately 3-4 paragraphs)
- Specificity: Include at least 3 specific references to company research
- Metrics: Include 2-3 quantified achievements from resume
- Originality: Avoid generic phrases like "I am writing to express my interest"
- Authenticity: Sound genuine, not template-based

OUTPUT FORMAT:
Return the complete cover letter as plain text, properly formatted with:
- Greeting
- 3-4 paragraphs with line breaks
- Closing
- Signature

Do not include explanations or metadata, just the letter itself.`;
  },

  /**
   * Enhance existing cover letter with research
   */
  enhanceWithResearch: (existingCoverLetter, companyResearch, jobAnalysis) => {
    return `You are a cover letter enhancement expert. Improve the following cover letter by incorporating company research.

EXISTING COVER LETTER:
${existingCoverLetter}

COMPANY RESEARCH TO INCORPORATE:
- Recent News: ${companyResearch.news?.mostRecent?.title || 'None'}
- Company Values: ${companyResearch.values?.values?.slice(0, 3).map(v => v.value).join(', ') || 'None'}
- Mission: ${companyResearch.about?.mission || 'None'}
- Culture: ${companyResearch.culture?.primary} (${companyResearch.culture?.tone} tone)
- Achievement: ${companyResearch.achievements?.items?.[0]?.title || 'None'}

ENHANCEMENT INSTRUCTIONS:
1. Add specific company references in the opening (news or achievement)
2. Integrate 1-2 company values into body paragraphs with examples
3. Adjust tone to match company culture (${companyResearch.culture?.tone})
4. Strengthen closing with company-specific future statement
5. Maintain existing structure and voice
6. Keep length similar (±20%)

Return the enhanced cover letter only, no explanations.`;
  },

  /**
   * Generate opening paragraph variations
   */
  generateOpeningVariations: (companyResearch, jobAnalysis, count = 5) => {
    return `Generate ${count} different opening paragraph variations for a cover letter.

COMPANY: ${companyResearch.companyName}
POSITION: ${jobAnalysis.jobTitle}

RESEARCH HOOKS:
${companyResearch.news?.mostRecent ? 
  `- Recent News: ${companyResearch.news.mostRecent.title}` : ''}
${companyResearch.achievements?.items?.[0] ? 
  `- Achievement: ${companyResearch.achievements.items[0].title}` : ''}
${companyResearch.values?.values?.[0] ? 
  `- Core Value: ${companyResearch.values.values[0].value}` : ''}
${companyResearch.about?.mission ? 
  `- Mission: ${companyResearch.about.mission.slice(0, 100)}...` : ''}

TONE: ${companyResearch.culture?.tone || 'professional'}
SENIORITY: ${jobAnalysis.seniorityLevel || 'mid-level'}

REQUIREMENTS:
- Each variation should reference different research element
- Match the ${companyResearch.culture?.tone} tone
- 2-4 sentences each
- Variety in approach (news hook, value hook, mission hook, achievement hook)
- ${jobAnalysis.seniorityLevel === 'senior' ? 'Confident and value-focused' : 'Enthusiastic and learning-oriented'}

Return as JSON array:
[
  {
    "variation": 1,
    "hook_type": "news|value|mission|achievement",
    "text": "Opening paragraph text here...",
    "tone": "casual|professional|formal"
  },
  ...
]`;
  },

  /**
   * Generate call-to-action variations
   */
  generateCTAVariations: (companyResearch, jobAnalysis, resume, count = 5) => {
    return `Generate ${count} different call-to-action (closing paragraph) variations for a cover letter.

COMPANY: ${companyResearch.companyName}
POSITION: ${jobAnalysis.jobTitle}
SENIORITY: ${jobAnalysis.seniorityLevel}
CULTURE: ${companyResearch.culture?.primary} (${companyResearch.culture?.tone} tone)

CTA STYLES TO INCLUDE:
${jobAnalysis.seniorityLevel === 'entry' || jobAnalysis.seniorityLevel === 'junior' ?
  '1. Eager (learning-focused, enthusiastic)\n2. Collaborative (team-oriented)' :
  '1. Confident (value proposition, results-focused)\n2. Professional (balanced)'}
3. Enthusiastic (passionate, mission-driven)
4. Discussion-focused (invitation to talk)
5. Future-focused (contributing to company goals)

CONTEXT:
- Company emphasis: ${jobAnalysis.emphasis?.primary}
- Recent news: ${companyResearch.news?.mostRecent?.category || 'None'}
- Culture trait: ${companyResearch.culture?.primary}

REQUIREMENTS:
- Each CTA should be 2-3 sentences
- Match appropriate tone for seniority level
- Include specific reference to company/role
- Express clear next step
- Vary in approach and energy

Return as JSON array:
[
  {
    "variation": 1,
    "style": "eager|confident|professional|enthusiastic|collaborative",
    "text": "CTA text here...",
    "supporting_sentence": "Optional supporting sentence",
    "tone": "casual|professional|formal"
  },
  ...
]`;
  },

  /**
   * Adjust tone to match company culture
   */
  adjustTone: (coverLetter, targetTone, companyName) => {
    const toneGuide = {
      casual: {
        style: 'Conversational, friendly, use contractions',
        vocabulary: 'Simple, direct words (use → love, excited, team)',
        punctuation: 'Exclamation marks okay, em dashes fine',
        example: "I'm super excited about joining the team at [company]!"
      },
      professional: {
        style: 'Balanced, clear, some contractions okay',
        vocabulary: 'Professional but accessible (experienced, qualified)',
        punctuation: 'Balanced, use sparingly',
        example: "I'm excited about the opportunity to contribute to [company]."
      },
      formal: {
        style: 'Traditional business, no contractions',
        vocabulary: 'Formal, sophisticated (utilize, endeavor, demonstrate)',
        punctuation: 'Conservative, avoid exclamations',
        example: "I am writing to express my interest in contributing to [company]."
      }
    };

    const guide = toneGuide[targetTone] || toneGuide.professional;

    return `Adjust the following cover letter to match a ${targetTone.toUpperCase()} tone.

ORIGINAL COVER LETTER:
${coverLetter}

TARGET TONE: ${targetTone}

TONE GUIDE:
- Style: ${guide.style}
- Vocabulary: ${guide.vocabulary}
- Punctuation: ${guide.punctuation}
- Example: ${guide.example.replace('[company]', companyName)}

ADJUSTMENTS TO MAKE:
${targetTone === 'casual' ? 
  `- Add contractions (I am → I'm, I would → I'd)
- Use conversational language
- Add personality and enthusiasm
- Simplify complex sentences` :
targetTone === 'formal' ?
  `- Remove all contractions (I'm → I am, I'd → I would)
- Use formal vocabulary (use → utilize, help → assist)
- Remove exclamation marks
- Maintain professional distance` :
  `- Allow some contractions
- Use clear, professional language
- Balanced enthusiasm
- Clear structure`}

Return the adjusted cover letter only, maintaining structure and key points.`;
  },

  /**
   * Score cover letter quality and personalization
   */
  scoreCoverLetter: (coverLetter, companyResearch, jobAnalysis) => {
    return `Score this cover letter on personalization and quality.

COVER LETTER:
${coverLetter}

COMPANY RESEARCH AVAILABLE:
- Company: ${companyResearch.companyName}
- Recent News: ${companyResearch.news?.count || 0} items
- Values: ${companyResearch.values?.values?.length || 0} identified
- Mission: ${companyResearch.about?.mission ? 'Yes' : 'No'}
- Leadership: ${companyResearch.leadership?.found ? 'Yes' : 'No'}
- Culture: ${companyResearch.culture?.primary}

JOB DETAILS:
- Position: ${jobAnalysis.jobTitle}
- Seniority: ${jobAnalysis.seniorityLevel}
- Key Skills: ${jobAnalysis.skills?.required?.slice(0, 3).join(', ')}

SCORING CRITERIA:

1. PERSONALIZATION (40 points):
   - Uses hiring manager name (10 points)
   - References specific company news (10 points)
   - Mentions company values with examples (10 points)
   - Company-specific insights (10 points)

2. CONTENT QUALITY (30 points):
   - Clear value proposition (10 points)
   - Quantified achievements (10 points)
   - Skills-job alignment (10 points)

3. TONE & STYLE (20 points):
   - Matches company culture tone (10 points)
   - Appropriate for seniority level (10 points)

4. STRUCTURE (10 points):
   - Strong opening hook (3 points)
   - Logical flow (4 points)
   - Clear CTA (3 points)

Return as JSON:
{
  "overall_score": 0-100,
  "category_scores": {
    "personalization": 0-40,
    "content_quality": 0-30,
    "tone_style": 0-20,
    "structure": 0-10
  },
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "personalization_details": {
    "hiring_manager_mentioned": true|false,
    "news_referenced": true|false,
    "values_aligned": true|false,
    "company_insights": true|false
  },
  "improvements": [
    {
      "priority": "high|medium|low",
      "category": "personalization|content|tone|structure",
      "suggestion": "Specific improvement...",
      "example": "Example of how to fix..."
    }
  ],
  "research_utilization": {
    "news": "used|not_used|not_available",
    "values": "used|not_used|not_available",
    "mission": "used|not_used|not_available",
    "leadership": "used|not_used|not_available"
  }
}`;
  },

  /**
   * Generate value alignment examples
   */
  generateValueAlignment: (companyValues, resume, jobAnalysis) => {
    return `Generate specific examples of how the candidate's experience aligns with company values.

COMPANY VALUES:
${companyValues?.values?.map((v, i) => `${i + 1}. ${v.value}: ${v.context || 'Core value'}`).join('\n') || 'None provided'}

CANDIDATE EXPERIENCE:
${resume.experience?.map(exp => 
  `${exp.title} at ${exp.company}:
  - ${exp.responsibilities?.slice(0, 3).join('\n  - ')}`
).join('\n\n') || 'No experience provided'}

JOB EMPHASIS: ${jobAnalysis.emphasis?.primary}

TASK:
For each company value, find 1-2 specific examples from the candidate's experience that demonstrate alignment.

Return as JSON:
[
  {
    "value": "Company value name",
    "examples": [
      {
        "experience": "Brief description from resume",
        "connection": "How this demonstrates the value",
        "suggested_wording": "How to phrase this in cover letter (1-2 sentences)"
      }
    ]
  },
  ...
]

Focus on the top 3-4 most important values.`;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoverLetterPrompts;
}
