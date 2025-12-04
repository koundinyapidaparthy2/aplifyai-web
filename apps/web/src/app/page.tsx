'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Prevent hydration mismatch by not rendering animations on server
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-indigo-600">AplifyAI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create AI-powered resumes and cover letters that get you hired.
              Stand out from the crowd with professionally crafted documents.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-600"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">AplifyAI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create AI-powered resumes and cover letters that get you hired.
            Stand out from the crowd with professionally crafted documents.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-600"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Services</h3>
            <p className="text-gray-600 mb-4">
              Leverage advanced AI to create tailored resumes and cover letters that match job descriptions perfectly.
            </p>
            <Link href="/services" className="text-indigo-600 font-medium hover:text-indigo-500">
              Explore Services &rarr;
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Pricing</h3>
            <p className="text-gray-600 mb-4">
              Choose from our flexible plans, including pay-as-you-go options. No hidden fees.
            </p>
            <Link href="/pricing" className="text-green-600 font-medium hover:text-green-500">
              View Pricing &rarr;
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">About Us</h3>
            <p className="text-gray-600 mb-4">
              We're on a mission to democratize career success with cutting-edge technology.
            </p>
            <Link href="/about" className="text-purple-600 font-medium hover:text-purple-500">
              Learn More &rarr;
            </Link>
          </motion.div>
        </div>

        {/* How it Works Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How AplifyAI Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Three simple steps to your dream job.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Your Resume</h3>
              <p className="text-gray-600">Start by uploading your existing resume or create a profile from scratch. We'll analyze your skills and experience.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paste Job Description</h3>
              <p className="text-gray-600">Found a job you like? Paste the job description. Our AI will identify the keywords and requirements.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get Tailored Documents</h3>
              <p className="text-gray-600">Instantly generate a tailored resume and cover letter that highlights why you are the perfect fit.</p>
            </motion.div>
          </div>
        </div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 bg-indigo-900 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="px-6 py-16 sm:px-12 sm:py-24 lg:py-32 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-12">
              Trusted by job seekers everywhere
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-indigo-800 p-8 rounded-xl">
                <p className="text-indigo-100 text-lg italic mb-6">"I applied to 50 jobs with no response. After using AplifyAI to tailor my resume, I got 3 interviews in one week! It's a game changer."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                  <div className="ml-4">
                    <p className="text-white font-bold">John D.</p>
                    <p className="text-indigo-300 text-sm">Software Engineer</p>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-800 p-8 rounded-xl">
                <p className="text-indigo-100 text-lg italic mb-6">"The cover letter generator is amazing. It sounds exactly like me but more professional. Saved me hours of writing."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">SM</div>
                  <div className="ml-4">
                    <p className="text-white font-bold">Sarah M.</p>
                    <p className="text-indigo-300 text-sm">Marketing Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-32 mb-20">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Is AplifyAI free to use?</h3>
              <p className="text-gray-600">Yes, we offer a free plan that includes basic resume generation and templates. You can upgrade for unlimited access and premium features.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">How does the AI tailoring work?</h3>
              <p className="text-gray-600">Our AI analyzes the job description you provide and matches it against your profile. It then rewrites your resume bullet points to emphasize the most relevant skills and experiences.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Can I download my resume as a PDF?</h3>
              <p className="text-gray-600">Absolutely! All resumes and cover letters can be downloaded as professionally formatted PDF files, ready to submit.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
            Ready to land your next job?
          </h2>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg text-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
