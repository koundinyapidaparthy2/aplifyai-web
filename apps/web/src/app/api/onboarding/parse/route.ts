import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';
import path from 'path';

// Helper to extract text from Vertex AI response
const getResponseText = (response: any) => {
    if (!response.candidates || response.candidates.length === 0) return '';
    return response.candidates[0].content.parts[0].text || '';
};


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Initialize Vertex AI with Service Account (OAuth)
        const project = process.env.GCP_PROJECT_ID || 'jobseek-459701';
        console.log({ project: process.cwd() })
        const location = 'us-central1';

        const vertexAI = new VertexAI({
            project: project,
            location: location,
            googleAuthOptions: {
                keyFilename: path.join(process.cwd(), 'gcp-credentials.json')
            }
        });

        const file = formData.get('resume') as File;

        if (!file) {
            return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Please upload PDF, DOCX, or TXT.' }, { status: 400 });
        }

        // Convert file to base64 for Gemini
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');

        // Use Gemini 1.5 Flash via Vertex AI (OAuth)
        console.log('Using gemini-2.5-flash via Vertex AI...');
        const model = vertexAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // --- STAGE 1: EXTRACTION ---
        console.log('Stage 1: Analzying Resume...');
        const extractionPrompt = `
            You are an expert HR AI. Extract structured data from this resume.
            
            CRITICAL ANALYSIS & INFERENCE:
            1. **International Status**: Determine if the candidate is an "International" applicant. Look for education geography vs target role, explicit visa mentions.
            2. **Work Authorization**: Infer the specific status if possible.
               - USA Options: "U.S. Citizen", "Green Card Holder", "F-1 Student Visa", "H1B", "O1 Visa", "TN", "Other".
               - Canada Options: "Canadian Citizen", "Permanent Resident", "Open Work Permit", "PGWP", "Co-op Work Permit".
               - UK Options: "UK Citizen", "Skilled Worker Visa", "Graduate Route Visa", "Student Visa".
            3. **Demographics (Optional - Only if explicitly stated)**:
               - Gender: "Male", "Female", "Non-binary".
               - Veteran Status: "Protected Veteran", "Not a Protected Veteran".
               - Disability: "Yes", "No".
               - Ethnicity: "Asian", "White", "Black", "Hispanic", etc.
            
            OUTPUT FORMAT (JSON ONLY):
            {
                "personalInfo": {
                    "firstName": "string",
                    "lastName": "string",
                    "email": "string",
                    "phone": "string",
                    "address": {
                        "street": "string",
                        "city": "string",
                        "state": "string",
                        "zip": "string",
                        "country": "string"
                    },
                    "urls": {
                        "linkedin": "string",
                        "github": "string",
                        "portfolio": "string",
                        "other": ["string"]
                    }
                },
                "education": [
                    {
                        "university": "string",
                        "degree": "string",
                        "startDate": "string",
                        "endDate": "string",
                        "gpa": "string",
                        "location": "string",
                        "coursework": ["string"]
                    }
                ],
                "workExperience": [
                    {
                        "company": "string",
                        "jobTitle": "string",
                        "startDate": "string",
                        "endDate": "string",
                        "location": "string",
                        "technologies": ["string"],
                        "responsibilities": ["string"]
                    }
                ],
                "projects": [
                    {
                        "name": "string",
                        "techStack": ["string"],
                        "description": ["string"],
                        "githubLink": "string",
                        "demoLink": "string"
                    }
                ],
                "skills": {
                    "languages": ["string"],
                    "frameworksAndLibraries": ["string"],
                    "toolsAndPlatforms": ["string"],
                    "cloudAndDeployment": ["string"],
                    "databases": ["string"],
                    "softSkills": ["string"]
                },
                "certifications": [
                    {
                        "name": "string",
                        "issuer": "string",
                        "date": "string",
                        "idOrUrl": "string"
                    }
                ],
                "awards": [
                    {
                        "title": "string",
                        "description": "string",
                        "date": "string"
                    }
                ],
                "publications": [
                    {
                        "title": "string",
                        "description": "string",
                        "link": "string",
                        "date": "string"
                    }
                ],
                "volunteerWork": [
                    {
                        "organization": "string",
                        "role": "string",
                        "startDate": "string",
                        "endDate": "string",
                        "contributions": ["string"]
                    }
                ],
                "summary": "string",
                "additional": {
                    "languagesSpoken": ["string"],
                    "interests": ["string"]
                },
                
                "compliance": {
                    "isInternational": boolean,
                    "workAuthorization": "string (Inferred specific status like 'F-1 Student Visa' or 'Green Card Holder')",
                    "requiresSponsorship": boolean,
                    "isVeteran": boolean,
                    "isStudent": boolean,
                    "gender": "string (inferred if present)",
                    "race": "string (inferred if present)",
                    "disability": "string (inferred if present)"
                },
                
                "inferred": {
                    "yearsOfExperience": number,
                    "fieldOfStudy": "string (Major/Degree focus)",
                    "primaryRole": "string",
                    "seniorityLevel": "Entry" | "Mid" | "Senior" | "Executive" | "Staff" | "Principal"
                }
            }
            Do not include Markdown. Just JSON.
        `;
        console.log('DEBUG: Extraction Prompt:', {
            extractionPrompt,
            base64Data,
            file
        });
        const extractionResult = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: extractionPrompt },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: file.type,
                            }
                        }
                    ]
                }
            ]
        });


        if (!extractionResult || !extractionResult.response) {
            throw new Error('No response from AI model');
        }

        const text = getResponseText(extractionResult.response);
        console.log('DEBUG: Raw AI Response:', text);

        // Sanitize JSON
        const cleanupJson = (str: string) => {
            return str
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
        };

        const extractionJson = cleanupJson(text);

        let parsedData;
        try {
            parsedData = JSON.parse(extractionJson);
        } catch (jsonError) {
            console.error('JSON Parse Error:', jsonError);
            console.error('Failed JSON string:', extractionJson);
            throw new Error('Failed to parse AI response as JSON');
        }

        console.log('DEBUG: Parsed Data:', parsedData);

        // --- STAGE 2: PATTERN MATCHING & QUESTION GENERATION ---
        console.log('Stage 2: Checking Interview Patterns...');

        // Normalize keys for DB lookup
        // Normalize keys for DB lookup
        let country = parsedData.personalInfo?.address?.country;

        // Fallback 1: Check personalInfo.location string
        if (!country && parsedData.personalInfo?.location) {
            const loc = parsedData.personalInfo.location.toLowerCase();
            if (loc.includes('usa') || loc.includes('united states') || loc.includes(' ny ') || loc.includes(' ca ')) country = 'United States';
            else if (loc.includes('canada') || loc.includes(' on ') || loc.includes(' bc ')) country = 'Canada';
            else if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('london')) country = 'United Kingdom';
        }

        // Fallback 2: Check Education Locations (taking the most recent)
        if (!country && parsedData.education && parsedData.education.length > 0) {
            const eduLoc = parsedData.education[0].location?.toLowerCase() || '';
            if (eduLoc.includes('usa') || eduLoc.includes('united states') || eduLoc.includes('ny')) country = 'United States';
            else if (eduLoc.includes('canada')) country = 'Canada';
            else if (eduLoc.includes('uk') || eduLoc.includes('united kingdom')) country = 'United Kingdom';
        }

        country = country || 'United States'; // Default to US if completely unknown

        const fieldOfStudy = parsedData.inferred?.fieldOfStudy || 'General';

        const countryKey = country.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const fieldKey = fieldOfStudy.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const patternId = `${countryKey}_${fieldKey}`;

        let questions: string[] = [];

        // 1. Compliance & Logistics Questions (Mandatory based on profile)
        const complianceQuestions = [];
        const compliance = parsedData.compliance || {};

        // Work Auth / Sponsorship
        if (compliance.isInternational || compliance.requiresSponsorship) {
            complianceQuestions.push(`Are you legally authorized to work in ${country}?`);
            complianceQuestions.push("Will you now or in the future require sponsorship for employment visa status?");
        } else {
            // Ask anyway if ambiguous, or standard "Are you authorized to work in..."
            complianceQuestions.push(`Are you legally authorized to work in ${country}?`);
        }

        // Veteran
        if (compliance.isVeteran) {
            complianceQuestions.push("Can you describe how your military experience translates to this corporate role?");
        }

        // Location Specific (e.g. UK/Australia specific checks)
        if (country.toLowerCase().includes('australia')) {
            complianceQuestions.push("Do you have full working rights in Australia?");
        }
        if (country.toLowerCase().includes('united kingdom') || country.toLowerCase().includes('uk')) {
            complianceQuestions.push("Do you have the Right to Work in the UK?");
        }

        // Check Firestore Cache for *Behavioral/Technical* questions
        const patternRef = adminDb.collection(COLLECTIONS.INTERVIEW_PATTERNS).doc(patternId);
        const patternDoc = await patternRef.get();
        let fetchedQuestions = [];

        if (patternDoc.exists) {
            console.log(`Cache Hit: Found patterns for ${patternId}`);
            fetchedQuestions = patternDoc.data()?.questions || [];
        } else {
            console.log(`Cache Miss: Generating new patterns for ${country} - ${fieldOfStudy}`);

            const patternPrompt = `
                Generate 3 standard, high-value behavioral or technical interview questions asked in ${country} for candidates in the field of ${fieldOfStudy}.
                Focus on cultural fit and soft skills relevant to the region.
                
                OUTPUT FORMAT (JSON ARRAY ONLY):
                [
                    "Question 1 text...",
                    "Question 2 text...",
                    "Question 3 text..."
                ]
            `;

            const patternResult = await model.generateContent(patternPrompt);
            const patternText = getResponseText(patternResult.response);
            const patternJson = patternText.replace(/```json/g, '').replace(/```/g, '').trim();
            fetchedQuestions = JSON.parse(patternJson);

            // Save to Firestore for future users
            await patternRef.set({
                country: country,
                fieldOfStudy: fieldOfStudy,
                questions: fetchedQuestions,
                createdAt: new Date()
            });
        }

        // Combine Questions: Deduplicate + Priority
        const allQuestionsSet = new Set([...complianceQuestions, ...fetchedQuestions]);
        questions = Array.from(allQuestionsSet).slice(0, 5); // Limit to top 5

        // --- STAGE 3: AUTO-ANSWERING ---
        console.log('Stage 3: Auto-Answering Questions...');

        const answerPrompt = `
            Based on the candidate's resume, generate professional answers to these interview questions.
            Maintain a first-person perspective ("I have..."). Keep answers concise (under 200 words).
            
            For "Yes/No" questions about authorization/sponsorship:
            - Answer truthfully based on the extracted data: ${JSON.stringify({
            authorized: compliance.workAuthorization,
            sponsorship: compliance.requiresSponsorship,
            international: compliance.isInternational
        })}
            - If unknown, answer conservatively (e.g., "I am currently authorized..." or "I may require sponsorship...").

            Resume Context: ${JSON.stringify(parsedData)}
            Questions: ${JSON.stringify(questions)}

            OUTPUT FORMAT (JSON ARRAY of objects):
            [
                { "id": "q1", "question": "Question text...", "answer": "Generated answer..." },
                 ...
            ]
        `;

        const answerResult = await model.generateContent(answerPrompt);
        const answerText = getResponseText(answerResult.response);
        const answerJson = answerText.replace(/```json/g, '').replace(/```/g, '').trim();
        const finalQuestions = JSON.parse(answerJson);

        return NextResponse.json({
            success: true,
            data: {
                ...parsedData,
                country: country, // Explicitly return the inferred country
                dynamicQuestions: finalQuestions,
                meta: {
                    patternSource: patternDoc.exists ? 'database' : 'generated',
                    patternId: patternId
                }
            }
        });

    } catch (error: any) {
        console.error('Resume parsing error:', error);
        return NextResponse.json({
            error: `Failed to parse resume: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}
