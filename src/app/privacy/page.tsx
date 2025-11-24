export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                    <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-indigo max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                        <p className="text-gray-700 mb-4">
                            We collect information you provide directly to us, including name, email address, and resume content when you use our services.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                        <p className="text-gray-700 mb-4">
                            We use the information we collect to provide, maintain, and improve our services, process your requests, and communicate with you.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Data Storage and Security</h2>
                        <p className="text-gray-700 mb-4">
                            Your data is stored securely on Google Cloud Platform. We implement appropriate technical and organizational measures to protect your personal information.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Third-Party Services</h2>
                        <p className="text-gray-700 mb-4">
                            We use third-party services including Google OAuth, GitHub OAuth, and AI providers to deliver our services. These services have their own privacy policies.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies and Tracking</h2>
                        <p className="text-gray-700 mb-4">
                            We use cookies and similar tracking technologies to track activity on our service and hold certain information for authentication purposes.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
                        <p className="text-gray-700 mb-4">
                            We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
                        <p className="text-gray-700 mb-4">
                            You have the right to access, update, or delete your personal information. Contact us to exercise these rights.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
                        <p className="text-gray-700 mb-4">
                            Our service is not directed to individuals under 13. We do not knowingly collect personal information from children.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to This Policy</h2>
                        <p className="text-gray-700 mb-4">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
                        <p className="text-gray-700 mb-4">
                            If you have questions about this Privacy Policy, contact us at: <a href="mailto:privacy@aplifyai.com" className="text-indigo-600 hover:underline">privacy@aplifyai.com</a>
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
