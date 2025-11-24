export default function DownloadPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Download <span className="text-indigo-600">AplifyAI</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Get the desktop app for offline access and enhanced performance
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">macOS</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Apple Silicon</h3>
                            <p className="text-sm text-gray-600 mb-4">For M1, M2, M3 Macs</p>
                            <a
                                href="https://github.com/koundinyapidaparthy2/jobseek-chromeextension/releases/download/v1.0.0/AplifyAI-1.0.0-arm64.dmg"
                                className="block w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-center"
                            >
                                Download (ARM64)
                            </a>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Intel</h3>
                            <p className="text-sm text-gray-600 mb-4">For Intel-based Macs</p>
                            <a
                                href="https://github.com/koundinyapidaparthy2/jobseek-chromeextension/releases/download/v1.0.0/AplifyAI-1.0.0-x64.dmg"
                                className="block w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-center"
                            >
                                Download (x64)
                            </a>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Installation Note</h4>
                        <p className="text-sm text-yellow-700">
                            macOS may show a security warning for apps from unidentified developers. 
                            To open: Right-click the app → select "Open" → click "Open" in the dialog.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Installation Steps</h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                            <li>Download the appropriate DMG file for your Mac</li>
                            <li>Open the downloaded DMG file</li>
                            <li>Drag AplifyAI to your Applications folder</li>
                            <li>Launch AplifyAI from your Applications folder</li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6 opacity-60">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Windows</h3>
                            <p className="text-sm text-gray-600 mb-4">Windows 10 and later</p>
                            <button
                                disabled
                                className="block w-full px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed text-center"
                            >
                                Coming Soon
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6 opacity-60">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Linux</h3>
                            <p className="text-sm text-gray-600 mb-4">Ubuntu, Fedora, etc.</p>
                            <button
                                disabled
                                className="block w-full px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed text-center"
                            >
                                Coming Soon
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Desktop App Features</h2>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">✓</span>
                            <span>Full offline access to your resumes and cover letters</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">✓</span>
                            <span>Faster performance compared to web app</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">✓</span>
                            <span>Native macOS integration</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">✓</span>
                            <span>System tray support for quick access</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">✓</span>
                            <span>Auto-updates (coming soon)</span>
                        </li>
                    </ul>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-600 mb-4">
                        Prefer to use the web app?{' '}
                        <a href="/" className="text-indigo-600 hover:underline font-medium">
                            Go to Web App
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
