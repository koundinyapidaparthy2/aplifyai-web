
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { profile } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
            You are an expert career coach. Write a compelling, professional summary (max 3-4 sentences) for a resume based on the following profile.
            Focus on their primary role, key skills, and experience level.
            
            Profile Data:
            ${JSON.stringify(profile, null, 2)}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ summary: text });
    } catch (error) {
        console.error('Error generating summary:', error);
        return NextResponse.json(
            { error: 'Failed to generate summary' },
            { status: 500 }
        );
    }
}
