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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6F7F2] via-white to-[#FEF9E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-5xl font-bold text-text-primary">
            It's Easy to Find your <span className="text-primary-500">Dream Job</span>
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F7F2] via-white to-[#FEF9E7] relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block bg-[#FEF9E7] px-4 py-2 rounded-full text-sm font-medium text-text-primary mb-6 shadow-soft">
              Convenient way to connect potential employees and HR managers
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
              It's Easy to Find your <span className="text-primary-500">Dream Job</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-xl">
              Explore thousands of jobs in one place and get the job of your dream
            </p>
            <div className="flex gap-4 mb-12 flex-wrap">
              <Link
                href="/signup"
                className="px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-medium hover:-translate-y-1"
              >
                Find a Job
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white text-text-primary font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-soft border border-gray-200"
              >
                Play Video
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="bg-white p-4 rounded-xl shadow-soft">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-text-primary">20k+</div>
                <div className="text-sm text-text-secondary">People got hired</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-soft">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-text-primary">2k+</div>
                <div className="text-sm text-text-secondary">Companies</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-soft">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-text-primary">50k+</div>
                <div className="text-sm text-text-secondary">Job Vacancy</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative hidden md:flex items-center justify-center"
          >
            <div className="relative w-full h-[500px] bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center overflow-hidden shadow-strong">
              <div className="absolute inset-0 bg-white opacity-40"></div>
              <div className="relative z-10 text-center p-8">
                <div className="w-32 h-32 bg-primary-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-strong">
                  <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-medium inline-block mb-4">
                  <p className="text-sm font-semibold">Found a dream company</p>
                  <div className="flex gap-2 mt-2 justify-center">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-8 h-8 bg-primary-400 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* How it Works */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-4">How AplifyAI Works</h2>
          <p className="text-xl text-center text-text-secondary mb-16">Three simple steps to your dream job</p>
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Upload Your Resume</h3>
              <p className="text-text-secondary">Start by uploading your existing resume or create a profile from scratch.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Paste Job Description</h3>
              <p className="text-text-secondary">Found a job you like? Paste the job description and let AI analyze it.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Get Tailored Documents</h3>
              <p className="text-text-secondary">Instantly generate a tailored resume and cover letter.</p>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 mb-20 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-6">Ready to land your next job?</h2>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all shadow-medium hover:-translate-y-1"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
