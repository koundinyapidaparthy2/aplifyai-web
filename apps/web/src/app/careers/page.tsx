import Link from 'next/link';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function CareersPage() {
    return (
        <div className="bg-white min-h-screen py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-[#3DCEA5] tracking-wide uppercase">Careers</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Join our mission
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        We're building the future of job search. While we don't have specific openings right now, we're always looking for talented individuals to join our team.
                    </p>
                </div>

                <div className="mt-16 max-w-3xl mx-auto">
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                        <div className="px-6 py-8 sm:p-10">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">General Application</h3>
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className="shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] block w-full sm:text-sm border-gray-300 rounded-md px-4 py-3 border"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            className="shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] block w-full sm:text-sm border-gray-300 rounded-md px-4 py-3 border"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                                        LinkedIn Profile URL
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="url"
                                            name="linkedin"
                                            id="linkedin"
                                            className="shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] block w-full sm:text-sm border-gray-300 rounded-md px-4 py-3 border"
                                            placeholder="https://linkedin.com/in/johndoe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="projects" className="block text-sm font-medium text-gray-700">
                                        Best Projects / Portfolio
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="projects"
                                            name="projects"
                                            rows={3}
                                            className="shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] block w-full sm:text-sm border-gray-300 rounded-md px-4 py-3 border"
                                            placeholder="Share links to your best work or describe projects you're proud of..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                                        Why do you want to join AplifyAI?
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="reason"
                                            name="reason"
                                            rows={4}
                                            className="shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] block w-full sm:text-sm border-gray-300 rounded-md px-4 py-3 border"
                                            placeholder="Tell us about your motivation and what you can bring to the team..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3DCEA5] hover:bg-[#34b38f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3DCEA5] transition-colors"
                                    >
                                        Submit Application
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
