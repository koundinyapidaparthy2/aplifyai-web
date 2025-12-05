import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@aplifyai/ui'
import { MeetingAssistant, Suggestion } from '../../services/MeetingAssistant'
import { ArrowLeft, Mic, MicOff, X } from 'lucide-react';

// TODO: Get this from settings or env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const Session = () => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const assistantRef = useRef<MeetingAssistant | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize assistant
        if (API_KEY) {
            assistantRef.current = new MeetingAssistant(API_KEY);
            // Auto-start listening on mount
            startListening();
        } else {
            console.warn('No API Key found for Gemini');
        }

        return () => {
            assistantRef.current?.stop();
        };
    }, []);

    useEffect(() => {
        // Auto-scroll transcript
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const startListening = async () => {
        if (!assistantRef.current) return;
        try {
            await assistantRef.current.start(
                (text) => setTranscript(text),
                (suggestion) => setSuggestions(prev => [...prev, suggestion])
            );
            setIsListening(true);
        } catch (error) {
            console.error('Failed to start:', error);
            alert('Failed to access microphone. Please check permissions.');
        }
    };

    const stopListening = () => {
        if (assistantRef.current) {
            assistantRef.current.stop();
            setIsListening(false);
        }
    };

    const handleEndSession = () => {
        stopListening();
        navigate('/');
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur z-10">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={handleEndSession} className="text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">Live Session</h1>
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {isListening ? 'Listening...' : 'Paused'}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={isListening ? stopListening : startListening}
                        variant={isListening ? "secondary" : "primary"}
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </Button>
                    <Button onClick={handleEndSession} variant="secondary" className="bg-gray-800 hover:bg-gray-700 text-white">
                        End Session
                    </Button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden">
                {/* Transcript Section */}
                <div className="md:col-span-2 flex flex-col h-full border-r border-gray-800 bg-gray-900">
                    <div className="flex-1 overflow-y-auto p-6 font-mono text-lg leading-relaxed text-gray-300">
                        {transcript ? (
                            <p className="whitespace-pre-wrap">{transcript}</p>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600 italic">
                                Waiting for speech...
                            </div>
                        )}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>

                {/* Suggestions Section */}
                <div className="flex flex-col h-full bg-gray-800/50">
                    <div className="p-4 border-b border-gray-700 bg-gray-800">
                        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <span>✨ AI Copilot</span>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {suggestions.length > 0 ? (
                            suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className="p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-lg hover:border-indigo-500 transition-colors animate-in fade-in slide-in-from-bottom-4"
                                >
                                    <p className="text-gray-200 text-sm leading-relaxed">{suggestion.text}</p>
                                    <span className="text-xs text-gray-500 mt-3 block">
                                        {new Date(suggestion.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-6">
                                <p className="mb-2">No insights yet.</p>
                                <p className="text-xs">I'm listening to the conversation to provide real-time help.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
