'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  BoltIcon, 
  CheckCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Spotify'];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6F7F2] via-white to-[#FEF9E7] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-[#E6F7F2] via-white to-[#FEF9E7] pt-20 pb-32">
        {/* Static Background Elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-300 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary-300 rounded-full opacity-20 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-160px)]">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-soft mb-6 border border-primary-100">
                <SparklesIcon className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-semibold text-gray-900">AI-Powered Career Assistant</span>
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              >
                No More <span className="text-primary-500">Solo</span> Job Hunting
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed"
              >
                Get matched jobs, tailored resume, and recommended insider connections in <span className="font-semibold text-primary-600">less than 1 minute!</span>
              </motion.p>

              <motion.div variants={fadeInUp} className="flex gap-4 mb-12 flex-wrap">
                <Link
                  href="/signup"
                  className="group px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-medium hover:shadow-strong hover:-translate-y-1 flex items-center gap-2"
                >
                  Try AplifyAI for Free
                  <BoltIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Link>
                <Link
                  href="#services"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-soft border-2 border-gray-200 hover:border-primary-500"
                >
                  See How It Works
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
                {[
                  { icon: UserGroupIcon, number: '520,000+', label: 'Happy Users' },
                  { icon: BriefcaseIcon, number: '8M+', label: 'Total Jobs' },
                  { icon: BuildingOffice2Icon, number: '400k+', label: 'New Jobs Daily' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-medium transition-all">
                    <stat.icon className="w-8 h-8 text-primary-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-strong p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">AI Match Score</div>
                      <div className="text-sm text-gray-600">Senior Software Engineer</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {['Technical Skills', 'Experience', 'Culture Fit'].map((skill, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">{skill}</span>
                          <span className="text-primary-600 font-semibold">{[95, 88, 92][idx]}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${[95, 88, 92][idx]}%` }}
                            transition={{ delay: 0.5 + idx * 0.2, duration: 1 }}
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all">
                      Apply Now
                    </button>
                    <button className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                      Save
                    </button>
                  </div>
                </div>

                {/* Floating Cards */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -left-8 top-1/4 bg-white rounded-2xl shadow-medium p-4 w-48"
                >
                  <div className="text-sm font-semibold text-gray-900 mb-2">✨ Resume Optimized</div>
                  <div className="text-xs text-gray-600">+35% keyword match</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="absolute -right-8 bottom-1/4 bg-white rounded-2xl shadow-medium p-4 w-48"
                >
                  <div className="text-sm font-semibold text-gray-900 mb-2">🎯 Insider Found</div>
                  <div className="text-xs text-gray-600">3 mutual connections</div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Trusted Companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-20"
          >
            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Trusted by job seekers at</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              {companies.map((company, idx) => (
                <div key={idx} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Why Choose AplifyAI?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing the job search with AI-powered tools that help you land interviews 4X faster
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BoltIcon,
                title: 'AI-Powered Matching',
                description: 'Our advanced AI analyzes job descriptions and matches you with roles where you have the highest success rate.',
                gradient: 'from-primary-50 to-primary-100',
                iconBg: 'bg-primary-500'
              },
              {
                icon: CheckCircleIcon,
                title: 'Time-Saving Automation',
                description: 'Generate professional resumes and cover letters in minutes. Focus on preparing for interviews, not paperwork.',
                gradient: 'from-secondary-50 to-secondary-100',
                iconBg: 'bg-secondary-500'
              },
              {
                icon: SparklesIcon,
                title: 'Proven Results',
                description: 'Join 520,000+ job seekers who have successfully landed their dream jobs using our platform.',
                gradient: 'from-primary-50 to-secondary-50',
                iconBg: 'bg-primary-600'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-br ${feature.gradient} p-8 rounded-3xl hover:scale-105 transition-all duration-300`}
              >
                <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-medium`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-br from-[#E6F7F2] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">AI Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed in your job search, powered by cutting-edge AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: DocumentTextIcon,
                title: 'AI Resume Builder',
                description: 'Create ATS-friendly resumes tailored to specific job descriptions. Get professional quality in minutes, not hours.',
                features: ['Keyword optimization', 'ATS compatibility', 'Multiple templates', 'Real-time scoring']
              },
              {
                icon: EnvelopeIcon,
                title: 'Cover Letter Generator',
                description: 'Generate compelling cover letters that showcase your passion and perfectly match the role requirements.',
                features: ['Personalized content', 'Company research', 'Tone adjustment', 'One-click generation']
              },
              {
                icon: ClipboardDocumentListIcon,
                title: 'Job Tracker',
                description: 'Track applications, interviews, and follow-ups in one organized dashboard. Never miss an opportunity.',
                features: ['Application timeline', 'Interview prep', 'Follow-up reminders', 'Status tracking']
              },
              {
                icon: ChartBarIcon,
                title: 'Analytics Dashboard',
                description: 'Track your job search progress with insights and analytics to continuously improve your success rate.',
                features: ['Success metrics', 'Application insights', 'Match scoring', 'Performance trends']
              },
              {
                icon: AdjustmentsHorizontalIcon,
                title: 'Keyword Optimization',
                description: 'Automatically optimize your resume with keywords from job descriptions for ATS systems.',
                features: ['Smart keyword matching', 'Density analysis', 'Competitive insights', 'Auto-suggestions']
              },
              {
                icon: BeakerIcon,
                title: 'Insider Connections',
                description: 'Network like a pro with recommended insider connections. Connect, get referrals, and land interviews!',
                features: ['Alumni network', 'Referral paths', 'Cold outreach templates', '4X interview rate']
              }
            ].map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-soft hover:shadow-strong transition-all duration-300 group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-medium">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircleIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all shadow-strong hover:shadow-xl hover:-translate-y-1 text-lg"
            >
              Start Matching
              <BoltIcon className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for you. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          <div className="flex justify-center gap-8 max-w-5xl mx-auto flex-wrap">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all w-full max-w-sm"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Free</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 text-base ml-1">/month</span>
              </div>
              <p className="text-gray-600 text-sm mb-8">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                {['1 Resume', 'Basic templates', 'PDF export', 'Job search tracking'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full px-6 py-3 bg-gray-50 text-gray-900 font-medium rounded-lg text-center hover:bg-gray-100 transition-all border border-gray-200"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all w-full max-w-sm"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enterprise</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">Custom</span>
              </div>
              <p className="text-gray-600 text-sm mb-8">For teams and organizations</p>
              <ul className="space-y-3 mb-8">
                {['Everything in Pro', 'Team collaboration', 'Custom integrations', 'Dedicated support', 'Training sessions', 'SLA guarantee'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="#contact"
                className="block w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg text-center hover:bg-gray-800 transition-all"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-[#E6F7F2] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">520,000+ Happy Users' Love</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful job seekers who landed their dream roles
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I am able to find more relevant jobs faster. Since using AplifyAI I have tripled my interview rate. I am truly impressed.",
                name: "Sarah Chen",
                role: "Senior Software Engineer",
                company: "Google",
                avatar: "SC"
              },
              {
                quote: "Thanks to this platform I've landed a few interviews and accepted an offer within 1 week of interviewing!!!",
                name: "Michael Rodriguez",
                role: "Product Manager",
                company: "Microsoft",
                avatar: "MR"
              },
              {
                quote: "You must check out AplifyAI. It has been saving me hours in my job search! I'm blown away at how easy it is to use!",
                name: "Emily Taylor",
                role: "Marketing Director",
                company: "Meta",
                avatar: "ET"
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-soft hover:shadow-medium transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-primary-600 font-semibold">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-50 to-white p-8 md:p-12 rounded-3xl shadow-medium"
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Sales & Pricing</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none resize-none"
                  placeholder="Tell us more about your inquiry..."
                  required
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  className="mt-1 w-5 h-5 text-primary-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary-200"
                  required
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  I agree to receive communications from AplifyAI and understand that I can unsubscribe at any time. *
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all shadow-medium hover:shadow-strong hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
              >
                Send Message
                <EnvelopeIcon className="w-6 h-6" />
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: EnvelopeIcon,
                title: 'Email Us',
                content: 'support@aplifyai.com',
                link: 'mailto:support@aplifyai.com'
              },
              {
                icon: UserGroupIcon,
                title: 'Sales Inquiries',
                content: 'sales@aplifyai.com',
                link: 'mailto:sales@aplifyai.com'
              },
              {
                icon: BuildingOffice2Icon,
                title: 'Office',
                content: 'San Francisco, CA',
                link: null
              }
            ].map((info, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-soft text-center"
              >
                <info.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <div className="font-semibold text-gray-900 mb-1">{info.title}</div>
                {info.link ? (
                  <a href={info.link} className="text-primary-600 hover:text-primary-700 transition-colors">
                    {info.content}
                  </a>
                ) : (
                  <div className="text-gray-600">{info.content}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-500 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-300 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-2xl text-primary-100 mb-10 leading-relaxed">
              Join 520,000+ successful job seekers who found their perfect role with AplifyAI
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/signup"
                className="group px-12 py-5 bg-white text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-strong hover:shadow-xl hover:-translate-y-1 text-lg inline-flex items-center gap-3"
              >
                Get Started for Free
                <BoltIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link
                href="#contact"
                className="px-12 py-5 bg-transparent text-white font-bold rounded-2xl hover:bg-white/10 transition-all border-2 border-white text-lg"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
