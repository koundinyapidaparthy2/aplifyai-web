/**
 * Advanced Resume Customization Prompts for Gemini API
 * Sophisticated prompts for job analysis and resume tailoring
 */

const ResumeCustomizationPrompts = {
  /**
   * Job Description Analysis Prompt
   */
  analyzeJobDescription: (jobDescription, companyName, jobTitle) => `
You are an expert career advisor and resume optimization specialist. Analyze the following job description in depth.

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}

JOB DESCRIPTION:
${jobDescription}

Provide a comprehensive analysis in JSON format with the following structure:

{
  "skills": {
    "required": ["skill1", "skill2", ...],
    "preferred": ["skill1", "skill2", ...],
    "technical": [{"name": "skill", "importance": "required|preferred", "frequency": 3}],
    "soft": [{"name": "skill", "importance": "required|preferred"}]
  },
  "keywords": {
    "top": [{"word": "keyword", "weight": 0.05, "context": "where it appears"}],
    "action_verbs": ["led", "developed", "managed"],
    "industry_specific": ["saas", "agile", "cloud-native"]
  },
  "company_culture": {
    "type": "startup|corporate|agency|nonprofit",
    "values": ["innovation", "collaboration"],
    "tone": "formal|professional|casual",
    "emphasis": ["technical_excellence", "team_collaboration", "impact"]
  },
  "requirements": {
    "education": ["bachelor's degree", "master's preferred"],
    "experience_years": 5,
    "must_have": ["requirement 1", "requirement 2"],
    "nice_to_have": ["skill 1", "skill 2"]
  },
  "seniority_level": "junior|mid|senior|staff|director|executive",
  "industry": "technology|finance|healthcare|etc",
  "emphasis_areas": {
    "technical": 30,
    "leadership": 20,
    "collaboration": 25,
    "innovation": 15,
    "impact": 10
  }
}

Analyze thoroughly:
1. Extract all mentioned skills and categorize by importance
2. Identify required vs. nice-to-have qualifications
3. Detect company culture signals (startup vs. corporate, formal vs. casual)
4. Find industry-specific terminology
5. Determine the level of formality in writing style
6. Identify what the role emphasizes most (technical depth, leadership, impact, etc.)
7. Extract key action verbs and phrases used
8. Assess seniority level from title and requirements

Be precise and comprehensive. Return ONLY valid JSON.
`,

  /**
   * Resume Tailoring Prompt
   */
  tailorResume: (resumeData, jobAnalysis) => `
You are an expert resume writer. Tailor this resume to match the job requirements while maintaining authenticity.

CURRENT RESUME:
${JSON.stringify(resumeData, null, 2)}

JOB ANALYSIS:
${JSON.stringify(jobAnalysis, null, 2)}

TAILORING INSTRUCTIONS:
1. Reorder skills to prioritize job requirements (required skills first, then preferred)
2. Adjust tone to match company culture:
   - Formal (${jobAnalysis.formality?.score > 70 ? 'YES' : 'NO'}): Use professional third-person language
   - Casual (${jobAnalysis.formality?.score < 40 ? 'YES' : 'NO'}): Use first-person, show personality
   - Professional (middle ground): Balance professionalism with approachability

3. Emphasize relevant experience based on job emphasis:
   ${jobAnalysis.emphasis?.primary}: Rewrite bullets to highlight this aspect

4. Quantify achievements where possible:
   - Add specific metrics, percentages, dollar amounts
   - Use "Increased by X%", "Reduced by Y", "Managed team of Z"

5. Integrate key keywords naturally:
   Top keywords to include: ${jobAnalysis.keywords?.top.slice(0, 10).map(k => k.word).join(', ')}

6. Adjust summary/objective to match:
   - Seniority level: ${jobAnalysis.seniorityLevel?.level}
   - Company type: ${jobAnalysis.companyType?.type}
   - Primary emphasis: ${jobAnalysis.emphasis?.primary}

7. Section adjustments:
   ${jobAnalysis.seniorityLevel?.level === 'junior' ? '- Put education before experience' : '- Put experience before education'}
   ${jobAnalysis.skills?.certifications.length > 0 ? '- Add certifications section' : ''}

Return the tailored resume in the same JSON structure, with these additions:
{
  ...original_structure,
  "tailoring_notes": {
    "changes_made": ["change 1", "change 2"],
    "keywords_added": ["keyword1", "keyword2"],
    "tone_adjustments": "description of tone changes",
    "emphasis_shifts": "what was emphasized"
  },
  "match_score": 85
}

Maintain truthfulness - do not fabricate experience or skills. Only reorder, rephrase, and emphasize existing content.
`,

  /**
   * Achievement Quantification Prompt
   */
  quantifyAchievements: (achievements) => `
You are a professional resume writer specializing in quantifying achievements.

CURRENT ACHIEVEMENTS (without metrics):
${achievements.map((a, i) => `${i + 1}. ${a}`).join('\n')}

For each achievement, suggest how to add specific, realistic metrics:

Examples of good quantification:
- "Led development of new feature" → "Led team of 4 engineers to develop new feature, increasing user engagement by 35% and reducing load time by 50%"
- "Improved system performance" → "Optimized database queries and caching strategy, improving API response time from 500ms to 120ms (76% improvement)"
- "Managed client relationships" → "Managed portfolio of 15+ enterprise clients with combined $2M annual revenue, maintaining 95% satisfaction rate"

Return JSON array:
[
  {
    "original": "original achievement text",
    "quantified": "achievement with specific metrics",
    "metrics_added": ["30% increase", "5 team members", "$100K savings"],
    "improvement_type": "performance|efficiency|revenue|team|quality"
  }
]

Be realistic - suggest metrics that are plausible for the achievement described.
`,

  /**
   * Variant Optimization Prompt
   */
  optimizeForATS: (resumeData) => `
You are an ATS (Applicant Tracking System) optimization expert.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

Optimize this resume for ATS parsing with these priorities:

1. KEYWORD OPTIMIZATION
   - Identify skill keywords from experience and add to skills section
   - Use industry-standard terminology
   - Include acronyms and full forms (e.g., "API (Application Programming Interface)")

2. FORMATTING RECOMMENDATIONS
   - Use standard section headers: "Professional Experience", "Education", "Skills"
   - Avoid tables, text boxes, headers/footers
   - Single column layout
   - Standard fonts: Arial, Calibri, Times New Roman

3. CONTENT STRUCTURE
   - Lead with strong summary containing keywords
   - Use chronological format for experience
   - Include dates in standard format (MM/YYYY)
   - Use bullet points (not paragraphs)

4. KEYWORD DENSITY
   - Skills section should have 15-20 relevant skills
   - Each experience should mention 3-5 technical skills
   - Use action verbs: led, developed, managed, implemented

Return optimized resume with ATS score (0-100) and specific improvements:
{
  "optimized_resume": {...},
  "ats_score": 85,
  "improvements_made": [
    "Added 8 missing keywords to skills section",
    "Reformatted dates to MM/YYYY format",
    "Simplified formatting for better parsing"
  ],
  "keywords_added": ["keyword1", "keyword2"],
  "ats_compatibility_notes": "Notes on ATS readiness"
}
`,

  /**
   * A/B Testing Variants Prompt
   */
  generateABVariants: (resumeData, jobAnalysis) => `
You are a data-driven resume strategist. Generate two distinct variants for A/B testing.

RESUME: ${JSON.stringify(resumeData, null, 2)}
JOB: ${JSON.stringify(jobAnalysis.metadata, null, 2)}

Create two variants with different strategies:

VARIANT A - "Achievement-Focused"
- Lead with quantified achievements
- Emphasize impact and results
- Use metrics prominently
- Structure: Impact → Action → Context

VARIANT B - "Skill-Focused"  
- Lead with technical expertise
- Emphasize skills and technologies
- Use technical terminology
- Structure: Technology/Skill → Application → Outcome

For each variant, provide:
{
  "variant_a": {
    "strategy": "achievement-focused",
    "resume": {...},
    "hypothesis": "Why this might perform better",
    "target_audience": "Who this appeals to",
    "key_differences": ["difference 1", "difference 2"]
  },
  "variant_b": {
    "strategy": "skill-focused",
    "resume": {...},
    "hypothesis": "Why this might perform better",
    "target_audience": "Who this appeals to",
    "key_differences": ["difference 1", "difference 2"]
  },
  "testing_recommendations": {
    "metrics_to_track": ["interview_rate", "response_time", "feedback"],
    "sample_size": "Apply to at least 20 similar jobs with each variant",
    "success_criteria": "Higher interview request rate"
  }
}
`,

  /**
   * Resume Scoring Prompt
   */
  scoreResume: (resumeData, jobDescription) => `
You are a hiring manager and resume reviewer. Score this resume against the job requirements.

RESUME:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed score breakdown:

{
  "overall_score": 85,
  "category_scores": {
    "keyword_match": {
      "score": 80,
      "details": "8 out of 10 required keywords present",
      "missing_keywords": ["keyword1", "keyword2"]
    },
    "experience_relevance": {
      "score": 90,
      "details": "Strong match with 5+ years in similar role",
      "strengths": ["relevant project experience", "industry knowledge"],
      "gaps": ["missing specific framework experience"]
    },
    "skills_match": {
      "score": 85,
      "required_skills_matched": 9,
      "required_skills_total": 10,
      "missing_skills": ["skill1"]
    },
    "education": {
      "score": 100,
      "meets_requirements": true
    },
    "ats_compatibility": {
      "score": 75,
      "issues": ["complex formatting", "missing keywords in skills section"]
    },
    "quantification": {
      "score": 70,
      "quantified_achievements": 5,
      "total_achievements": 10,
      "improvement_needed": "Add metrics to 5 more achievements"
    },
    "formatting": {
      "score": 85,
      "readability": "good",
      "consistency": "good",
      "issues": []
    }
  },
  "strengths": [
    "Strong technical background with relevant skills",
    "Quantified achievements show impact",
    "Clear career progression"
  ],
  "weaknesses": [
    "Missing some preferred skills",
    "Could add more specific metrics",
    "Summary could be more tailored"
  ],
  "recommendations": [
    {
      "priority": "high",
      "issue": "Add missing keyword: 'GraphQL'",
      "fix": "Mention GraphQL in projects or skills section"
    },
    {
      "priority": "medium",
      "issue": "Quantify more achievements",
      "fix": "Add metrics to experience bullets 3, 5, 7"
    }
  ],
  "estimated_match_percentage": 85
}

Be thorough and constructive in feedback.
`,
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResumeCustomizationPrompts;
}
