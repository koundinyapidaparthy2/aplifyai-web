import { AudioService, TranscriptChunk } from './AudioService';
import { GeminiService, GeneratedAnswer, Question } from '@aplifyai/api';

export interface Suggestion {
    id: string;
    text: string;
    type: 'suggestion' | 'insight' | 'warning';
    timestamp: number;
}

export type SuggestionCallback = (suggestion: Suggestion) => void;
export type TranscriptUpdateCallback = (text: string) => void;

export class MeetingAssistant {
    private audioService: AudioService;
    private geminiService: GeminiService;
    private isRunning: boolean = false;
    private fullTranscript: string = '';
    private lastProcessedLength: number = 0;
    private processingInterval: NodeJS.Timeout | null = null;

    private onSuggestion: SuggestionCallback | null = null;
    private onTranscriptUpdate: TranscriptUpdateCallback | null = null;

    constructor(apiKey: string) {
        this.audioService = new AudioService();
        this.geminiService = new GeminiService(apiKey);
    }

    async start(
        onTranscriptUpdate: TranscriptUpdateCallback,
        onSuggestion: SuggestionCallback
    ) {
        if (this.isRunning) return;

        this.onTranscriptUpdate = onTranscriptUpdate;
        this.onSuggestion = onSuggestion;
        this.isRunning = true;

        // Start audio capture
        const success = await this.audioService.startRecording(
            this.handleTranscriptChunk.bind(this),
            (error) => {
                console.error('AudioService error:', error);
                // You might want to expose an onError callback in MeetingAssistant too
            }
        );

        if (success) {
            // Start periodic processing loop (every 10 seconds)
            this.processingInterval = setInterval(this.processTranscript.bind(this), 10000);
        } else {
            this.isRunning = false;
            throw new Error('Failed to start audio service');
        }
    }

    stop() {
        this.isRunning = false;
        this.audioService.stopRecording();

        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }

    private handleTranscriptChunk(chunk: TranscriptChunk) {
        if (chunk.isFinal) {
            this.fullTranscript += chunk.text + ' ';
            this.onTranscriptUpdate?.(this.fullTranscript);
        } else {
            // Send interim updates for UI responsiveness
            this.onTranscriptUpdate?.(this.fullTranscript + chunk.text);
        }
    }

    private async processTranscript() {
        if (!this.isRunning || this.fullTranscript.length === this.lastProcessedLength) return;

        const newContent = this.fullTranscript.substring(this.lastProcessedLength);
        this.lastProcessedLength = this.fullTranscript.length;

        // Only process if we have enough new content (e.g., > 50 chars)
        if (newContent.length < 50) return;

        try {
            // Create a "virtual" question to prompt Gemini
            const question: Question = {
                id: `meeting-${Date.now()}`,
                questionText: "Analyze this meeting segment and provide a helpful suggestion or insight.",
                type: 'generic',
                maxLength: 200
            };

            // Contextualize the prompt with the transcript
            const prompt = `
        CONTEXT: You are an AI meeting assistant helping a candidate during a job interview.
        
        CURRENT TRANSCRIPT SEGMENT:
        "${newContent}"
        
        FULL TRANSCRIPT CONTEXT:
        "${this.fullTranscript.substring(Math.max(0, this.fullTranscript.length - 2000))}"
        
        TASK: Provide 1 short, actionable suggestion or insight for the candidate.
        - If they are being asked a question, suggest a key point to mention.
        - If they are speaking, suggest a way to wrap up or clarify.
        - Keep it very brief (under 30 words).
      `;

            // We use a lower-level call or adapt generateAnswer. 
            // For now, let's use a custom method on GeminiService if we had one, 
            // but since we don't, we'll hack it via the 'generic' template or add a new method.
            // Actually, let's just use the generic template but override the prompt via a "hack" 
            // or better, add a method to GeminiService later. 
            // For MVP, let's construct a "User Profile" that actually contains the transcript 
            // to trick the existing service, OR just rely on the fact that we can pass custom options?

            // Let's try to use the existing generateAnswer but pass the transcript as "jobData" description?
            // No, that's messy.

            // Ideally we should have added a 'generateContent' method to GeminiService.
            // But let's try to use the existing structure.

            const response = await this.geminiService.generateAnswer(
                { ...question, questionText: prompt }, // Hack: put prompt in question text
                {}, // Empty profile
                {}, // Empty job data
                { temperature: 0.7 }
            );

            if (response && response.answer) {
                this.onSuggestion?.({
                    id: response.questionId,
                    text: response.answer,
                    type: 'suggestion',
                    timestamp: Date.now()
                });
            }

        } catch (error) {
            console.error('Error processing transcript:', error);
        }
    }
}
