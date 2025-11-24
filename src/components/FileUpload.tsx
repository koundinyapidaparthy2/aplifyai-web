'use client';

import { useState, useRef, DragEvent } from 'react';
import { getApiUrl } from '@/lib/api-config';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    onUploadComplete: (data: any) => void;
    onError: (error: string) => void;
    acceptedTypes?: string[];
    maxSizeMB?: number;
}

export default function FileUpload({
    onFileSelect,
    onUploadComplete,
    onError,
    acceptedTypes = ['.pdf', '.doc', '.docx', '.txt'],
    maxSizeMB = 10,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedTypes.includes(fileExtension)) {
            onError(`Invalid file type. Please upload ${acceptedTypes.join(', ')} files only.`);
            return;
        }

        // Validate file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            onError(`File too large. Maximum size is ${maxSizeMB}MB.`);
            return;
        }

        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('resume', selectedFile);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch(getApiUrl('onboarding/upload-resume'), {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            onUploadComplete(data.data);
        } catch (error: any) {
            console.error('Upload error:', error);
            onError(error.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Drag and Drop Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
          ${selectedFile ? 'bg-green-50 border-green-500' : ''}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                {!selectedFile ? (
                    <>
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className="mt-4 text-sm text-gray-600">
                            {isDragging ? 'Drop your resume here' : 'Drag and drop your resume here, or click to browse'}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                            {acceptedTypes.join(', ').toUpperCase()} up to {maxSizeMB}MB
                        </p>
                    </>
                ) : (
                    <>
                        <svg
                            className="mx-auto h-12 w-12 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="mt-4 text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="mt-1 text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </>
                )}
            </div>

            {/* Upload Progress */}
            {uploading && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Uploading and parsing...</span>
                        <span className="text-sm font-medium text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 text-center">
                        Our AI is extracting your information...
                    </p>
                </div>
            )}

            {/* Upload Button */}
            {selectedFile && !uploading && (
                <button
                    onClick={handleUpload}
                    className="mt-4 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Parse Resume with AI
                </button>
            )}
        </div>
    );
}
