export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
                    <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-indigo max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-700 mb-4">
                            By accessing and using AplifyAI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
                        <p className="text-gray-700 mb-4">
                            Permission is granted to temporarily download one copy of the materials on AplifyAI for personal, non-commercial transitory viewing only.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Service Description</h2>
                        <p className="text-gray-700 mb-4">
                            AplifyAI provides AI-powered resume and cover letter generation services. We reserve the right to modify or discontinue the service at any time.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. User Accounts</h2>
                        <p className="text-gray-700 mb-4">
                            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Payment Terms</h2>
                        <p className="text-gray-700 mb-4">
                            AplifyAI operates on a pay-as-you-go model. Prices are subject to change with notice. All payments are non-refundable unless otherwise stated.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
                        <p className="text-gray-700 mb-4">
                            You retain ownership of the content you create using our service. AplifyAI retains ownership of the platform and underlying technology.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Prohibited Uses</h2>
                        <p className="text-gray-700 mb-4">
                            You may not use the service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
                        <p className="text-gray-700 mb-4">
                            AplifyAI shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Information</h2>
                        <p className="text-gray-700 mb-4">
                            For questions about these Terms and Conditions, please contact us at: <a href="mailto:support@aplifyai.com" className="text-indigo-600 hover:underline">support@aplifyai.com</a>
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
