/**
 * AudioService - Handles microphone access and speech recognition
 */

export interface TranscriptChunk {
    text: string;
    isFinal: boolean;
    timestamp: number;
}

export type TranscriptCallback = (chunk: TranscriptChunk) => void;

export class AudioService {
    private recognition: SpeechRecognition | null = null;
    private isListening: boolean = false;
    private onTranscript: TranscriptCallback | null = null;
    private stream: MediaStream | null = null;

    constructor() {
        this.initializeSpeechRecognition();
    }

    private initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            // @ts-ignore - webkitSpeechRecognition is not in standard types
            const SpeechRecognition = window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            if (this.recognition) {
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';

                this.recognition.onresult = (event: SpeechRecognitionEvent) => {
                    if (!this.onTranscript) return;

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        const result = event.results[i];
                        const transcript = result[0].transcript;

                        this.onTranscript({
                            text: transcript,
                            isFinal: result.isFinal,
                            timestamp: Date.now()
                        });
                    }
                };

                this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                    console.error('Speech recognition error:', event.error);
                    if (event.error === 'not-allowed') {
                        this.stopRecording();
                    }
                };

                this.recognition.onend = () => {
                    if (this.isListening) {
                        // Restart if it stopped unexpectedly but we still want to listen
                        try {
                            this.recognition?.start();
                        } catch (e) {
                            console.error('Failed to restart recognition:', e);
                        }
                    }
                };
            }
        } else {
            console.error('Speech recognition not supported in this environment');
        }
    }

    async startRecording(onTranscript: TranscriptCallback, onError?: (error: string) => void): Promise<boolean> {
        try {
            console.log('Requesting microphone access...');
            // Request microphone permission first
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted');

            this.onTranscript = onTranscript;
            this.isListening = true;

            if (this.recognition) {
                console.log('Starting speech recognition...');
                this.recognition.start();
                return true;
            } else {
                const error = 'Speech recognition not initialized (webkitSpeechRecognition missing?)';
                console.error(error);
                onError?.(error);
                return false;
            }
        } catch (error: any) {
            console.error('Failed to start recording:', error);
            onError?.(error.message || 'Failed to access microphone');
            return false;
        }
    }

    stopRecording() {
        this.isListening = false;
        this.onTranscript = null;

        if (this.recognition) {
            this.recognition.stop();
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    getIsListening(): boolean {
        return this.isListening;
    }
}
