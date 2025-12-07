import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
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

        // Use Gemini 2.0 Flash (Experimental) - NO FALLBACK
        console.log('Using gemini-2.0-flash-exp...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }, { apiVersion: 'v1beta' });

        // --- STAGE 1: EXTRACTION ---
        console.log('Stage 1: Analzying Resume...');
        const extractionPrompt = `
            You are an expert HR AI. Extract structured data from this resume.
            
            CRITICAL ANALYSIS:
            1. **International Status**: Determine if the candidate is an "International" applicant. Look for:
               - Education in a foreign country (different from target location).
               - Explicit mentions of "Visa", "F1", "H1B", "OPT", "Sponsorship".
               - Current location vs. Target role location.
            2. **Work Authorization**: specific mentions of "Authorized to work", "US Citizen", "Green Card", "PR".
            3. **Sponsorship**: Does the candidate mention requiring sponsorship now or in the future?
            4. **Veteran Status**: Look for military service or "Veteran" mentions.
            
            OUTPUT FORMAT (JSON ONLY):
            {
                "firstName": "string",
                "lastName": "string",
                "email": "string",
                "phone": "string",
                "location": "string (City, State/Country)",
                "country": "string (e.g. 'United States', 'Australia', 'United Kingdom')",
                "isInternational": boolean,
                "workAuthorization": "string (e.g. 'US Citizen', 'F1 Visa', 'Authorized')",
                "requiresSponsorship": boolean,
                "isVeteran": boolean,
                "fieldOfStudy": "string (e.g. 'Computer Science', 'Business', 'Nursing')",
                "jobTitle": "string",
                "experienceLevel": "Entry" | "Mid" | "Senior" | "Executive",
                "skills": ["string"],
                "targetRoles": ["string (inferred from experience)"],
                "summary": "string"
            }
            Do not include Markdown. Just JSON.
        `;

        const extractionResult = await model.generateContent([
            extractionPrompt,
            { inlineData: { data: base64Data, mimeType: file.type } }
        ]);

        if (!extractionResult || !extractionResult.response) {
            throw new Error('No response from AI model');
        }

        const text = extractionResult.response.text();
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
        const countryKey = (parsedData.country || 'Unknown').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const fieldKey = (parsedData.fieldOfStudy || 'General').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const patternId = `${countryKey}_${fieldKey}`;

        let questions: string[] = [];

        // 1. Compliance & Logistics Questions (Mandatory based on profile)
        const complianceQuestions = [];

        // Work Auth / Sponsorship
        if (parsedData.isInternational || parsedData.requiresSponsorship) {
            complianceQuestions.push(`Are you legally authorized to work in ${parsedData.country}?`);
            complianceQuestions.push("Will you now or in the future require sponsorship for employment visa status?");
        } else {
            // Ask anyway if ambiguous, or standard "Are you authorized to work in..."
            complianceQuestions.push(`Are you legally authorized to work in ${parsedData.country}?`);
        }

        // Veteran
        if (parsedData.isVeteran) {
            complianceQuestions.push("Can you describe how your military experience translates to this corporate role?");
        }

        // Location Specific (e.g. UK/Australia specific checks)
        if (parsedData.country?.toLowerCase().includes('australia')) {
            complianceQuestions.push("Do you have full working rights in Australia?");
        }
        if (parsedData.country?.toLowerCase().includes('united kingdom') || parsedData.country?.toLowerCase().includes('uk')) {
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
            console.log(`Cache Miss: Generating new patterns for ${parsedData.country} - ${parsedData.fieldOfStudy}`);

            const patternPrompt = `
                Generate 3 standard, high-value behavioral or technical interview questions asked in ${parsedData.country} for candidates in the field of ${parsedData.fieldOfStudy}.
                Focus on cultural fit and soft skills relevant to the region.
                
                OUTPUT FORMAT (JSON ARRAY ONLY):
                [
                    "Question 1 text...",
                    "Question 2 text...",
                    "Question 3 text..."
                ]
            `;

            const patternResult = await model.generateContent(patternPrompt);
            const patternJson = patternResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            fetchedQuestions = JSON.parse(patternJson);

            // Save to Firestore for future users
            await patternRef.set({
                country: parsedData.country,
                fieldOfStudy: parsedData.fieldOfStudy,
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
            authorized: parsedData.workAuthorization,
            sponsorship: parsedData.requiresSponsorship,
            international: parsedData.isInternational
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
        const answerJson = answerResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const finalQuestions = JSON.parse(answerJson);

        return NextResponse.json({
            success: true,
            data: {
                ...parsedData,
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
