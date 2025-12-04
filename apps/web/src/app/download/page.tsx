export default function DownloadPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Get <span className="text-indigo-600">AplifyAI</span> for Chrome
                    </h1>
                    <p className="text-xl text-gray-600">
                        Your AI Copilot for Job Search. Detect jobs, tailor resumes, and track applications instantly.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="text-center mb-10">
                        <div className="inline-block p-4 rounded-full bg-indigo-100 mb-4">
                            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manual Installation</h2>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            While we wait for Chrome Web Store approval, you can install the extension manually.
                            It's safe, secure, and takes less than a minute.
                        </p>

                        <a
                            href="https://storage.googleapis.com/aplifyai-assets-jobseek-459701/extension-production.zip"
                            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Extension (ZIP)
                        </a>
                        <p className="mt-2 text-sm text-gray-500">Version 1.1.0 • 2.5 MB</p>
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">How to Install</h3>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="relative">
                                <div className="absolute -left-4 -top-4 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">1</div>
                                <h4 className="font-semibold text-gray-900 mb-2">Unzip the File</h4>
                                <p className="text-sm text-gray-600">
                                    Extract the downloaded <code>extension-production.zip</code> file. You will see a <code>dist</code> folder inside.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-4 -top-4 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">2</div>
                                <h4 className="font-semibold text-gray-900 mb-2">Open Extensions</h4>
                                <p className="text-sm text-gray-600">
                                    Go to <code>chrome://extensions</code> in your browser and enable <strong>"Developer mode"</strong> in the top right.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-4 -top-4 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">3</div>
                                <h4 className="font-semibold text-gray-900 mb-2">Load Unpacked</h4>
                                <p className="text-sm text-gray-600">
                                    Click <strong>"Load unpacked"</strong> and select the <code>dist</code> folder you extracted. That's it!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="text-center mb-10">
                        <div className="inline-block p-4 rounded-full bg-indigo-100 mb-4">
                            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Desktop App</h2>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Get the full power of AplifyAI on your desktop. Offline access, system tray integration, and more.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">macOS</h3>
                                <p className="text-sm text-gray-600 mb-4">For Apple Silicon (M1/M2/M3)</p>
                                <a
                                    href="https://storage.googleapis.com/aplifyai-assets-jobseek-459701/desktop/AplifyAI-1.0.0-arm64.dmg"
                                    className="block w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-center"
                                >
                                    Download for Mac
                                </a>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6 opacity-60">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Windows</h3>
                                <p className="text-sm text-gray-600 mb-4">Coming Soon</p>
                                <button
                                    disabled
                                    className="block w-full px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed text-center"
                                >
                                    Download for Windows
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-900 rounded-2xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Why AplifyAI?</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="p-4 bg-indigo-800 rounded-lg">
                            <div className="text-2xl mb-2">🚀</div>
                            <h3 className="font-bold mb-1">Instant Tailoring</h3>
                            <p className="text-indigo-200 text-sm">Generate resumes matched to job descriptions in seconds.</p>
                        </div>
                        <div className="p-4 bg-indigo-800 rounded-lg">
                            <div className="text-2xl mb-2">📊</div>
                            <h3 className="font-bold mb-1">Smart Tracking</h3>
                            <p className="text-indigo-200 text-sm">Automatically track every application status.</p>
                        </div>
                        <div className="p-4 bg-indigo-800 rounded-lg">
                            <div className="text-2xl mb-2">🔒</div>
                            <h3 className="font-bold mb-1">Privacy First</h3>
                            <p className="text-indigo-200 text-sm">Your data stays yours. We never sell your info.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-600 mb-4">
                        Already installed?{' '}
                        <a href="/dashboard" className="text-indigo-600 hover:underline font-medium">
                            Go to Dashboard
                        </a>
                    </p>
                    <p className="text-sm text-gray-500">
                        Need help? <a href="mailto:support@aplifyai.com" className="text-indigo-600 hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
