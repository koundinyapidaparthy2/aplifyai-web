import Link from 'next/link';
import { FaChrome, FaApple, FaWindows, FaCloudDownloadAlt, FaRocket, FaChartPie, FaLock } from 'react-icons/fa';

export default function DownloadPage() {
    return (
        <div className="min-h-screen relative overflow-hidden py-24 sm:py-32">
            {/* Background Decor from Globals */}
            <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-[#3DCEA5]/5 via-transparent to-transparent -z-10 pointer-events-none" />
            <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-[#3DCEA5]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute top-60 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3DCEA5]/10 text-[#3DCEA5] font-medium text-sm mb-6 border border-[#3DCEA5]/20">
                        v1.1.0 Now Available
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                        Get <span className="text-gradient-primary">AplifyAI</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Your AI Copilot for Job Search. Detect jobs, tailor resumes, and track applications instantly.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
                    {/* Manual Installation Card */}
                    <div className="glass-card p-8 sm:p-10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaChrome className="w-32 h-32 text-[#3DCEA5]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-[#3DCEA5]/10 flex items-center justify-center mb-8">
                                <FaCloudDownloadAlt className="w-8 h-8 text-[#3DCEA5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Manual Installation</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                While we wait for Chrome Web Store approval, you can install the extension manually.
                                It's safe, secure, and takes less than a minute.
                            </p>

                            <a
                                href="https://storage.googleapis.com/aplifyai-assets-jobseek-459701/extension-production.zip"
                                className="btn-primary w-full inline-flex items-center justify-center gap-2 mb-4"
                            >
                                <FaChrome className="w-5 h-5" />
                                Download Extension (ZIP)
                            </a>
                            <p className="text-xs text-center text-gray-400">Version 1.1.0 • 2.5 MB</p>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Quick Install Guide</h3>
                                <ul className="space-y-4 text-sm text-gray-600">
                                    <li className="flex gap-3">
                                        <div className="flex-none w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">1</div>
                                        <span>Unzip the downloaded file. You'll see a <code>dist</code> folder.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="flex-none w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">2</div>
                                        <span>Go to <code>chrome://extensions</code> and enable <strong>Developer mode</strong>.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="flex-none w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">3</div>
                                        <span>Click <strong>Load unpacked</strong> and select the <code>dist</code> folder.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Desktop App Card */}
                    <div className="glass-card p-8 sm:p-10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FaRocket className="w-32 h-32 text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-8">
                                <FaRocket className="w-8 h-8 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Desktop App</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Get the full power of AplifyAI on your desktop. Offline access, system tray integration, and native notifications.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl border border-gray-200 bg-white/50 hover:border-[#3DCEA5] transition-colors cursor-pointer group/mac">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 font-bold text-gray-900">
                                            <FaApple className="w-5 h-5 text-gray-800" />
                                            macOS
                                        </div>
                                        <span className="text-xs font-medium text-[#3DCEA5] bg-[#3DCEA5]/10 px-2 py-1 rounded-full">Apple Silicon</span>
                                    </div>
                                    <a
                                        href="https://storage.googleapis.com/aplifyai-assets-jobseek-459701/desktop/AplifyAI-1.0.0-arm64.dmg"
                                        className="text-sm text-gray-500 hover:text-[#3DCEA5] transition-colors flex items-center gap-1"
                                    >
                                        Download .dmg <span aria-hidden="true">&rarr;</span>
                                    </a>
                                </div>

                                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 font-bold text-gray-500">
                                            <FaWindows className="w-5 h-5" />
                                            Windows
                                        </div>
                                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Coming Soon</span>
                                    </div>
                                    <span className="text-sm text-gray-400">Join waitlist</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features / Why Section */}
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-900">Why install the app?</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <FaRocket className="w-6 h-6 text-[#3DCEA5]" />,
                                title: "Instant Tailoring",
                                desc: "Generate resumes matched to job descriptions in seconds without leaving the page."
                            },
                            {
                                icon: <FaChartPie className="w-6 h-6 text-purple-500" />,
                                title: "Smart Tracking",
                                desc: "The extension automatically detects when you apply and tracks the status for you."
                            },
                            {
                                icon: <FaLock className="w-6 h-6 text-blue-500" />,
                                title: "Privacy First",
                                desc: "Your data stays yours. We process everything locally or securely in the cloud."
                            }
                        ].map((item, i) => (
                            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-20 border-t border-gray-100 pt-10">
                    <p className="text-gray-600 mb-4">
                        Already installed?{' '}
                        <Link href="/dashboard" className="text-[#3DCEA5] hover:text-[#34b38f] font-bold transition-colors">
                            Go to Dashboard &rarr;
                        </Link>
                    </p>
                    <p className="text-sm text-gray-400">
                        Need help? <a href="mailto:support@aplifyai.com" className="text-gray-500 hover:text-gray-700 underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
