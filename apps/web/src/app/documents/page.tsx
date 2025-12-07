'use client';

import { FiFileText, FiUploadCloud } from 'react-icons/fi';

export default function DocumentsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiFileText className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Documents</h1>
                    <p className="text-gray-500 max-w-lg mx-auto mb-8">
                        Manage your resumes and cover letters. Upload different versions for different roles.
                    </p>
                    <div className="glass-card max-w-2xl mx-auto p-8 rounded-2xl border-dashed border-2 border-gray-200 hover:border-[#3DCEA5]/50 transition-colors cursor-pointer group">
                        <FiUploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-4 group-hover:text-[#3DCEA5] transition-colors" />
                        <h3 className="font-bold text-gray-900 mb-1">Upload Resume</h3>
                        <p className="text-sm text-gray-500">Drag and drop or click to upload PDF/Word</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
