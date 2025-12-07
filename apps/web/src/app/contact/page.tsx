'use client';

import { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSuccess(true);
        setLoading(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="bg-gray-50 min-h-screen py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Contact Us</h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Have questions? We'd love to hear from you.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Get in touch</h3>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <FaEnvelope className="flex-shrink-0 w-6 h-6 text-[#3DCEA5] mt-1" />
                                <div className="ml-4">
                                    <p className="text-base font-medium text-gray-900">Email</p>
                                    <p className="mt-1 text-gray-500">support@aplifyai.com</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <FaPhone className="flex-shrink-0 w-6 h-6 text-[#3DCEA5] mt-1" />
                                <div className="ml-4">
                                    <p className="text-base font-medium text-gray-900">Phone</p>
                                    <p className="mt-1 text-gray-500">+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="flex-shrink-0 w-6 h-6 text-[#3DCEA5] mt-1" />
                                <div className="ml-4">
                                    <p className="text-base font-medium text-gray-900">Office</p>
                                    <p className="mt-1 text-gray-500">
                                        123 Innovation Drive<br />
                                        San Francisco, CA 94107
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                                    Message sent successfully! We'll get back to you soon.
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] sm:text-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] sm:text-sm p-2 border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] sm:text-sm p-2 border"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#3DCEA5] focus:border-[#3DCEA5] sm:text-sm p-2 border"
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-[#3DCEA5] hover:bg-[#34b38f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3DCEA5] disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
