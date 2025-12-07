'use client';

import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { FiSave, FiDownload, FiRefreshCw, FiArrowLeft, FiSettings, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@aplifyai/ui';

export default function ResumeBuilderPage() {
    const [code, setCode] = useState(`\\documentclass{article}
\\usepackage{titlesec}
\\usepackage{titling}
\\usepackage[margin=1in]{geometry}

\\titleformat{\\section}
{\\large\\bfseries}
{}
{0em}
{}

\\titleformat{\\subsection}[runin]
{\\bfseries}
{}
{0em}
{}

\\titlespacing{\\subsection}
{0em}{0em}{1em}

\\begin{document}

\\title{Koundinya Pidaparthy}
\\author{Software Engineer}
\\date{}

\\maketitle

\\section{Contact}
Email: koundinya@example.com \\\\
Phone: (555) 123-4567 \\\\
Linked: linkedin.com/in/koundinya

\\section{Experience}
\\subsection{Senior Software Engineer, Tech Co}
\\textit{San Francisco, CA} \\hfill 2023 - Present
\\begin{itemize}
    \\item Deployed machine learning models to production using AWS SageMaker.
    \\item Optimized React frontend reducing load times by 40\\%.
\\end{itemize}

\\section{Education}
\\subsection{Master of Science, Computer Science}
\\textit{Pace University} \\hfill 2025

\\end{document}`);

    const [isCompiling, setIsCompiling] = useState(false);

    // Simulate compilation
    const handleCompile = () => {
        setIsCompiling(true);
        setTimeout(() => {
            setIsCompiling(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-white">
            {/* Toolbar */}
            <header className="flex-none h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Link href="/documents" className="text-gray-400 hover:text-white transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center font-bold text-xs">A</div>
                        <span className="font-bold text-sm tracking-wide">Latex Builder</span>
                        <span className="text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">Draft</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCompile}
                        disabled={isCompiling}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${isCompiling
                                ? 'bg-primary-900 text-primary-300 cursor-wait'
                                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20'
                            }`}
                    >
                        {isCompiling ? (
                            <>
                                <FiRefreshCw className="w-4 h-4 animate-spin" /> Compiling...
                            </>
                        ) : (
                            <>
                                <FiRefreshCw className="w-4 h-4" /> Recompile
                            </>
                        )}
                    </button>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                        <FiDownload className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                        <FiSave className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                        <FiSettings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Split Screen Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Panel (Left) */}
                <div className="w-1/2 border-r border-gray-700 flex flex-col">
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            defaultLanguage="latex"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                padding: { top: 20 },
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>
                </div>

                {/* Preview Panel (Right) */}
                <div className="w-1/2 bg-gray-500 relative flex flex-col">
                    {/* Mock PDF Viewer Header */}
                    <div className="h-10 bg-gray-200 border-b border-gray-300 flex items-center justify-between px-4">
                        <div className="text-xs text-gray-600 font-medium">Page 1 / 1</div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-blue-500"></div>
                            </div>
                            <span className="text-xs text-gray-500">75%</span>
                        </div>
                    </div>

                    {/* PDF Placeholder */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-300 flex items-start justify-center">
                        <div className="bg-white shadow-2xl w-[21cm] min-h-[29.7cm] relative transition-opacity duration-300" style={{ opacity: isCompiling ? 0.5 : 1 }}>
                            {/* Mock Content imitating the Latex */}
                            <div className="p-12 text-gray-900 font-serif leading-relaxed">
                                <h1 className="text-3xl font-bold mb-1 text-center">Koundinya Pidaparthy</h1>
                                <p className="text-center text-gray-600 mb-6 border-b pb-4">Software Engineer</p>

                                <h2 className="text-lg font-bold uppercase mb-2 border-b border-gray-900 pb-1">Contact</h2>
                                <div className="mb-4 text-sm">
                                    <p>Email: <span className="font-mono text-gray-600">koundinya@example.com</span></p>
                                    <p>Phone: (555) 123-4567</p>
                                    <p>Linked: linkedin.com/in/koundinya</p>
                                </div>

                                <h2 className="text-lg font-bold uppercase mb-2 border-b border-gray-900 pb-1">Experience</h2>
                                <div className="mb-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold">Senior Software Engineer, Tech Co</h3>
                                        <span className="text-sm">2023 - Present</span>
                                    </div>
                                    <p className="text-sm italic mb-2">San Francisco, CA</p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>Deployed machine learning models to production using AWS SageMaker.</li>
                                        <li>Optimized React frontend reducing load times by 40%.</li>
                                    </ul>
                                </div>

                                <h2 className="text-lg font-bold uppercase mb-2 border-b border-gray-900 pb-1">Education</h2>
                                <div className="mb-4">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold">Master of Science, Computer Science</h3>
                                        <span className="text-sm">2025</span>
                                    </div>
                                    <p className="text-sm italic">Pace University</p>
                                </div>
                            </div>

                            {/* Loading Overlay */}
                            {isCompiling && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm font-medium text-gray-900">Compiling PDF...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
